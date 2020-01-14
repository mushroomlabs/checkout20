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

        // values that do change during runtime
        store: null,
        selectedToken: null,
        checkout: null,
        tokens: {},
        exchangeRates: {}
    },
    getters: {
        acceptedTokens: (state) => {
            return (state.store && state.store.acceptedTokens) || []
        },
        paymentOrder: (state) => {
            let checkout = state.checkout
            return checkout && {
                token: checkout.currency,
                amount: checkout.amount,
                identifier: checkout.external_identifier,
                status: checkout.status
            }
        },
        paymentRouting: (state) => {
            let checkout = state.checkout
            let payment_method = checkout && checkout.payment_method
            return payment_method && {
                expiration_time: new Date(payment_method.expiration_time),
                blockchain: payment_method.blockchain,
                identifier: payment_method.identifier,
                raiden: payment_method.raiden
            }
        },
        getExchangeRate: (state) => (tokenCode) => {
            let rateData = state.exchangeRates[tokenCode]
            return rateData && rateData.rate
        },
        getTokenAmountDue: (state) => (tokenCode) => {
            let exchangeRate = this.getters.getExchangeRate(tokenCode)
            return exchangeRate && (parseFloat(state.amountDue) / parseFloat(exchangeRate))
        },
        getToken: (state) => (tokenCode) => {
            return state.tokens[tokenCode]
        }
    },
    mutations: {
        setup(state, setupData) {
            let timestamp = new Date().toISOString()
            state.apiRootUrl = setupData.apiRootUrl
            state.storeId = setupData.storeId
            state.pricingCurrency = String(setupData.currency).toUpperCase(),
            state.identifier = setupData.identifier || new Hashes.MD5().hex(timestamp)
            state.amountDue = setupData.amount,
            state.paymentSentHandler = setupData.onPaymentSent,
            state.paymentReceivedHandler = setupData.onPaymentReceived,
            state.paymentConfirmedHandler = setupData.onPaymentConfirmed,
            state.paymentCanceledHandler = setupData.onPaymentCanceled
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
        }
    },
    actions: {
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
        async makeCheckout({commit, state}) {
            let checkoutUrl = `${state.apiRootUrl}/api/checkout`
            let checkoutData = await postJSON(checkoutUrl, {
                store: state.store,
                amount: this.getters.getTokenAmountDue(state.selectedToken),
                currency: state.selectedToken,
                external_identifier: state.identifier
            })
            commit('setCheckout', checkoutData)
        }
    },
    modules: {
    }
})
