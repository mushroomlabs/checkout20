<template>
  <div>
    <p>{{ store.name }} accepts payment in the following currencies</p>
    <p>Amount to Pay: {{ amountFormatted }}</p>
    <ul class='token-selector'>
      <TokenSelectorItem
        v-for='token in allTokens'
        :key='token.code'
        :token='token'
        />
    </ul>
  </div>
</template>


<script>
import {mapState, mapGetters} from 'vuex'

import TokenSelectorItem from './TokenSelectorItem.vue'

export default {
    name: 'TokenSelector',
    components: {
        TokenSelectorItem,
    },
    computed: {
        amountFormatted() {
            let formatter = new Intl.NumberFormat([], {style: 'currency', currency: this.pricingCurrency})
            return formatter.format(this.amountDue)
        },
        ...mapGetters(['allTokens']),
        ...mapState(['pricingCurrency', 'store', 'amountDue'])
    },
    async mounted() {
        this.$store.dispatch('fetchAllTokenData')
    }
}
</script>
