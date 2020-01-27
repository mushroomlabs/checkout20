<template>
<li class='payment-order-transfer'>
  <span class="amount">{{ tokenAmountFormatted(transfer.amount, transfer.token) }}</span>
  <span class="identifier">{{ transfer.identifier }}</span>
  <span class="status">{{ transfer.status }}</span>
</li>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
    name: 'PaymentOrderTransferListItem',
    props: {
        transfer: Object
    },
    computed: {
        ...mapGetters(['paymentOrder', 'tokenAmountFormatted']),
    },
}
</script>
