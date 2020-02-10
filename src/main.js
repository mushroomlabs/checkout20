import Vue from 'vue'

import Checkout from './components/Checkout.vue'
import store from './store'

var CURRENT_CHECKOUT = null

function checkout(selector, settings) {
    let container = document.querySelector(selector)
    if (!container) {
        throw(`${selector} is not a valid document selector`)
    }

    if (CURRENT_CHECKOUT) {
        CURRENT_CHECKOUT.$el.remove()
    }

    let VueCheckout = Vue.extend(Checkout)

    this._checkout = new VueCheckout({store, propsData: {settings}})

    this._checkout.$mount()
    container.appendChild(this._checkout.$el)

    CURRENT_CHECKOUT = this._checkout
}


export {checkout}
