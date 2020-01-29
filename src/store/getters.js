import Decimal from 'decimal.js-light'

export default {
    acceptedTokens: (state) => {
        return (state.store && state.store.accepted_currencies) || []
    },
    paymentOrder: (state) => {
        let checkout = state.checkout
        let paymentMethod = checkout && checkout.payment_method

        return checkout && {
            token: checkout.currency,
            tokenAmount: Decimal(checkout.amount),
            identifier: checkout.external_identifier,
            status: checkout.status,
            createdTime: checkout && new Date(checkout.created),
            expirationTime: paymentMethod && new Date(paymentMethod.expiration_time)
        }
    },
    paymentOrderTimerStatus: (state) => (date) => {
        if (!date) {
            return
        }

        let checkout = state.checkout
        let payment_method = checkout && checkout.payment_method

        let expirationTime = payment_method && new Date(payment_method.expiration_time)
        let createdTime = checkout && new Date(checkout.created)

        let totalTime = expirationTime && (expirationTime - createdTime)

        let timeElapsed = (date - createdTime) || 0
        let timeRemaining = Math.max(expirationTime - date || 0, 0)

        let isExpired = expirationTime && timeRemaining <= 0

        let timeRemainingPercentage = expirationTime ? Math.floor((100 * timeRemaining) / totalTime) : 0
        let timeElapsedPercentage = 1 - timeRemainingPercentage

        return checkout && {
            isExpired: isExpired,
            timeElapsed: timeElapsed,
            timeRemaining: timeRemaining,
            timeRemainingPercentage: timeRemainingPercentage,
            timeElapsedPercentage: timeElapsedPercentage
        }
    },
    paymentRouting: (state) => {
        let checkout = state.checkout
        let payment_method = checkout && checkout.payment_method
        return payment_method && {
            expirationTime: new Date(payment_method.expiration_time),
            blockchain: payment_method.blockchain,
            identifier: payment_method.identifier,
            raiden: payment_method.raiden
        }
    },
    hasPendingTransfers: (state, getters) => {
        return Boolean(getters.blockchainPendingTransfers.length > 0)
    },
    isPaid: (state, getters) => {
        let paymentOrder = getters.paymentOrder
        let orderAmount =  paymentOrder && paymentOrder.tokenAmount
        return Boolean(orderAmount && getters.tokenAmountTransferred.gte(orderAmount))
    },
    tokenAmountTransferred: (state, getters) => {
        return getters.tokenAmountPending.add(getters.tokenAmountConfirmed)
    },
    selectedToken: (state, getters) => {
        return state.selectedTokenCode && getters.getToken(state.selectedTokenCode)
    },
    tokenAmountPending: (state, getters) => {
        if (!getters.hasPendingTransfers) {
            return Decimal(0)
        }

        let pendingTransfers = getters.blockchainPendingTransfers
        let transferAmounts = pendingTransfers.map(transfer => Decimal(transfer.amount || 0))
        return transferAmounts.reduce((acc, value) => acc.add(Decimal(value)), Decimal(0))
    },
    tokenAmountConfirmed: (state, getters) => {
        let reducer = (acc, value) => acc.add(Decimal(value))
        let blockchainConfirmedTransfers = getters.blockchainTransfers.filter(transfer => transfer.status == 'confirmed')
        let raidenConfirmedTransfers = getters.raidenTransfers.filter(transfer => transfer.status == 'confirmed')
        let blockchainTransferAmounts = blockchainConfirmedTransfers.map(transfer => Decimal(transfer.amount))
        let raidenTransferAmounts = raidenConfirmedTransfers.map(transfer => Decimal(transfer.amount))
        let totalBlockchain = blockchainTransferAmounts.reduce(reducer, Decimal(0))
        let totalRaiden = raidenTransferAmounts.reduce(reducer, Decimal(0))

        return totalBlockchain.add(totalRaiden)
    },
    tokenAmountDue: (state, getters) => {
        let token = getters.selectedToken
        let paymentOrder = getters.paymentOrder
        let orderAmount = paymentOrder && paymentOrder.tokenAmount

        let due = orderAmount && orderAmount.sub(getters.tokenAmountTransferred)
        return due && due.gt(0) ? due.toPrecision(token.decimals) : 0
    },
    convertToTokenAmount: (state, getters) => (currencyAmount, tokenCode) => {
        let exchangeRate = getters.getExchangeRate(tokenCode)
        return exchangeRate && Decimal(currencyAmount).div(Decimal(exchangeRate))
    },
    getExchangeRate: (state) => (tokenCode) => {
        let rateData = state.exchangeRates[tokenCode]
        return rateData && Decimal(rateData.rate)
    },
    getTokenAmountWei: (state, getters) => (amount, tokenCode) => {
        let token = getters.getToken(tokenCode)
        return Math.floor(amount * (10 ** token.decimals))
    },
    getToken: (state) => (tokenCode) => {
        return state.tokens[tokenCode]
    },
    amountFormatted: (state) => {
        if (!state.pricingCurrency) {
            return ''
        }

        let formatter = new Intl.NumberFormat(
            [], {style: 'currency', currency: state.pricingCurrency}
        );
        return formatter.format(Decimal(state.amountDue).toNumber())
    },
    tokenAmountFormatted: (state, getters) => (amount, tokenCode, maxSignificantDigits) => {
        if (!tokenCode || !amount) {
            return 'N/A'
        }

        let token = getters.getToken(tokenCode)
        let digits = maxSignificantDigits || token.decimals
        let formatter = new Intl.NumberFormat([], {maximumSignificantDigits: digits})
        let formattedAmount = formatter.format(amount)
        return `${formattedAmount} ${tokenCode}`
    },
    transfers: (state, getters) => {
        return [
            ...getters.blockchainTransfers,
            ...getters.raidenTransfers
        ]
    },
    blockchainTransfers: (state) => {
        return Object.values(state.blockchainTransferMap)
    },
    raidenTransfers: (state) => {
        return Object.values(state.raidenTransferMap)
    },
    blockchainPendingTransfers: (state, getters) => {            
        let pendingStates = ['sent', 'received', 'pending']
        return getters.blockchainTransfers.filter(transfer => pendingStates.includes(transfer.status))
    },
    websocketRootUrl: (state) => {
        if (!state.apiRootUrl) {
            return null
        }

        let url = new URL(state.apiRootUrl)
        let ws_protocol = url.protocol == 'http:' ? 'ws:': 'wss:'
        url.protocol = ws_protocol
        return url.origin
    }
}
