<template>
  <div v-if='exchangeRate' class='token-exchange-rate'>
    <div class='rate'>Current Price: {{ exchangeRateFormatted }}</div>
    <div class='due'>Total to Pay: {{ tokenAmountFormatted }}</div>
  </div>
</template>


<script>
export default {
    name: 'TokenExchangeRate',
    props: {
        token: Object,
    },
    computed: {
        currency() {
            return this.$store.state.pricingCurrency
        },
        exchangeRateFormatted: function() {
            let formatter = new Intl.NumberFormat(
                [], {style: 'currency', currency: this.currency, minimumFractionDigits: 3}
            );
            return `${formatter.format(this.exchangeRate)} / ${this.token.code}`;
        },
        tokenAmount: function() {
            return parseFloat(this.amountDue) / parseFloat(this.exchangeRate);
        },
        tokenAmountFormatted: function() {
            let formatter = new Intl.NumberFormat([], {maximumSignificantDigits: 6});
            let formatted_amount = formatter.format(this.tokenAmount);
            return `${formatted_amount} ${this.token.code}`;
        },
        amountDue() {
            return this.$store.state.amountDue
        },
        exchangeRate() {
            return this.$store.getters.getExchangeRate(this.token.code)
        }
    }
}
</script>
