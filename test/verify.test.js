const assert = require('assert')
const {newKit} = require('@celo/contractkit')
console.log(newKit)

describe('Verify Tests', function() {
    it('Contract Kit is initialized', async function() {
        
        const kit = newKit('http://localhost:8545')
        const web3Exchange = await kit._web3Contracts.getExchange()
        console.log(web3Exchange.address)
        assert.ok(web3Exchange.address.lenght > 0, "This shouldn't fail");
    }),
    it('I can retreive the proxy address of a contract', function() {
         kit.registry.addressFor(CeloContract.StableToken)
        assert.ok(true, "This shouldn't fail");
    })
})
