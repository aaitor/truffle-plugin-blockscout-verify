const {assert} = require('chai')
const {newKit, CeloContract} = require('@celo/contractkit')


describe('Verify Tests', () => {
    let kit

    beforeEach(() => {
        kit = newKit('http://localhost:8545')
    })

    it('should initialize', async() => {
        assert.isOk(kit, 'Should be defined')
    })
    
    it('should retrieve the proxy address of a contract', async() => {
        const address = await kit.registry.addressFor(CeloContract.Random)
        console.log("Proxy address: " + address)
        assert.match(address, /^0x[a-f0-9]{64}$/i, "Address should be an address")
    })
})
