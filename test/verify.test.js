const {assert} = require('chai')
const {newKit} = require('@celo/contractkit')
const {getProxyAddress} = require('../verify.js')

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
        const address= await getProxyAddress("Random")
        //console.log("Proxy address: " + address)
        assert.equal(42, address.length)
        assert.match(address, /^0x[a-f0-9]{40}$/i, "Address should be an address")
    })

    it('should not retrieve a proxy address', async() => {
        const address= await getProxyAddress("midnfisavnsdjnsd932a")
        assert.isFalse(address)
    })

})
