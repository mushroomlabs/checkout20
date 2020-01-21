<template>
<div class='payment-tracker'>
  <span class='payment-status'>{{ paymentOrder.status }}</span>
</div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'PaymentTracker',
    computed: {
        ...mapGetters(['paymentOrder']),
        ...mapState(['store', 'selectedToken'])
    }
}
</script>
