<template>
  <ul v-if='paymentRouting' class='payment-order-routing'>
    <li class='payment-method ethereum'>
      <span class='payment-method'>Ethereum Transfer</span>
      <canvas class='qr-code'></canvas>
      <dl class='payment-instructions'>
          <dt>Amount</dt>
          <dd>
            <TokenAmountDisplay
              class='ethereum transfer amount'
              :valueToCopy='tokenAmountDue'
              :token='selectedToken'
              :amount='tokenAmountDue'
              />
          </dd>
          <dt>Address</dt>
          <dd><span class='ethereum transfer address'>{{ paymentRouting.blockchain }}</span></dd>
      </dl>
      <PaymentOrderWeb3Connector v-if='isWeb3BrowserAvailable' />
    </li>
    <li v-if='paymentRouting.raiden' class='payment-method raiden'>
      <span class='payment-method'>Raiden</span>
      <dl class='payment-instructions'>
        <dt>Amount</dt>
        <dd>
          <TokenAmountDisplay
            class='raiden transfer amount'
            :token='selectedToken'
            :amount='tokenAmountDue'
            :valueToCopy='tokenAmountDue'
            />
        </dd>
        <dt>Address</dt>
        <dd><span class='ethereum transfer address'>{{ paymentRouting.raiden }}</span></dd>
        <dt>Payment Identifier</dt>
        <dd><span class='raiden transfer identifier'>{{ paymentRouting.identifier }}</span></dd>
      </dl>
    </li>
  </ul>
</template>

<script>
import QRCode from 'qrcode'
import {mapState, mapGetters} from 'vuex'

import TokenAmountDisplay from './TokenAmountDisplay.vue'
import PaymentOrderWeb3Connector from './PaymentOrderWeb3Connector.vue'

async function generateQRCode(display_element, address) {
    let text = `ethereum:${address}`
    return await QRCode.toCanvas(display_element, text, {
        colorDark : '#000000',
        colorLight : '#ffffff',
        errorCorrectionLevel : 'H'
    })
}

export default {
    name: 'PaymentOrderRouting',
    components: {
        PaymentOrderWeb3Connector, TokenAmountDisplay
    },
    computed:{
        isWeb3BrowserAvailable: function() {
            return Boolean(window && (window.ethereum || window.web3))
        },
        ...mapGetters(['paymentRouting', 'paymentOrder', 'selectedToken', 'tokenAmountDue']),
        ...mapState(['store']),
    },
    async mounted() {
        let canvas = this.$el.querySelector('li.payment-method.ethereum canvas')
        await generateQRCode(canvas, this.paymentRouting.blockchain)
    }
}
</script>
