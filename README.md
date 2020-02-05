# Hub20 Checkout

## Intro

[Hub20](https://github.com/mushroomlabs/hub20) is a self-hosted online payment solution allowing users to collect payments in Ethereum and any ERC20 token.

[Checkout20](https://github.com/mushroomlabs/hub20) is the frontend Javascript SDK, meant to run in any modern browser.

## Usage

First you need to have an account at your Hub20 instance and define your store. To initiate a checkout:


```
    <div id="hub20 store"></div>

    <script type="text/javascript">
     window.addEventListener('load', function() {
       new Hub20.checkout("#store", {
         apiRootUrl: "https://your.hub20.example.com",
         storeId: "your-store-id-uuid",
         currency: "USD",
         amount: "2.50",
         onError: function(error, message) {
           console.error(message)
         },
         onNotification: function(message) {
           alert(message)
         },
         onPaymentSent: function(voucher) {
             uploadVoucherToSite(voucher)
         },
         onPaymentReceived: function(voucher) {
             uploadVoucherToSite(voucher)
         },
         onPaymentConfirmed: function(voucher) {
             uploadVoucherToSite(voucher)
         }
       })
     })
    </script>
```

If you have access to the backend of your web application and want to
check the status of the payment, you can do so - just check the
documentation of Hub20's API. However, if your website which
integrates Hub20 relies on the voucher's provided by Hub20 to verify
payment, you need to implement the `onPayment` functions described below:


 - `onPaymentSent`: this function is called when a transaction done to
   the payment address is created, but before being mined.

 - `onPaymentReceived`: this function will be called when any
   transaction with the payment is mined and Hub20 could verify that
   it is the recipient of the transfer

 - `onPaymentConfirmed`: this function will be called whenever a
   payment can not be reverted (i.e, it was received on Raiden or the
   number of confirmations is hgher than the minimum required by the
   store definition)
