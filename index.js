const { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } = require('@solana/spl-token');
const config = require('./config.js');

class SolanaClaimingBot {
  constructor() {
    this.connection = new Connection(config.rpcUrl, 'confirmed');
    this.currentAccount = this.getCurrentAccount();
    this.wallet = this.loadWallet();
    this.contractAddress = new PublicKey(this.currentAccount.contractAddress);
    this.tokenMint = new PublicKey(this.currentAccount.tokenMint);
    this.isRunning = false;
    this.claimInterval = config.claimIntervalMinutes * 60 * 1000; // Convert to milliseconds
  }

  getCurrentAccount() {
    const accountName = config.activeAccount;
    if (!config.accounts[accountName]) {
      throw new Error(`Account '${accountName}' not found in config. Available accounts: ${Object.keys(config.accounts).join(', ')}`);
    }
    return config.accounts[accountName];
  }

  loadWallet() {
    try {
      // Try to load from base58 private key (Phantom format)
      const bs58 = require('bs58');
      const privateKeyBytes = bs58.decode(this.currentAccount.privateKey);
      return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      try {
        // Try to load from JSON array format
        const privateKeyArray = JSON.parse(this.currentAccount.privateKey);
        return Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
      } catch (error2) {
        try {
          // Try to load from base64 format
          return Keypair.fromSecretKey(Buffer.from(this.currentAccount.privateKey, 'base64'));
        } catch (error3) {
          console.error('❌ Error loading wallet:', error3.message);
          console.error('Please check your private key format in config.js');
          console.error('Supported formats: base58 (Phantom), JSON array, or base64');
          process.exit(1);
        }
      }
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async createClaimTransaction() {
    try {
      const transaction = new Transaction();
      
      // Add compute budget instructions
      const computeBudgetInstructions = this.createComputeBudgetInstruction();
      computeBudgetInstructions.forEach(ix => transaction.add(ix));

      // Get associated token account address using the new Token program
      const tokenProgram = new PublicKey(this.currentAccount.tokenProgram);
      const tokenAccount = await getAssociatedTokenAddress(
        this.tokenMint,
        this.wallet.publicKey,
        false, // allowOwnerOffCurve
        tokenProgram // token program
      );

      // Check if token account exists, create if not
      const tokenAccountInfo = await this.connection.getAccountInfo(tokenAccount);
      if (!tokenAccountInfo) {
        this.log('⚠️ Token account does not exist. You may need to create it manually first.', 'error');
        this.log(`Token account address: ${tokenAccount.toString()}`);
        throw new Error('Token account does not exist. Please create it manually first.');
      }

      // Add the main claim instruction
      const claimInstruction = await this.createClaimInstruction(tokenAccount);
      transaction.add(claimInstruction);

      // Set recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.wallet.publicKey;

      return transaction;
    } catch (error) {
      this.log(`Error creating transaction: ${error.message}`, 'error');
      throw error;
    }
  }

  createComputeBudgetInstruction() {
    const { ComputeBudgetProgram } = require('@solana/web3.js');
    
    // Create compute budget instructions using the built-in program
    const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: config.computeUnitPrice
    });
    
    const setComputeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: config.computeUnitLimit
    });

    return [setComputeUnitPriceIx, setComputeUnitLimitIx];
  }

  async createClaimInstruction(tokenAccount) {
    const { TransactionInstruction, PublicKey } = require('@solana/web3.js');
    
    // Use the instruction discriminator from config
    const instructionData = Buffer.from(this.currentAccount.instructionDiscriminator, 'hex');
    
    // Use the exact accounts from the current account configuration
    const account1 = new PublicKey(this.currentAccount.userStatePDA); // User state PDA
    const account2 = new PublicKey(this.currentAccount.globalStatePDA); // Global state
    const account3 = new PublicKey(this.currentAccount.configPDA); // Config
    const account4 = this.tokenMint; // WEED mint
    const account5 = new PublicKey(this.currentAccount.mintAuthority); // Mint authority
    const account6 = tokenAccount; // User's token account
    const account7 = this.wallet.publicKey; // User wallet
    const account8 = new PublicKey(this.currentAccount.tokenProgram); // Token program
    const account9 = new PublicKey(this.currentAccount.systemProgram); // System program
    const account10 = new PublicKey(this.currentAccount.referralStatePDA); // Referral state
    const account11 = new PublicKey(this.currentAccount.referralTokenAccountPDA); // Referral token account
    
    return new TransactionInstruction({
      programId: this.contractAddress,
      keys: [
        { pubkey: account1, isSigner: false, isWritable: true },
        { pubkey: account2, isSigner: false, isWritable: true },
        { pubkey: account3, isSigner: false, isWritable: true },
        { pubkey: account4, isSigner: false, isWritable: true },
        { pubkey: account5, isSigner: false, isWritable: false },
        { pubkey: account6, isSigner: false, isWritable: true },
        { pubkey: account7, isSigner: true, isWritable: true },
        { pubkey: account8, isSigner: false, isWritable: false },
        { pubkey: account9, isSigner: false, isWritable: false },
        { pubkey: account10, isSigner: false, isWritable: true },
        { pubkey: account11, isSigner: false, isWritable: true },
      ],
      data: instructionData
    });
  }

  async findUserStatePDA() {
    const { PublicKey } = require('@solana/web3.js');
    
    // Try to find the user state PDA - this is usually derived from user wallet + some seed
    // Common patterns: [user_wallet, "user_state"] or [user_wallet, "state"]
    try {
      const [userStatePDA] = await PublicKey.findProgramAddress(
        [this.wallet.publicKey.toBuffer(), Buffer.from("user_state")],
        this.contractAddress
      );
      return userStatePDA;
    } catch (error) {
      // Try alternative seed patterns
      try {
        const [userStatePDA] = await PublicKey.findProgramAddress(
          [this.wallet.publicKey.toBuffer(), Buffer.from("state")],
          this.contractAddress
        );
        return userStatePDA;
      } catch (error2) {
        // If we can't find it, we need to get the correct PDA from a successful transaction
        this.log('⚠️ Could not derive user state PDA. You may need to provide the correct PDA.', 'error');
        throw new Error('Could not derive user state PDA');
      }
    }
  }

  async findReferralStatePDA() {
    const { PublicKey } = require('@solana/web3.js');
    
    // Try to find referral state PDA
    try {
      const [referralStatePDA] = await PublicKey.findProgramAddress(
        [this.wallet.publicKey.toBuffer(), Buffer.from("referral_state")],
        this.contractAddress
      );
      return referralStatePDA;
    } catch (error) {
      // Try alternative patterns
      try {
        const [referralStatePDA] = await PublicKey.findProgramAddress(
          [this.wallet.publicKey.toBuffer(), Buffer.from("referral")],
          this.contractAddress
        );
        return referralStatePDA;
      } catch (error2) {
        this.log('⚠️ Could not derive referral state PDA.', 'error');
        throw new Error('Could not derive referral state PDA');
      }
    }
  }

  async findReferralTokenAccountPDA() {
    const { PublicKey } = require('@solana/web3.js');
    
    // Try to find referral token account PDA
    try {
      const [referralTokenAccountPDA] = await PublicKey.findProgramAddress(
        [this.wallet.publicKey.toBuffer(), Buffer.from("referral_token")],
        this.contractAddress
      );
      return referralTokenAccountPDA;
    } catch (error) {
      // Try alternative patterns
      try {
        const [referralTokenAccountPDA] = await PublicKey.findProgramAddress(
          [this.wallet.publicKey.toBuffer(), Buffer.from("referral_account")],
          this.contractAddress
        );
        return referralTokenAccountPDA;
      } catch (error2) {
        this.log('⚠️ Could not derive referral token account PDA.', 'error');
        throw new Error('Could not derive referral token account PDA');
      }
    }
  }

  async getTokenBalance() {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        this.tokenMint,
        this.wallet.publicKey,
        false,
        new PublicKey(this.currentAccount.tokenProgram)
      );
      
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return accountInfo.value.uiAmount || 0;
    } catch (error) {
      return 0; // Account doesn't exist or other error
    }
  }

  async getClaimedRewards() {
    try {
      // This would require parsing the program logs or on-chain data
      // For now, we'll show a placeholder - you might need to implement
      // a way to track this from the program logs or contract state
      return "Check program logs for lifetime rewards";
    } catch (error) {
      return "Unable to retrieve";
    }
  }

  async showWalletInfo() {
    try {
      const tokenBalance = await this.getTokenBalance();
      const claimedRewards = await this.getClaimedRewards();
      
      this.log(`💰 Current WEED Balance: ${tokenBalance.toFixed(6)} WEED`);
      this.log(`📊 Claimed Rewards: ${claimedRewards}`);
      this.log(`🎯 Wallet: ${this.wallet.publicKey.toString()}`);
      this.log(`🔧 Active Account: ${config.activeAccount}`);
    } catch (error) {
      this.log(`⚠️ Could not retrieve wallet info: ${error.message}`, 'error');
    }
  }

  async attemptClaim() {
    try {
      this.log('🚀 Attempting to claim rewards...');
      
      // Show current balance before claim
      await this.showWalletInfo();
      
      const transaction = await this.createClaimTransaction();
      
      // Sign and send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet],
        { commitment: 'confirmed' }
      );

      this.log(`✅ Claim successful! Signature: ${signature}`, 'success');
      
      // Show updated balance after claim
      this.log('📈 Updated balance after claim:');
      await this.showWalletInfo();
      
      return { success: true, signature };
      
    } catch (error) {
      this.log(`❌ Claim failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async start() {
    if (this.isRunning) {
      this.log('Bot is already running!', 'error');
      return;
    }

    this.isRunning = true;
    this.log(`🤖 Solana Claiming Bot started!`);
    this.log(`⏰ Claiming every ${config.claimIntervalMinutes} minutes`);
    this.log(`📝 Wallet: ${this.wallet.publicKey.toString()}`);
    this.log(`🎯 Contract: ${this.contractAddress.toString()}`);
    this.log(`🔧 Active Account: ${config.activeAccount}`);

    // Initial claim attempt
    await this.attemptClaim();

    // Set up interval for subsequent claims
    this.intervalId = setInterval(async () => {
      await this.attemptClaim();
    }, this.claimInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log('🛑 Shutting down bot...');
      this.stop();
      process.exit(0);
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.log('🛑 Bot stopped');
  }
}

// Start the bot
const bot = new SolanaClaimingBot();
bot.start().catch(error => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});
