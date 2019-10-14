const API_URLS = {
  1: 'https://blockscout.com/eth/mainnet/',
  1101: 'https://integration-blockscout.celo-testnet.org/'
}

const BLOCKSCOUT_URLS = {
  1: 'https://blockscout.com/eth/mainnet/',
  1101: 'https://integration-blockscout.celo-testnet.org/'
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
  API_URLS,
  BLOCKSCOUT_URLS,
  RequestStatus,
  VerificationStatus
}
