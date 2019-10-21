const {assert} = require('chai')
const {newKit} = require('@celo/contractkit')
const {verify} = require('../verify.js')

describe('Verify Tests', () => {
    let kit

    beforeEach(() => {
        kit = newKit('http://localhost:8545')
    })

    it('should initialize', async() => {
        assert.isOk(kit, 'Should be defined')
    })
    
    it('should retrieve the proxy address of a contract', async() => {
        const address = await kit.registry.addressFor("Random")
        //console.log("Proxy address: " + address)
        assert.equal(42, address.length)
        assert.match(address, /^0x[a-f0-9]{40}$/i, "Address should be an address")
    })

    it('should retrieve the proxy address of a contract via verify', async() => {
        console.log("Typeof " + typeof getProxyAddress)
        const address= await verify.getProxyAddress("Random")
        console.log("Proxy address: " + address)
        assert.equal(42, address.length)
        assert.match(address, /^0x[a-f0-9]{40}$/i, "Address should be an address")
    })


})
