const axios = require('axios')
const querystring = require('querystring')
const delay = require('delay')
const { merge } = require('sol-merger')
const fs = require('fs')
const { enforce, enforceOrThrow } = require('./util')
const { API_URLS, BLOCKSCOUT_URLS, RequestStatus, VerificationStatus } = require('./constants')
const { newKit, CeloContract} = require('@celo/contractkit')
const kit = newKit('http://localhost:8545')

// const curlirize = require('axios-curlirize')
// // initializing axios-curlirize with your axios instance
// curlirize(axios);

module.exports = async (config) => {
  const options = parseConfig(config)
  //const kit = newKit.getExchange('http://localhost:8545')
  // Verify each contract
  const contractNames = config._.slice(1)


  // Track which contracts failed verification
  const failedContracts = []
  for (const contractName of contractNames) {
    //console.log(`Verifying ${contractName}`)
    try {
      const artifact = getArtifact(contractName, options)
      const contractAddress = artifact.networks[`${options.networkId}`].address
      const explorerUrl = `${BLOCKSCOUT_URLS[options.networkId]}/address/${contractAddress}/contracts`

      let verStatus= await verificationStatus(contractAddress, options)
      if (verStatus === VerificationStatus.ALREADY_VERIFIED)  {
        console.debug(`Contract ${contractName} at address ${contractAddress} already verified. Skipping: ${explorerUrl}`)
      } else {
        console.debug(`Contract ${contractName} at address ${contractAddress} not verified yet. Let's do it.`)

        let status = await verifyContract(artifact, options)
        if (status === VerificationStatus.NOT_VERIFIED) {
          failedContracts.push(contractName)
        } else {
          // Add link to verified contract on Blockscout
          status += `: ${explorerUrl}`
        }
        console.log(status)
      }
      
    } catch (e) {
      console.error(`Error ${e}`)
      failedContracts.push(contractName)
    }
    console.log()
  }

  enforce(
    failedContracts.length === 0,
    `Failed to verify ${failedContracts.length} contract(s): ${failedContracts.join(', ')}`
  )

  console.log(`Successfully verified ${contractNames.length} contract(s).`)
}

const parseConfig = (config) => {
  // Truffle handles network stuff, just need network_id
  const networkId = config.network_id
  const networkName = config.network
  const apiUrl = API_URLS[networkId]
  enforce(apiUrl, `Blockscout has no support for network ${config.network} with id ${networkId}`)

  enforce(config._.length > 1, 'No contract name(s) specified')

  const workingDir = config.working_directory
  //const contractsBuildDir = config.contracts_build_directory
  contractsBuildDir = config.contracts_build_directory

  if (fs.existsSync(`${workingDir}/build/${networkName}`) && fs.existsSync(`${workingDir}/build/${networkName}/contracts/`))
    contractsBuildDir = workingDir + `/build/${networkName}/contracts/`
  const optimizerSettings = config.compilers.solc.settings.optimizer
  const verifyPreamble = config.verify && config.verify.preamble

  console.debug(`Contracts Build Dir ${contractsBuildDir}`)
  console.debug(`Working Dir ${workingDir}`)

  let optimization= false
  if (optimizerSettings.enabled == 1)
    optimization= true
    
  //console.debug(`Optimization Used {optimizerSettings.enabled} - Opt = ${optimization}`)

  return {
    apiUrl,
    networkId,
    networkName,
    workingDir,
    contractsBuildDir,
    verifyPreamble,
    // Note: API docs state enabled = 0, disbled = 1, but empiric evidence suggests reverse
    optimizationUsed: optimization,
    runs: optimizerSettings.runs
  }
}

const getArtifact = (contractName, options) => {
  // Construct artifact path and read artifact
  const artifactPath = `${options.contractsBuildDir}/${contractName}.json`
  enforceOrThrow(fs.existsSync(artifactPath), `Could not find ${contractName} artifact at ${artifactPath}`)
  return require(artifactPath)
}

const verifyContract = async (artifact, options) => {
  enforceOrThrow(
    artifact.networks && artifact.networks[`${options.networkId}`],
    `No instance of contract ${artifact.contractName} found for network id ${options.networkId} and network name ${options.networkName}`
  )

  const res = await sendVerifyRequest(artifact, options)
  enforceOrThrow(res.data, `Failed to connect to Blockscout API at url ${options.apiUrl}`)

  if (res.data.result === VerificationStatus.ALREADY_VERIFIED) {
    return VerificationStatus.ALREADY_VERIFIED
  }

  enforceOrThrow(res.data.status === RequestStatus.OK, res.data.result)
  const contractAddress = artifact.networks[`${options.networkId}`].address
  return verificationStatus(contractAddress, options)
}

const sendVerifyRequest = async (artifact, options) => {
  const contractAddress= artifact.networks[`${options.networkId}`].address
  const encodedConstructorArgs = await fetchConstructorValues(artifact, options)
  const mergedSource = await fetchMergedSource(artifact, options)
  const contractProxyAddress = await getProxyAddress(artifact.contractName, options)


  const postQueries = {
    addressHash: contractAddress,
    contractSourceCode: mergedSource,
    name: artifact.contractName,
    compilerVersion: `v${artifact.compiler.version.replace('.Emscripten.clang', '')}`,
    optimization: options.optimizationUsed,
    optimizationRuns: options.runs,
    constructorArguments: encodedConstructorArgs,
    proxyAddress: contractProxyAddress
  }
  console.debug(mergedSource)

  // Link libraries as specified in the artifact
  const libraries = artifact.networks[`${options.networkId}`].links || {}
  Object.entries(libraries).forEach(([key, value], i) => {
    enforceOrThrow(i < 5, 'Can not link more than 5 libraries with Blockscout API')
    postQueries[`library${i + 1}Name`] = key
    postQueries[`library${i + 1}Address`] = value
  })

  const verifyUrl = `${options.apiUrl}?module=contract&action=verify`
  console.debug(`url: ${verifyUrl}, options: ${querystring.stringify(postQueries)}`)
  try {
    // return axios.post(verifyUrl, querystring.stringify(postQueries))
    return axios.post(verifyUrl, postQueries)
  } catch (e) {
    console.error(`Error verifying: ${e}`)
    throw new Error(`Failed to connect to Blockscout API at url ${verifyUrl}`)
  }
}

const fetchConstructorValues = async (artifact, options) => {
  const contractAddress = artifact.networks[`${options.networkId}`].address
  let res
  try {
    // console.debug(`${options.apiUrl}?module=account&action=txlist&address=${contractAddress}&page=1&sort=asc&offset=1`)
    res = await axios.get(
      `${options.apiUrl}?module=account&action=txlist&address=${contractAddress}&page=1&sort=asc&offset=1`
    )
  } catch (e) {
    throw new Error(`Failed Fetching constructor values from Blockscout API at url ${options.apiUrl}`)
  }
  enforceOrThrow(res.data && res.data.status === RequestStatus.OK, 'Failed to fetch constructor arguments')
  let constructorParameters= res.data.result[0].input.substring(artifact.bytecode.length)
  // console.debug(`Constructor Parameters: ${constructorParameters}`)
  return constructorParameters
}

const fetchMergedSource = async (artifact, options) => {
  enforceOrThrow(
    fs.existsSync(artifact.sourcePath),
    `Could not find ${artifact.contractName} source file at ${artifact.sourcePath}`
  )

  let mergedSource = await merge(artifact.sourcePath)
  // Include the preamble if it exists, removing all instances of */ for safety
  if (options.verifyPreamble) {
    const preamble = options.verifyPreamble.replace(/\*+\//g, '')
    mergedSource = `/**\n${preamble}\n*/\n\n${mergedSource}`
  }
  return mergedSource
}

const verificationStatus = async (address, options) => {
  // Retry API call every second until status is no longer pending
  let counter= 0
  const retries = 5
  while (counter < retries) {
    let url = `${options.apiUrl}?module=contract&action=getsourcecode&address=${address}`
    //console.debug(`Retrying contract verification[${counter}] for address ${address} at url: ${url}`)

    try {
      const result = await axios.get(url)
      if (result.data.result[0].SourceCode.length > 0) {
        console.debug(`Contract at ${address} already verified`)
        return  VerificationStatus.ALREADY_VERIFIED
      }
    } catch (e) {
      console.error(`Error in verification status: ${e}`)
      throw new Error(`Failed to get verification status from Blockscout API at url ${options.apiUrl}`)
    }
    counter++;
    await delay(1000)
  }
  console.debug(`Contract at ${address} source code not verified yet`)
  return VerificationStatus.NOT_VERIFIED
}

const getProxyAddress = async (contractName, options) => {
  const proxyAddress= await kit.registry.addressFor(CeloContract.Random)
}
