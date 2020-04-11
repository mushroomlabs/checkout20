<template>
  <div id='hub20-checkout'>
    <Spinner v-if='!store' message='Connecting to store...' />
    <Spinner v-if='store && selectedToken && !paymentOrder' message='Creating Payment Order...' />
    <TokenSelector v-if='store && !paymentOrder'/>
    <PaymentOrder v-if='store && paymentOrder && paymentOrder.isPending'/>
    <CheckoutReceipt v-if='store && paymentOrder && paymentOrder.isPaid'/>
    <CheckoutExpired v-if='store && paymentOrder && paymentOrder.isExpired'/>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

import CheckoutReceipt from '@/components/CheckoutReceipt.vue'
import CheckoutExpired from '@/components/CheckoutExpired.vue'
import TokenSelector from '@/components/TokenSelector.vue'
import PaymentOrder from '@/components/PaymentOrder.vue'
import Spinner from '@/components/Spinner.vue'


export default {
    name: 'checkout',
    components: {
        CheckoutExpired, CheckoutReceipt, TokenSelector, PaymentOrder, Spinner
    },
    props: {
        settings: Object
    },
    data() {
        return {
            exchangeRatePolling: null
        }
    },
    computed: {
        ...mapGetters(['paymentOrder']),
        ...mapState(['store', 'selectedToken'])
    },
    created() {
        this.$store.commit('setup', this.$props.settings)
        this.$store.dispatch('getStore')
        this.exchangeRatePolling = setInterval(() => {
            this.$store.dispatch('pollExchangeRates')
        }, 30000)
    }
}
</script>
