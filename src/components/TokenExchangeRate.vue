<template>
  <div v-if='exchangeRateFormatted' class='token-exchange-rate'>
    <div class='rate'>Current Price: {{ exchangeRateFormatted }}</div>
    <div class='due'>Total to Pay: {{ tokenAmountFormatted(token.code) }}</div>
  </div>
</template>


<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'TokenExchangeRate',
    props: {
        token: Object,
    },
    computed: {
        exchangeRateFormatted: function() {
            let exchangeRate = this.getExchangeRate(this.token.code)
            let formatter = new Intl.NumberFormat(
                [], {style: 'currency', currency: this.pricingCurrency, minimumFractionDigits: 3}
            )
            return `${formatter.format(exchangeRate)} / ${this.token.code}`
        },
        ...mapGetters(['tokenAmountFormatted', 'getExchangeRate']),
        ...mapState(['amountDue', 'pricingCurrency']),
    }
}
</script>
