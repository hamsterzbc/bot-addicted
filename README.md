# Addicted Claiming Bot

A powerful and flexible Solana claiming bot for automated game rewards. This bot supports multiple accounts, automatic claiming intervals, and comprehensive error handling.

## 🚀 Features

- **Multi-Account Support**: Easily manage multiple Solana accounts
- **Automatic Claiming**: Set custom intervals for automatic reward claiming
- **Flexible Configuration**: Support for different private key formats
- **Comprehensive Logging**: Detailed logs with timestamps and status indicators
- **Error Handling**: Robust error handling with graceful recovery
- **Utility Scripts**: Helper scripts for account management and testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Solana wallet with private key
- RPC endpoint access (mainnet/testnet)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solana-claiming-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your accounts**
   ```bash
   cp config.example.js config.js
   ```

4. **Edit `config.js` with your account details**

## ⚙️ Configuration

### Basic Setup

1. Copy `config.example.js` to `config.js`
2. Update the configuration with your account details:

```javascript
module.exports = {
  // Current Active Account
  activeAccount: 'account1',
  
  accounts: {
    account1: {
      privateKey: 'YOUR_PRIVATE_KEY_HERE',
      contractAddress: 'YOUR_CONTRACT_ADDRESS',
      tokenMint: 'YOUR_TOKEN_MINT',
      // ... other account-specific settings
    }
  },
  
  // Global settings
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  claimIntervalMinutes: 15,
  logLevel: 'info'
};
```

### Account Configuration

Each account requires the following information:

- **privateKey**: Your wallet's private key (base58, JSON array, or base64 format)
- **contractAddress**: The smart contract address
- **tokenMint**: The token mint address for rewards
- **userStatePDA**: Program Derived Address for user state
- **globalStatePDA**: Program Derived Address for global state
- **configPDA**: Program Derived Address for configuration
- **mintAuthority**: Mint authority address
- **referralStatePDA**: Referral state PDA
- **referralTokenAccountPDA**: Referral token account PDA
- **instructionDiscriminator**: Instruction discriminator (hex format)

### Private Key Formats

The bot supports multiple private key formats:

- **Base58 (Phantom format)**: `5G3TxYs6d1wsEwq8iRcMsyzNkitmTsvYiSnrizNn2NMhuFAdeqJxXnzG2WkvpnS32XSyPuUihPQ3ikWWchag3o7V`
- **JSON Array**: `[1,2,3,4,5,...]`
- **Base64**: `AQIDBAUGBwgJCgsMDQ4PEA==`

## 🚀 Usage

### Start the Bot

```bash
npm start
```

### Switch Between Accounts

```bash
# List available accounts
node utils/switch-account.js

# Switch to a specific account
node utils/switch-account.js switch account2
```

### Utility Scripts

The `utils/` directory contains helpful scripts:

- **`check-balance.js`**: Check your wallet and token balances
- **`check-user-state.js`**: Verify user state and PDAs
- **`test-wallet.js`**: Test wallet loading and configuration
- **`create-token-account.js`**: Create token accounts if needed
- **`initialize-user.js`**: Initialize user state if required
- **`find-discriminator.js`**: Find instruction discriminators
- **`switch-account.js`**: Manage multiple accounts

### Example Usage

```bash
# Check your current balance
node utils/check-balance.js

# Test wallet configuration
node utils/test-wallet.js

# Switch to account2
node utils/switch-account.js switch account2

# Start the bot
npm start
```

## 📁 Project Structure

```
solana-claiming-bot/
├── index.js                 # Main bot application
├── config.js               # Your configuration (not in git)
├── config.example.js       # Configuration template
├── package.json            # Dependencies and scripts
├── .gitignore             # Git ignore rules
├── README.md              # This file
└── utils/                 # Utility scripts
    ├── check-balance.js
    ├── check-user-state.js
    ├── create-token-account.js
    ├── find-discriminator.js
    ├── initialize-user.js
    ├── switch-account.js
    └── test-wallet.js
```

## 🔧 Configuration Options

### Global Settings

- **rpcUrl**: Solana RPC endpoint
- **claimIntervalMinutes**: Time between claims (default: 15 minutes)
- **logLevel**: Logging level ('info', 'debug', 'error')
- **computeUnitPrice**: Compute unit price for transactions
- **computeUnitLimit**: Compute unit limit for transactions

### Account Settings

Each account can have different:
- Private keys
- Contract addresses
- Token mints
- PDA addresses
- Instruction discriminators

## 🛡️ Security

- **Never commit `config.js`** - it contains your private keys
- Use environment variables for sensitive data in production
- Keep your private keys secure and never share them
- Consider using hardware wallets for production use

## 🐛 Troubleshooting

### Common Issues

1. **"Token account does not exist"**
   - Run `node utils/create-token-account.js` to create the token account

2. **"Could not derive user state PDA"**
   - Check your contract address and user state configuration
   - Run `node utils/check-user-state.js` to verify

3. **"Error loading wallet"**
   - Verify your private key format
   - Run `node utils/test-wallet.js` to test

4. **Transaction failures**
   - Check your SOL balance for transaction fees
   - Verify all PDA addresses are correct
   - Ensure the contract is deployed and active

### Getting Help

1. Check the logs for detailed error messages
2. Use utility scripts to diagnose issues
3. Verify your configuration matches the contract requirements
4. Ensure you have sufficient SOL for transaction fees

## 📝 Logs

The bot provides detailed logging with:
- Timestamps for all events
- Status indicators (✅ success, ❌ error, ℹ️ info)
- Wallet and account information
- Transaction signatures
- Balance updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is provided for educational purposes only. Use at your own risk. The authors are not responsible for any financial losses or damages resulting from the use of this software.

## 🔗 Links

- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Program](https://spl.solana.com/token)

---

**Happy Claiming! 🎉**