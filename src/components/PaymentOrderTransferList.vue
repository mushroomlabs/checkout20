<template>
<ul class='payment-order-transfers'>
  <PaymentOrderTransferListItem
    v-for='transfer in transfers'
    :transfer='transfer'
    :key='transfer.identifier'
  />
</ul>
</template>


<script>
import Vue from 'vue'
import {mapGetters} from 'vuex'
import VueMoment from 'vue-moment'

import PaymentOrderTransferListItem from './PaymentOrderTransferListItem.vue'


Vue.use(VueMoment)


export default {
    name: 'PaymentOrderTransferList',
    components: {
        PaymentOrderTransferListItem
    },
    computed: {
        ...mapGetters(['paymentOrder', 'transfers']),
    },
}
</script>
