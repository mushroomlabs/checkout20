import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import store from '@/store/index'

const localVue = createLocalVue()

localVue.use(Vuex)


const TEST_CURRENCY = 'USD'
const TEST_TOKEN = 'TOK'
const TEST_AMOUNT = '0.01'
const CHECKOUT_ID = 'abc'
const TEST_SERVER_API = 'http://example.com'

const STORE_ID = 'xyz'
const CHECKOUT = {
    url: `${TEST_SERVER_API}/${CHECKOUT_ID}`,
    id: CHECKOUT_ID,
    created:'1970-01-01T00:00:00.000000Z',
    store: STORE_ID,
    external_identifier: 'test checkout',
    currency: TEST_TOKEN,
    amount: TEST_AMOUNT,
    payment_method: {
        blockchain: '0xdeadbeef',
        identifier: 1,
        expiration_time:'1970-01-01T00:15:00.000000Z'
    },
    status: 'requested'
}

const TEST_BLOCKCHAIN_TX = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"


describe('store', () => {
    beforeEach(() => {
        let setupData = {
            apiRootUrl: TEST_SERVER_API,
            storeId: STORE_ID,
            currency: TEST_CURRENCY,
            amount: TEST_AMOUNT
        }

        store.commit('setup', setupData)
        store.commit('setCheckout', CHECKOUT)
    })

    it('blockchain pending transfers should be an array', () => {

        let pendingTransfers = store.getters.blockchainPendingTransfers

        expect(Array.isArray(pendingTransfers)).toBe(true)
    }),

    it('pending amount should be zero', () => {

        let pendingAmount = store.getters.tokenAmountPending

        expect(pendingAmount.toNumber()).toBe(0)
    })

    it('should keep open after insufficient payment', () => {

        let transfer = {
            "identifier": TEST_BLOCKCHAIN_TX,
            "token": TEST_TOKEN,
            "status":"sent"
        }

        store.commit('registerBlockchainTransfer', transfer)

        expect(store.getters.isPaid).toBe(false)
    })
})
