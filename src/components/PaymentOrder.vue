<template>
<div class='payment-order'>
  <h1 v-if='paymentOrder'>
    Payment to <span class='store'>{{ store.name }}</span>
  </h1>

  <PaymentOrderDetails v-if='paymentOrder'/>
  <PaymentOrderRouting v-if='paymentOrder'/>
  <PaymentOrderStatus v-if='paymentOrder'/>
  <PaymentOrderActionPanel v-if='paymentOrder'/>
  <PaymentOrderTransferList/>
</div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

import PaymentOrderActionPanel from './PaymentOrderActionPanel.vue'
import PaymentOrderDetails from './PaymentOrderDetails.vue'
import PaymentOrderRouting from './PaymentOrderRouting.vue'
import PaymentOrderStatus from './PaymentOrderStatus.vue'
import PaymentOrderTransferList from './PaymentOrderTransferList.vue'


 export default {
     name: 'PaymentOrder',
     components: {
         PaymentOrderActionPanel,
         PaymentOrderDetails,
         PaymentOrderRouting,
         PaymentOrderStatus,
         PaymentOrderTransferList
     },
     computed:{
         ...mapGetters(['paymentOrder']),
         ...mapState(['store'])
     }
 }
</script>
