import Decimal from 'decimal.js-light'
import Hashes from 'jshashes'
import Vue from 'vue'
import Vuex from 'vuex'

import Erc20 from '@/models/erc20'
import Coingecko from '@/models/coingecko'

import getters from './getters'

Vue.use(Vuex)

async function postJSON(url, payload) {
    let response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload)
    })
    return await response.json()
}

export default new Vuex.Store({
    state: {
        // defined at setup (perhaps could become properties of App?)
        apiRootUrl: null,
        storeId: null,
        identifier: null,
        pricingCurrency: null,
        amountDue: null,
        paymentSentHandler: null,
        paymentReceivedHandler: null,
        paymentConfirmedHandler: null,
        paymentCanceledHandler: null,
        contentCopiedHandler: null,
        errorHandler: null,

        // values that do change during runtime
        store: null,
        selectedTokenAddress: null,
        checkout: null,
        checkoutWebsocket: null,
        tokens: {},
        exchangeRates: {},
        blockchainTransferMap: {},
        raidenTransferMap: {}
    },
    getters: getters,
    mutations: {
        setup(state, setupData) {
            let timestamp = new Date().toISOString()

            state.apiRootUrl = setupData.apiRootUrl
            state.storeId = setupData.storeId
            state.pricingCurrency = String(setupData.currency).toUpperCase(),
            state.identifier = setupData.identifier || new Hashes.MD5().hex(timestamp)
            state.amountDue = setupData.amount
            state.paymentSentHandler = setupData.onPaymentSent
            state.paymentReceivedHandler = setupData.onPaymentReceived
            state.paymentConfirmedHandler = setupData.onPaymentConfirmed
            state.paymentCanceledHandler = setupData.onPaymentCanceled
            state.contentCopiedHandler = setupData.onCopyToClipboard
            state.onErrorHandler = setupData.onError
            state.onNotificationHandler = setupData.onNotification
        },
        selectToken(state, token) {
            state.selectedTokenAddress = token.address
        },
        setStore(state, storeData) {
            state.store = storeData
        },
        setToken(state, tokenData) {
            Vue.set(state.tokens, tokenData.address, tokenData)
        },
        setExchangeRate(state, payload) {
            let {token, rate} = payload

            if (token && token.address && rate) {
                Vue.set(state.exchangeRates, token.address, rate)
            }
        },
        setCheckout(state, checkoutData) {
            state.checkout = checkoutData
        },
        setCheckoutWebSocket(state, checkoutWebSocket) {
            state.checkoutWebSocket = checkoutWebSocket
        },
        reset(state) {
            state.checkout = null
            state.checkoutWebsocket = null
            state.selectedTokenAddress = null
            state.blockchainTransferMap = {}
            state.raidenTransferMap = {}
            state.blockchainTransferMap = {}
            state.raidenTransferMap = {}
        },
        registerBlockchainTransfer(state, transferData) {
            if (!transferData || !transferData.identifier) {
                return
            }

            Vue.set(state.blockchainTransferMap, transferData.identifier, transferData)
        }
    },
    actions: {
        async getStore({commit, state}) {
            let storeUrl = `${state.apiRootUrl}/api/stores/${state.storeId}`
            let response = await fetch(storeUrl)
            let storeData = await response.json()
            commit('setStore', storeData)
        },
        async fetchAllTokenData({commit, state, dispatch}) {
            let tokenAddresses = state.store.accepted_currencies
            tokenAddresses.forEach(async function(address) {
                let token = await dispatch('fetchToken', address)
                commit('setToken', token)

                let rate = await dispatch('fetchExchangeRate', token)
                commit('setExchangeRate', {token, rate})
            })
        },
        async fetchToken({state}, tokenAddress) {
            let url = `${state.apiRootUrl}/api/tokens/token/${tokenAddress}`
            let response = await fetch(url)
            return await response.json()
        },
        async fetchExchangeRate({state, dispatch}, token) {
            try {
                if (Erc20.isErc20Token(token)) {
                    return await Coingecko.getTokenRate(token, state.pricingCurrency)
                }
                else {
                    return await Coingecko.getEthereumRate(state.pricingCurrency)
                }
            }
            catch (error) {
                let message = `Failed to get exchange rate for ${token.code}`
                dispatch('handleError', {error, message})
            }
        },
        async reset({commit, state}) {
            if (state && state.checkout && state.checkout.url) {
                await fetch(state.checkout.url, {
                    method: 'DELETE'
                })
            }

            commit('reset')

        },
        async makeCheckout({commit, state, getters, dispatch}, token) {
            let tokenAmountDue = getters.convertToTokenAmount(state.amountDue, token)

            let checkoutUrl = `${state.apiRootUrl}/api/checkout`
            let checkoutData = await postJSON(checkoutUrl, {
                store: state.storeId,
                amount: String(Decimal(tokenAmountDue).toDecimalPlaces(token.decimals)),
                token: token.address,
                external_identifier: state.identifier
            })

            let checkoutWebSocket = new WebSocket(
                `${getters.websocketRootUrl}/checkout/${checkoutData.id}`
            )

            checkoutWebSocket.onmessage = function(evt) {
                let message = JSON.parse(evt.data)
                dispatch('handleCheckoutMessage', message)
            }
            commit('setCheckout', checkoutData)
            commit('setCheckoutWebSocket', checkoutWebSocket)
        },
        async updateCheckout({commit, state}) {
            let checkoutId = state.checkout && state.checkout.id

            if (checkoutId) {
                let checkoutUrl = `${state.apiRootUrl}/api/checkout/${checkoutId}`
                let response = await fetch(checkoutUrl)
                let checkoutData = await response.json()
                commit('setCheckout', checkoutData)
            }
        },
        async makeWeb3Transfer({getters, state, dispatch}) {
            let paymentMethod = getters.paymentRouting
            let tokenAmountDue = getters.tokenAmountDue

            if (!tokenAmountDue) {
                dispatch('handleError', {message: 'Can not determine transfer amount'})
                return
            }

            if (!paymentMethod || !paymentMethod.blockchain){
                dispatch('handleError', {message: 'Transfer via blockchain not possible at the moment'})
                return
            }

            if (!window.ethereum || !window.web3) {
                dispatch('handleError', {message: 'No Web3 Browser available'})
                return
            }

            const w3 = new window.Web3(window.ethereum ? window.ethereum : window.web3.currentProvider)

            if (window.ethereum) {
                try {
                    await window.ethereum.enable();
                } catch (error) {
                    dispatch('handleError', {message: 'Failed to connect to Web3 Wallet'})
                    return
                }
            }

            let token = getters.getToken(state.selectedTokenAddress)
            let current_network_id = w3.version.network

            if (current_network_id != token.network_id) {
                let message = `Web3 Browser connected to network ${current_network_id}, please change to ${token.network_id}.`
                dispatch('handleError', {message: message});
                return
            }

            let tokenWeiDue = getters.getTokenAmountWei(tokenAmountDue, state.selectedTokenAddress)
            let sender = (window.ethereum && window.ethereum.selectedAddress) || w3.eth.defaultAccount
            let recipient = paymentMethod.blockchain

            let transactionData = {
                from: sender
            }

            if (!token.address) {
                // ETH transfer
                transactionData.to = recipient
                transactionData.value = tokenWeiDue
            }
            else {
                transactionData.to = token.address
                transactionData.data = Erc20.makeTransferData(w3, tokenWeiDue, token.address, recipient)
            }

            w3.eth.sendTransaction(transactionData, function(error, tx) {
                if (tx) {
                    dispatch('handleNotification', `Transaction ${tx} was created and sent`)
                }
                if (error) {
                    let message = 'Failed to send transaction'
                    dispatch('handleError', {error, message})
                }
            })
        },
        async pollExchangeRates({commit, dispatch, getters}) {
            getters.allTokens.forEach(async function(token){
                let rate = await dispatch('fetchExchangeRate', token)
                commit('setExchangeRate', {token, rate})
            });
        },
        async handleError({state}, {error, message}) {
            let handler = state.onErrorHandler
            if (handler) {
                handler(error, message)
            }
        },
        async handleNotification({state}, message) {
            let handler = state.onNotificationHandler
            if (handler) {
                handler(message)
            }
        },
        handleCheckoutMessage({dispatch}, message) {
            let {event} = message

            dispatch('updateCheckout')
            switch(event) {
            case 'payment.sent':
                dispatch('handlePaymentSent', message)
                break
            case 'payment.received':
                dispatch('handlePaymentReceived', message)
                break
            case 'payment.confirmed':
                dispatch('handlePaymentConfirmed', message)
                break
            }
        },
        handlePaymentSent({commit, getters, state}, eventMessage){
            let {voucher, token, amount, identifier} = eventMessage

            commit('registerBlockchainTransfer', {
                identifier: identifier,
                token: getters.getToken(token),
                amount: Decimal(amount),
                status: 'pending'
            })

            let handler = state.paymentSentHandler
            if (handler) {
                handler(voucher)
            }
        },
        handlePaymentReceived({commit, getters, state}, eventMessage){
            let {voucher, token, amount, identifier} = eventMessage

            commit('registerBlockchainTransfer', {
                identifier: identifier,
                token: getters.getToken(token),
                amount: Decimal(amount),
                status: 'received'
            })

            let handler = state.paymentReceivedHandler
            if (handler) {
                handler(voucher)
            }
        },
        handlePaymentConfirmed({commit, state, getters, dispatch}, eventMessage){
            let {voucher, token, amount, identifier, payment_method} = eventMessage

            let transferData = {
                identifier: identifier,
                token: getters.getToken(token),
                amount: Decimal(amount),
                status: 'confirmed'
            }

            switch(payment_method) {
            case 'blockchain':
                commit('registerBlockchainTransfer', transferData)
                break
            case 'raiden':
                commit('registerRaidenTransfer', transferData)
                break
            default:
                dispatch('handleError', {message: `Did not expect to receive ${payment_method} payment`})
            }

            let handler = state.paymentConfirmedHandler
            if (handler) {
                handler(voucher)
            }
        },
        handlePaymentCanceled({state}, voucher){
            let handler = state.paymentCanceledHandler
            if (handler) {
                handler(voucher)
            }
        }
    },
    modules: {
    }
})
