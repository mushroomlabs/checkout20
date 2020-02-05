<template>
  <div class='payment-order-status'>
    <PaymentOrderTimer/>
    <PaymentOrderTransferList v-if='transfers'/>
  </div>
</template>


<script>
import Vue from 'vue'
import {mapGetters} from 'vuex'
import VueMoment from 'vue-moment'

import PaymentOrderTimer from './PaymentOrderTimer.vue'
import PaymentOrderTransferList from './PaymentOrderTransferList.vue'

Vue.use(VueMoment)


export default {
    name: 'PaymentOrderStatus',
    components: {
        PaymentOrderTimer,
         PaymentOrderTransferList
    },
    computed: {
        ...mapGetters(['paymentOrder', 'transfers']),
    },
}
</script>
