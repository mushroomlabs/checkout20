<template>
<div class='payment-tracker'>
  <h1 v-if='paymentOrder'>
    Payment to <span class='store'>{{ store.name }}</span>
  </h1>

  <PaymentOrderDetails v-if='paymentOrder'/>
  <PaymentOrderRouting v-if='paymentOrder'/>
  <PaymentOrderStatus v-if='paymentOrder'/>
  <PaymentOrderActionPanel v-if='paymentOrder'/>
</div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

import PaymentOrderActionPanel from './PaymentOrderActionPanel.vue'
import PaymentOrderDetails from './PaymentOrderDetails.vue'
import PaymentOrderRouting from './PaymentOrderRouting.vue'
import PaymentOrderStatus from './PaymentOrderStatus.vue'
import Spinner from './Spinner.vue'


 export default {
     name: 'PaymentTracker',
     components: {
         PaymentOrderActionPanel,
         PaymentOrderDetails,
         PaymentOrderRouting,
         PaymentOrderStatus,
         Spinner
     },
     computed:{
         ...mapGetters(['paymentOrder']),
         ...mapState(['store'])
     }
 }
</script>
