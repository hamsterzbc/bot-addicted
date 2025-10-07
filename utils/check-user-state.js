const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const config = require('../config.js');

async function checkUserState() {
  console.log('🔍 Checking user state...');
  
  try {
    // Load wallet
    const privateKeyBytes = bs58.decode(config.privateKey);
    const wallet = Keypair.fromSecretKey(privateKeyBytes);
    
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const contractAddress = new PublicKey(config.contractAddress);
    
    console.log(`📝 Wallet: ${wallet.publicKey.toString()}`);
    
    // Try different PDA patterns
    const patterns = [
      ["user_state"],
      ["state"], 
      ["user"],
      ["farming"],
      ["farm"]
    ];
    
    for (const pattern of patterns) {
      try {
        const [pda] = await PublicKey.findProgramAddress(
          [wallet.publicKey.toBuffer(), Buffer.from(pattern[0])],
          contractAddress
        );
        
        const accountInfo = await connection.getAccountInfo(pda);
        console.log(`📝 Pattern "${pattern[0]}": ${pda.toString()} - ${accountInfo ? 'EXISTS' : 'NOT FOUND'}`);
        
        if (accountInfo) {
          console.log(`✅ Found user state with pattern: ${pattern[0]}`);
          console.log(`📊 Account data length: ${accountInfo.data.length} bytes`);
          return pda;
        }
      } catch (error) {
        console.log(`❌ Pattern "${pattern[0]}": Error - ${error.message}`);
      }
    }
    
    console.log('❌ No user state found. The user may need to:');
    console.log('1. Register through the game interface first');
    console.log('2. Make an initial deposit or stake');
    console.log('3. Complete some onboarding process');
    
  } catch (error) {
    console.error('❌ Error checking user state:', error.message);
  }
}

checkUserState();
