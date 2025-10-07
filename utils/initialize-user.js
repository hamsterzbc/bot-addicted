const { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');
const config = require('../config.js');

async function initializeUser() {
  console.log('🔧 Initializing user account...');
  
  try {
    // Load wallet
    const privateKeyBytes = bs58.decode(config.privateKey);
    const wallet = Keypair.fromSecretKey(privateKeyBytes);
    
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const contractAddress = new PublicKey(config.contractAddress);
    
    console.log(`📝 Wallet: ${wallet.publicKey.toString()}`);
    
    // Calculate user state PDA
    const [userStatePDA] = await PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), Buffer.from("user_state")],
      contractAddress
    );
    
    console.log(`📝 User State PDA: ${userStatePDA.toString()}`);
    
    // Check if account already exists
    const accountInfo = await connection.getAccountInfo(userStatePDA);
    if (accountInfo) {
      console.log('✅ User account already initialized!');
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
    
    // Add initialize user instruction
    // This is a placeholder - we need to find the correct initialize instruction
    const initializeInstruction = {
      programId: contractAddress,
      keys: [
        { pubkey: userStatePDA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
      ],
      data: Buffer.from('0000000000000000', 'hex') // Placeholder discriminator
    };
    
    transaction.add(initializeInstruction);
    
    // Set recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Send transaction
    console.log('🚀 Sending transaction to initialize user account...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ User account initialized successfully!`);
    console.log(`📝 Transaction signature: ${signature}`);
    console.log(`🎯 User State PDA: ${userStatePDA.toString()}`);
    
  } catch (error) {
    console.error('❌ Error initializing user account:', error.message);
    console.error('This might be because:');
    console.error('1. The initialize instruction format is different');
    console.error('2. The user needs to register through the game interface first');
    console.error('3. The account might need to be initialized manually');
    process.exit(1);
  }
}

initializeUser();
