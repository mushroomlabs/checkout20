<template>
<div class="payment-order-details">
  <div class="payment-reference">
    <span class="field-description">Payment Reference</span>
    <span class="field-value">{{ paymentOrder.identifier }}</span>
  </div>
  <div class="payment-amount">
    <span class="field-description">Amount</span>
    <span class="field-value">{{ amountFormatted }}</span>
    <span class="field-value">{{ tokenAmountDueFormatted(selectedToken) }}</span>
  </div>
</div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'PaymentOrderDetails',
    computed:{
        ...mapGetters(['paymentOrder', 'amountFormatted', 'tokenAmountDueFormatted']),
        ...mapState(['store', 'selectedToken'])
    }
}
</script>
