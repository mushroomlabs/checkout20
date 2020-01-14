<template>
<li v-on:click='selectToken' class='token-selector-item'>
  <span v-if='token' class='token-name'>{{ token.name }}</span>
  <img
    v-if='token'
    :src='token.logo'
    :alt='token.name'
  />
  <TokenExchangeRate
    v-if='token'
    :token='token'
  />

  <Spinner v-if='!token' :message='spinnerMessage' />
</li>
</template>


<script>
  import TokenExchangeRate from './TokenExchangeRate.vue';
  import Spinner from './Spinner.vue';

export default {
    name: 'TokenSelectorItem',
    components: {
        TokenExchangeRate, Spinner
    },
    props: {
        tokenCode: String,
    },
    computed: {
        spinnerMessage: function() {
            return `Fetching ${this.tokenCode}/${this.currency} exchange rate`;
        },
        tokenUrl: function() {
            return `${this.apiRootUrl}/api/tokens/token/${this.tokenCode}`;
        },
        apiRootUrl() {
            return this.$store.state.apiRootUrl
        },
        amountDue() {
            return this.$store.state.amountDue
        },
        currency() {
            return this.$store.state.pricingCurrency
        },
        token() {
            return this.$store.getters.getToken(this.tokenCode)
        }
    },
    methods: {
        selectToken: function() {
            this.$store.commit('selectToken', this.tokenCode);
        }
    },
    async mounted() {
        this.$store.dispatch('getToken', this.tokenCode);
        this.$store.dispatch('getExchangeRate', this.tokenCode);
    }
}
</script>
