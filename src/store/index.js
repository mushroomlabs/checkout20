import Hashes from 'jshashes'
import Vue from 'vue'
import Vuex from 'vuex'

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
        selectedToken: null,
        checkout: null,
        checkoutWebsocket: null,
        tokens: {},
        exchangeRates: {}
    },
    getters: {
        acceptedTokens: (state) => {
            return (state.store && state.store.accepted_currencies) || []
        },
        paymentOrder: (state) => {
            let now = new Date()
            let checkout = state.checkout
            let payment_method = checkout && checkout.payment_method
            let isFinalized = !checkout || checkout.status != "requested"
            let expirationTime = payment_method && new Date(payment_method.expiration_time)

            let isExpired = isFinalized || (expirationTime && expirationTime < now)

            return checkout && {
                token: checkout.currency,
                tokenAmount: checkout.amount,
                identifier: checkout.external_identifier,
                status: checkout.status,
                createdTime: new Date(checkout.created),
                expirationTime: expirationTime,
                isExpired: isExpired,
                isFinalized: isFinalized
            }
        },
        paymentOrderExpirationTime: (_, getters) => {
            return getters.paymentOrder.expirationTime
        },
        paymentOrderStatus: (_, getters) => {
            return getters.paymentOrder.status
        },
        paymentRouting: (state) => {
            let checkout = state.checkout
            let payment_method = checkout && checkout.payment_method
            return payment_method && {
                expirationTime: new Date(payment_method.expiration_time),
                blockchain: payment_method.blockchain,
                identifier: payment_method.identifier,
                raiden: payment_method.raiden
            }
        },
        getExchangeRate: (state) => (tokenCode) => {
            let rateData = state.exchangeRates[tokenCode]
            return rateData && rateData.rate
        },
        getTokenAmountDue: (state, getters) => (tokenCode) => {
            let exchangeRate = getters.getExchangeRate(tokenCode)
            return exchangeRate && (parseFloat(state.amountDue) / parseFloat(exchangeRate))
        },
        getToken: (state) => (tokenCode) => {
            return state.tokens[tokenCode]
        },
        amountFormatted: (state) => {
            let formatter = new Intl.NumberFormat(
                [], {style: 'currency', currency: state.pricingCurrency}
            );
            return formatter.format(parseFloat(state.amountDue))
        },
        tokenAmountFormatted: (state, getters) => (tokenCode) => {
            let tokenAmountDue = getters.getTokenAmountDue(tokenCode)
            let formatter = new Intl.NumberFormat([], {maximumSignificantDigits: 6})
            let formattedAmount = formatter.format(tokenAmountDue)
            return `${formattedAmount} ${tokenCode}`
        },
        tokenAmountDueFormatted: (state, getters) => (tokenCode) => {
            let tokenAmountDue = getters.getTokenAmountDue(tokenCode)
            let formatter = new Intl.NumberFormat([], {maximumSignificantDigits: 18})
            let formattedAmount = formatter.format(tokenAmountDue)
            return `${formattedAmount} ${tokenCode}`
        },
        websocketRootUrl: (state) => {
            let url = new URL(state.apiRootUrl)
            let ws_protocol = url.protocol == 'http:' ? 'ws:': 'wss:'
            url.protocol = ws_protocol
            return url.origin
        }
    },
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
            state.selectedToken = token
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
        async makeCheckout({commit, state, getters, dispatch}) {
            let tokenAmount = getters.getTokenAmountDue(state.selectedToken)
            let checkoutUrl = `${state.apiRootUrl}/api/checkout`
            let checkoutData = await postJSON(checkoutUrl, {
                store: state.storeId,
                amount: tokenAmount,
                currency: state.selectedToken,
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
        async pollExchangeRates({dispatch, getters}) {
            getters.acceptedTokens.forEach(async function(token){
                await dispatch('getExchangeRate', token)
            });
        },
        handleCheckoutMessage({dispatch}, message) {
            let {voucher, event} = message

            dispatch('updateCheckout')
            switch(event) {
            case 'payment.confirmed':
                dispatch('handlePaymentConfirmed', voucher)
                break
            case 'payment.received':
                dispatch('handlePaymentReceived', voucher)
                break
            }
        },
        handlePaymentConfirmed({state}, voucher){
            let handler = state.paymentConfirmedHandler
            if (handler) {
                handler(voucher)
            }
        },
        handlePaymentReceived({state}, voucher){
            let handler = state.paymentReceivedHandler
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
