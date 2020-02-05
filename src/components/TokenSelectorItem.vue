l<template>
<li v-on:click='selectToken' class='token-selector-item'>
  <span v-if='token' class='token-name'>{{ token.name }}</span>
  <img
    v-if='token'
    :src='token.logo || "https://assets.coingecko.com/coins/images/279/large/ethereum.png"'
    :alt='token.name'
  />
  <TokenExchangeRate v-if="token" :token='token' />

  <Spinner v-if='!token' :message='spinnerMessage' />
</li>
</template>


<script>
import {mapState} from 'vuex'
import TokenExchangeRate from './TokenExchangeRate.vue'
import Spinner from './Spinner.vue'

export default {
    name: 'TokenSelectorItem',
    components: {
        TokenExchangeRate, Spinner
    },
    props: {
        token: Object,
    },
    computed: {
        spinnerMessage: function() {
            return `Fetching token information...`
        },
        ...mapState(['apiRootUrl', 'pricingCurrency'])
    },
    methods: {
        selectToken: function() {
            this.$store.commit('selectToken', this.token)
            this.$store.dispatch('makeCheckout', this.token)
        }
    }
}
</script>
