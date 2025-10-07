const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const config = require('../config.js');

console.log('🔍 Testing wallet loading...');

try {
  // Get current account
  const currentAccount = config.accounts[config.activeAccount];
  if (!currentAccount) {
    console.error('❌ Active account not found in config');
    return;
  }
  
  // Try to load from base58 private key (Phantom format)
  const privateKeyBytes = bs58.decode(currentAccount.privateKey);
  const wallet = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('✅ Wallet loaded successfully!');
  console.log('📝 Public Key:', wallet.publicKey.toString());
  console.log('🔑 Private Key length:', privateKeyBytes.length, 'bytes');
  console.log('🔧 Active Account:', config.activeAccount);
  
} catch (error) {
  console.error('❌ Error loading wallet:', error.message);
  console.error('Please check your private key format in config.js');
}

