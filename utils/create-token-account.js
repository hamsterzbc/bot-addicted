const { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } = require('@solana/spl-token');
const bs58 = require('bs58');
const config = require('../config.js');

async function createTokenAccount() {
  console.log('🔧 Creating token account...');
  
  try {
    // Load wallet
    const privateKeyBytes = bs58.decode(config.privateKey);
    const wallet = Keypair.fromSecretKey(privateKeyBytes);
    
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const tokenMint = new PublicKey(config.tokenMint);
    
    // Get token account address using the new Token program
    const tokenProgram = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint, 
      wallet.publicKey,
      false, // allowOwnerOffCurve
      tokenProgram // token program
    );
    console.log(`📝 Token account address: ${tokenAccount.toString()}`);
    
    // Check if it already exists
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
    if (tokenAccountInfo) {
      console.log('✅ Token account already exists!');
      return;
    }
    
    // Create the transaction
    const transaction = new Transaction();
    
    // Add compute budget instructions
    const { ComputeBudgetProgram } = require('@solana/web3.js');
    const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 375000
    });
    const setComputeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 200000
    });
    
    transaction.add(setComputeUnitPriceIx);
    transaction.add(setComputeUnitLimitIx);
    
    // Add create token account instruction using the new Token program
    const createTokenAccountIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey, // payer
      tokenAccount, // associated token account
      wallet.publicKey, // owner
      tokenMint, // mint
      tokenProgram // token program
    );
    transaction.add(createTokenAccountIx);
    
    // Set recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Send transaction
    console.log('🚀 Sending transaction to create token account...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Token account created successfully!`);
    console.log(`📝 Transaction signature: ${signature}`);
    console.log(`🎯 Token account: ${tokenAccount.toString()}`);
    
  } catch (error) {
    console.error('❌ Error creating token account:', error.message);
    process.exit(1);
  }
}

createTokenAccount();
