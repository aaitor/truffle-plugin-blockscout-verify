const assert = require('assert')
const { newKit, CeloContract} = require('@celo/contractkit')
console.log(newKit)

describe('Verify Tests', function() {
    it('Contract Kit is initialized', async function() {
        
        const kit = newKit('http://localhost:8545')
        const web3Exchange = await kit._web3Contracts.getExchange()
        // console.log(web3Exchange.address)
        // assert.ok(web3Exchange.address.length > 0, "This shouldn't fail");
    }),
    it('I can retreive the proxy address of a contract', async function() {
        const kit = newKit('http://localhost:8545')
        const proxyAddress= await kit.registry.addressFor(CeloContract.Random)
        //console.log("Address: " + proxyAddress)
        assert.ok(proxyAddress.length > 0, "We have the Proxy address");
    })
})
