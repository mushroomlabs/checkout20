<template>
<div class='payment-tracker'>
  <span class='payment-status'>{{ paymentOrder.status }}</span>
</div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
    name: 'PaymentTracker',
    computed: {
        ...mapGetters(['paymentOrder'])
    }
}
</script>
