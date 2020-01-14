<template>
  <div>
    <p>{{ store.name }} accepts payment in the following currencies</p>
    <p>Amount to Pay: {{ amountFormatted }}</p>
    <ul class="token-selector">
      <TokenSelectorItem
        v-for="token_code in acceptedTokens"
        :key="token_code"
        :tokenCode="token_code"
        />
    </ul>
  </div>
</template>


<script>
import TokenSelectorItem from './TokenSelectorItem.vue'

export default {
    name: 'TokenSelector',
    components: {
        TokenSelectorItem,
    },
    computed: {
        amountFormatted() {
            let currency = this.$store.state.pricingCurrency;
            let formatter = new Intl.NumberFormat([], {style: "currency", currency: currency});
            return formatter.format(this.amountDue);
        },
        store() {
            return this.$store.state.store
        },
        amountDue() {
            return this.$store.state.amountDue
        },
        currency() {
            return this.$store.state.pricingCurrency
        },
        acceptedTokens() {
            return this.$store.state.store.accepted_currencies
        },
    }
}
</script>
