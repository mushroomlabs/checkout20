<template>
  <div id='hub20-checkout'>
    <Spinner v-if='!store' message='Connecting to store...' />
    <Spinner v-if='store && selectedTokenCode && !paymentOrder' message='Creating Payment Order...' />
    <TokenSelector v-if='store && !paymentOrder'/>
    <PaymentOrder v-if='store && paymentOrder && !isPaid'/>
    <PaymentTracker v-if='store && paymentOrder'/>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

import TokenSelector from '@/components/TokenSelector.vue'
import PaymentOrder from '@/components/PaymentOrder.vue'
import PaymentTracker from '@/components/PaymentTracker.vue'
import Spinner from '@/components/Spinner.vue'


export default {
    name: 'checkout',
    components: {
        TokenSelector, PaymentOrder, PaymentTracker, Spinner
    },
    data() {
        return {
            exchangeRatePolling: null
        }
    },
    computed: {
        ...mapGetters(['paymentOrder', 'isPaid']),
        ...mapState(['store', 'selectedTokenCode'])
    },
    async mounted() {
        this.$store.dispatch('getStore')
        this.exchangeRatePolling = setInterval(() => {
            this.$store.dispatch('pollExchangeRates')
        }, 15000)
    }
}
</script>
