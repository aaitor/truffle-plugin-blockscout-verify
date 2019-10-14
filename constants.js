const BLOCKSCOUT_URLS = {
  1: 'https://etherscan.io/address',
  3: 'https://ropsten.etherscan.io/address',
  4: 'https://rinkeby.etherscan.io/address',
  5: 'https://goerli.etherscan.io/address',
  42: 'https://kovan.etherscan.io/address'
}

const RequestStatus = {
  OK: '1',
  KO: '0'
}

const VerificationStatus = {
  FAILED: 'Fail - Unable to verify',
  SUCCESS: 'Pass - Verified',
  PENDING: 'Pending in queue',
  ALREADY_VERIFIED: 'Contract source code already verified'
}

module.exports = {
  BLOCKSCOUT_URLS,
  RequestStatus,
  VerificationStatus
}
