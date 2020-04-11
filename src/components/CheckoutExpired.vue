<template>
<div class='checkout-expired'>
  <slot name='header'><h2>Time Expired!</h2></slot>
  <PaymentOrderTransferList v-if='transfers.length > 0'>
    The following transfers were received, but they did not amount to the total amount requested.
  </PaymentOrderTransferList>
</div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

import PaymentOrderTransferList from './PaymentOrderTransferList.vue'

export default {
    name: 'CheckoutExpired',
    components: {
        PaymentOrderTransferList
    },
    computed: {
        ...mapGetters(['paymentOrder', 'transfers']),
        ...mapActions(['handleCheckoutExpired'])
    },
    mounted() {
        this.handleCheckoutExpired()
    }
}
</script>
