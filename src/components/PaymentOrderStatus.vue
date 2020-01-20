<template>
  <div class='payment-order-status'>
    <span v-if='!paymentOrder.isFinalized && paymentOrder.expirationTime'>
      Expires {{ paymentOrder.expirationTime | moment("from", "now") }}
    </span>
    <span v-if='paymentOrder.isFinalized'>
      Payment {{ paymentOrder.status }}
    </span>
  </div>
</template>


<script>
import Vue from 'vue'
import {mapState, mapGetters} from 'vuex'
import VueMoment from 'vue-moment'

Vue.use(VueMoment)


export default {
    name: 'PaymentOrderStatus',
    computed:{
        ...mapGetters(['paymentOrder', 'paymentRouting']),
        ...mapState(['checkout'])
    },
    async mounted() {
        setInterval(() => {
            this.$forceUpdate()
        }, 1000)
    }
}
</script>
