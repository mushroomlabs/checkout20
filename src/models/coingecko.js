import Decimal from 'decimal.js-light'

import Ethereum from './ethereum'

const BASE_URL = 'https://api.coingecko.com/api/v3'


async function makeRequest(url) {
    let response = await fetch(url, {
        mode: 'cors'
    })

    return await response.json()
}


async function getEthereumRate(currencyCode) {
    let url = `${BASE_URL}/simple/price?ids=ethereum&vs_currencies=${currencyCode}`
    let data = await makeRequest(url)
    return data && Decimal(data.ethereum[currencyCode.toLowerCase()])
}

async function getRateByTokenAddress(tokenAddress, currencyCode) {
    let url = `${BASE_URL}/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=${currencyCode}`
    let data = await makeRequest(url)
    return Decimal(data[tokenAddress][currencyCode.toLowerCase()])

}

async function getTokenRate(token, currencyCode) {

    if (token.network_id == Ethereum.networkIds.mainnet) {
        return await getRateByTokenAddress(token.address, currencyCode)
    }
    
    let address = Ethereum.tokenAddresses[token.code]
    if (address) {
        return await getRateByTokenAddress(address, currencyCode)
    }
    else {
        let ethRate = await getEthereumRate(currencyCode)
        return ethRate && ethRate.times(Math.random() * 100)
    }    
}

export default { getEthereumRate, getTokenRate }
