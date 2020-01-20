<template>
  <div class='payment-order-status'>
    <PaymentOrderTimer/>
  </div>
</template>


<script>
import Vue from 'vue'
import {mapGetters} from 'vuex'
import VueMoment from 'vue-moment'


import PaymentOrderTimer from './PaymentOrderTimer.vue'

Vue.use(VueMoment)


export default {
    name: 'PaymentOrderStatus',
    components: {
        PaymentOrderTimer
    },
    computed: {
        ...mapGetters(['paymentOrder']),
    },
}
</script>
