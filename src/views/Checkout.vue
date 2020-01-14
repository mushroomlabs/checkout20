<template>
  <div id="hub20-checkout">
    <Spinner v-if="!store" message="Connecting to store..." />
    <TokenSelector v-if="store && !selectedToken"/>
    <PaymentTracker
      v-if="store && selectedToken"
    />
  </div>
</template>

<script>
import TokenSelector from '@/components/TokenSelector.vue'
import PaymentTracker from '@/components/PaymentTracker.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'checkout',
    components: {
        TokenSelector, PaymentTracker, Spinner
    },
    computed: {
        selectedToken() {
            return this.$store.state.selectedToken
        },
        store() {
            return this.$store.state.store
        }
    },
    async mounted() {
        this.$store.dispatch('getStore')
    }    
}
</script>
