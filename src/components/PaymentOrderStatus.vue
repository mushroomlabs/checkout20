<template>
  <div class='payment-order-status'>
    <PaymentOrderTimer/>
    <PaymentOrderTransferList v-if='transfers'>
      The following transfers were accepted but are not sufficient to pay the total due
    </PaymentOrderTransferList>
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
