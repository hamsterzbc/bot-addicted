module.exports = {
  // Current Active Account (change this to switch accounts)
  activeAccount: 'account1', // Options: 'account1', 'account2', etc.
  
  // Account Configurations
  accounts: {
    account1: {
      // Wallet Configuration
      privateKey: 'YOUR_PRIVATE_KEY_HERE', // Replace with your actual private key
      
      // Contract Addresses (update these with your actual addresses)
      contractAddress: 'YOUR_CONTRACT_ADDRESS_HERE',
      tokenMint: 'YOUR_TOKEN_MINT_HERE',
      
      // Program Derived Addresses (PDAs) - Update these based on your successful transactions
      userStatePDA: 'YOUR_USER_STATE_PDA_HERE',
      globalStatePDA: 'YOUR_GLOBAL_STATE_PDA_HERE',
      configPDA: 'YOUR_CONFIG_PDA_HERE',
      mintAuthority: 'YOUR_MINT_AUTHORITY_HERE',
      referralStatePDA: 'YOUR_REFERRAL_STATE_PDA_HERE',
      referralTokenAccountPDA: 'YOUR_REFERRAL_TOKEN_ACCOUNT_PDA_HERE',
      
      // Token Program
      tokenProgram: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
      systemProgram: '11111111111111111111111111111111',
      
      // Instruction Data (discriminator)
      instructionDiscriminator: 'YOUR_INSTRUCTION_DISCRIMINATOR_HERE',
    },
    
    account2: {
      // Wallet Configuration
      privateKey: 'YOUR_SECOND_ACCOUNT_PRIVATE_KEY_HERE',
      
      // Contract Addresses (update these for your second account)
      contractAddress: 'YOUR_CONTRACT_ADDRESS_HERE',
      tokenMint: 'YOUR_TOKEN_MINT_HERE',
      
      // Program Derived Addresses (PDAs) - Update these for your second account
      userStatePDA: 'YOUR_SECOND_ACCOUNT_USER_STATE_PDA',
      globalStatePDA: 'YOUR_GLOBAL_STATE_PDA_HERE',
      configPDA: 'YOUR_CONFIG_PDA_HERE',
      mintAuthority: 'YOUR_MINT_AUTHORITY_HERE',
      referralStatePDA: 'YOUR_SECOND_ACCOUNT_REFERRAL_STATE_PDA',
      referralTokenAccountPDA: 'YOUR_SECOND_ACCOUNT_REFERRAL_TOKEN_PDA',
      
      // Token Program
      tokenProgram: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
      systemProgram: '11111111111111111111111111111111',
      
      // Instruction Data (discriminator)
      instructionDiscriminator: 'YOUR_INSTRUCTION_DISCRIMINATOR_HERE',
    }
  },
  
  // Global Configuration (applies to all accounts)
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  claimIntervalMinutes: 15,
  logLevel: 'info',
  
  // Compute Budget Settings 
  computeUnitPrice: 375000, // micro lamports per compute unit
  computeUnitLimit: 200000, // compute units
};

