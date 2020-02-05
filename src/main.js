import Vue from 'vue'

import Checkout from './components/Checkout.vue'
import store from './store'


function checkout(selector, settings) {
    let container = document.querySelector(selector)
    if (!container) {
        throw(`${selector} is not a valid document selector`)
    }

    let VueCheckout = Vue.extend(Checkout)

    this._checkout = new VueCheckout({store, propsData: {settings}})

    this._checkout.$mount()
    container.appendChild(this._checkout.$el)
}


export {checkout}
