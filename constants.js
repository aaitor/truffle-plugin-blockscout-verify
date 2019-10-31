const API_URLS = {
  1: 'https://blockscout.com/eth/mainnet/',
  // 1101: 'https://integration-blockscout.celo-testnet.org/api'
  1101: 'http://localhost:4000/api'
}

const BLOCKSCOUT_URLS = {
  1: 'https://blockscout.com/eth/mainnet/',
  // 1101: 'https://integration-blockscout.celo-testnet.org'
  1101: 'http://localhost:4000'
}

const RequestStatus = {
  OK: '1',
  KO: '0'
}

const VerificationStatus = {
  FAILED: 'Fail - Unable to verify',
  NOT_VERIFIED: 'Fail - Unable to verify',
  SUCCESS: 'Pass - Verified',
  PENDING: 'Pending in queue',
  ALREADY_VERIFIED: 'Contract source code already verified',
  NOT_DEPLOYED: 'Contract not deployed in the network'
}

module.exports = {
  API_URLS,
  BLOCKSCOUT_URLS,
  RequestStatus,
  VerificationStatus
}
