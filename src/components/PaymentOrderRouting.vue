<template>
  <ul v-if='paymentRouting' class='payment-order-routing'>
    <li class='payment-method ethereum'>
      <span class='payment-method'>Ethereum Transfer</span>
      <canvas class='qr-code'></canvas>
      <div class='payment-instructions'>
        <div>
          Please send
          <span class='ethereum transfer amount' :data-clipboard='getTokenAmountDue(selectedToken)'>
            {{ tokenAmountDueFormatted(selectedToken) }}
          </span>
          to the address below:
        </div>
        <div class='ethereum transfer address'>{{ paymentRouting.blockchain }}</div>
      </div>
    </li>
    <li v-if='paymentRouting.raiden' class='payment-method raiden'>
      <span class='payment-method'>Raiden</span>
      <div class='payment-instructions'>
        <div>
          Please find the address and payment identifier below and initiate a transfer on Raiden of
          <span class='raiden transfer amount' :data-clipboard='getTokenAmountDue(selectedToken)'>
            {{ tokenAmountDueFormatted(selectedToken) }}</span>.
          <strong>Don't forget that you must include the payment identifier</strong>
        </div>
        <dl>
          <dt>Address</dt>
          <dd class='raiden transfer address'>{{ paymentRouting.raiden }}</dd>
          <dt>Payment Identifier</dt>
          <dd class='raiden transfer identifier'>{{ paymentRouting.identifier }}</dd>
        </dl>
      </div>
    </li>
  </ul>
</template>

<script>
import QRCode from 'qrcode'
import {mapState, mapGetters} from 'vuex'

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
    computed:{
        ...mapGetters(['paymentRouting', 'getTokenAmountDue', 'amountFormatted', 'tokenAmountDueFormatted']),
        ...mapState(['store', 'selectedToken'])
    },
    async mounted() {
        let store = this.$store
        let canvas = this.$el.querySelector('li.payment-method.ethereum canvas')
        await generateQRCode(canvas, this.paymentRouting.blockchain);

        this.$el.querySelectorAll('.transfer').forEach(function(elem) {
            elem.setAttribute('title', 'click to copy')
            elem.onclick = function(evt) {
                store.dispatch('copyToClipboard', evt.target)
            }
        });
    }
}
</script>
