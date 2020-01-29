import Decimal from 'decimal.js-light'
import Hashes from 'jshashes'
import Vue from 'vue'
import Vuex from 'vuex'


import Erc20 from './erc20'
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

        // values that do change during runtime
        store: null,
        selectedTokenCode: null,
        checkout: null,
        checkoutWebsocket: null,
        tokens: {},
        exchangeRates: {},
        blockchainTransferMap: {},
        raidenTransferMap: {},
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
        },
        selectToken(state, token) {
            state.selectedTokenCode = token
        },
        setStore(state, storeData) {
            state.store = storeData
        },
        setToken(state, tokenData) {
            Vue.set(state.tokens, tokenData.code, tokenData)
        },
        setExchangeRate(state, exchangeRateData) {
            Vue.set(state.exchangeRates, exchangeRateData.token, exchangeRateData)
        },
        setCheckout(state, checkoutData) {
            state.checkout = checkoutData
        },
        setCheckoutWebSocket(state, checkoutWebSocket) {
            state.checkoutWebSocket = checkoutWebSocket
        },
        reset(state) {
            state.checkout = null
            state.selectedTokenCode = null
        },
        registerBlockchainTransfer(state, transferData) {
            if (!transferData || !transferData.identifier) {
                return
            }
            Vue.set(state.blockchainTransferMap, transferData.identifier, transferData)
        }
    },
    actions: {
        async copyToClipboard({state}, containerElement) {
            let content = containerElement.getAttribute('data-clipboard') || containerElement.textContent
            navigator.clipboard.writeText(content.trim());

            if (state.contentCopiedHandler) {
                state.contentCopiedHander(containerElement)
            }
        },
        async displayErrorMessage(_, message) {
            alert(message)
        },
        async getStore({commit, state}) {
            let storeUrl = `${state.apiRootUrl}/api/stores/${state.storeId}`
            let response = await fetch(storeUrl)
            let storeData = await response.json()
            commit('setStore', storeData)
        },
        async getToken({commit, state}, token) {
            let url = `${state.apiRootUrl}/api/tokens/token/${token}`
            let response = await fetch(url)
            let tokenData = await response.json()
            commit('setToken', tokenData)
        },
        async getExchangeRate({commit, state}, token) {
            let url = `${state.apiRootUrl}/api/tokens/rates/${token}/${state.pricingCurrency}`
            let response = await fetch(url);
            let rate = await response.json()
            commit('setExchangeRate', rate)
        },
        async reset({commit, state}) {
            if (state && state.checkout && state.checkout.url) {
                await fetch(state.checkout.url, {
                    method: 'DELETE'
                })
            }

            commit('reset')

        },
        async makeCheckout({commit, state, getters, dispatch}) {
            let token = getters.getToken(state.selectedTokenCode)
            let tokenAmountDue = getters.convertToTokenAmount(state.amountDue, state.selectedTokenCode)

            let checkoutUrl = `${state.apiRootUrl}/api/checkout`
            let checkoutData = await postJSON(checkoutUrl, {
                store: state.storeId,
                amount: String(Decimal(tokenAmountDue).toDecimalPlaces(token.decimals)),
                currency: state.selectedTokenCode,
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
        async makeWeb3Transfer({commit, getters, state, dispatch}) {
            let paymentMethod = getters.paymentRouting
            let tokenAmountDue = getters.tokenAmountDue

            if (!tokenAmountDue) {
                dispatch('displayErrorMessage', 'Can not determine transfer amount')
                return
            }

            if (!paymentMethod || !paymentMethod.blockchain){
                dispatch('displayErrorMessage', 'Transfer via blockchain not possible at the moment')
                return
            }

            if (!window.ethereum || !window.web3) {
                dispatch('displayErrorMessage', 'No Web3 Browser available')
                return
            }

            const w3 = new window.Web3(window.ethereum ? window.ethereum : window.web3.currentProvider)

            if (window.ethereum) {
                try {
                    await window.ethereum.enable();
                } catch (error) {
                    dispatch('displayErrorMessage', 'Failed to connect to Web3 Wallet')
                    return
                }
            }

            let token = getters.getToken(state.selectedTokenCode)
            let current_network_id = w3.version.network

            if (current_network_id != token.network_id) {
                let message = `Web3 Browser connected to network ${current_network_id}, please change to ${token.network_id}.`
                dispatch('displayErrorMessage', message);
                return
            }

            let tokenWeiDue = getters.getTokenAmountWei(tokenAmountDue, state.selectedTokenCode)
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
                    commit('registerBlockchainTransfer', {
                        identifier: tx,
                        token: state.selectedTokenCode,
                        status: 'sent'
                    })
                }
                if (error) {
                    dispatch('notifyTransactionError', error)
                }
            })
        },
        async notifyTransactionError(_, transactionError) {
            console.error(transactionError)
        },
        async pollExchangeRates({dispatch, getters}) {
            getters.acceptedTokens.forEach(async function(token){
                await dispatch('getExchangeRate', token)
            });
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
        handlePaymentSent({commit, state}, eventMessage){
            let {voucher, token, amount, identifier} = eventMessage

            let handler = state.paymentSentHandler

            commit('registerBlockchainTransfer', {
                identifier: identifier,
                token: token,
                amount: Decimal(amount),
                status: 'pending'
            })

            if (handler) {
                handler(voucher)
            }
        },
        handlePaymentReceived({commit, state}, eventMessage){
            let {voucher, token, amount, identifier} = eventMessage

            commit('registerBlockchainTransfer', {
                identifier: identifier,
                token: token,
                amount: Decimal(amount),
                status: 'received'
            })

            let handler = state.paymentReceivedHandler
            if (handler) {
                handler(voucher)
            }
        },
        handlePaymentConfirmed({commit, state, dispatch}, eventMessage){
            let {voucher, token, amount, identifier, payment_method} = eventMessage

            let transferData = {
                identifier: identifier,
                token: token,
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
                dispatch('displayErrorMessage', `Did not expect to receive ${payment_method} payment`)
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
