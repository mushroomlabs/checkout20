<template>
<div class="payment-tracker">
  <Spinner v-if="!paymentOrder" message="Creating Payment Order..." />
  <h1 v-if="paymentOrder">
    Payment to <span class="store">{{ store.name }}</span>
  </h1>
  
  <PaymentOrderDetails v-if="paymentOrder"/>
  <PaymentOrderRouting v-if="paymentOrder"/>
  <PaymentOrderTimer v-if="paymentOrder"/>
</div>
</template>

<script>
import PaymentOrderDetails from './PaymentOrderDetails.vue'
import PaymentOrderRouting from './PaymentOrderRouting.vue'
import PaymentOrderTimer from './PaymentOrderTimer.vue'
import Spinner from './Spinner.vue'

 export default {
     name: 'PaymentTracker',
     components: {
         PaymentOrderDetails, PaymentOrderRouting, PaymentOrderTimer, Spinner
     },
     computed: {
         paymentOrder() {
             return this.$store.getters.paymentOrder
         }
     }
 }
</script>
