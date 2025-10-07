const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');
const bs58 = require('bs58');
const config = require('../config.js');

async function checkBalance() {
  console.log('💰 Checking wallet balance...');
  
  try {
    // Load wallet
    const privateKeyBytes = bs58.decode(config.privateKey);
    const wallet = Keypair.fromSecretKey(privateKeyBytes);
    
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const tokenMint = new PublicKey(config.tokenMint);
    
    console.log(`📝 Wallet: ${wallet.publicKey.toString()}`);
    
    // Get token account address
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey,
      false,
      new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
    );
    
    console.log(`📝 Token Account: ${tokenAccount.toString()}`);
    
    // Check if token account exists
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (!accountInfo) {
      console.log('❌ Token account does not exist');
      return;
    }
    
    // Get token balance
    const balanceInfo = await connection.getTokenAccountBalance(tokenAccount);
    const balance = balanceInfo.value.uiAmount || 0;
    
    console.log(`💰 Current WEED Balance: ${balance.toFixed(6)} WEED`);
    console.log(`📊 Raw Balance: ${balanceInfo.value.amount} (${balanceInfo.value.decimals} decimals)`);
    
    // Get SOL balance
    const solBalance = await connection.getBalance(wallet.publicKey);
    console.log(`💎 SOL Balance: ${(solBalance / 1e9).toFixed(6)} SOL`);
    
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
  }
}

checkBalance();
