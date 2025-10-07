const config = require('../config.js');

function switchAccount(accountName) {
  if (!config.accounts[accountName]) {
    console.log(`❌ Account '${accountName}' not found!`);
    console.log(`Available accounts: ${Object.keys(config.accounts).join(', ')}`);
    return false;
  }

  // Update the active account in config
  config.activeAccount = accountName;
  
  console.log(`✅ Switched to account: ${accountName}`);
  console.log(`📝 Wallet: ${config.accounts[accountName].privateKey.substring(0, 10)}...`);
  console.log(`🎯 Contract: ${config.accounts[accountName].contractAddress}`);
  console.log(`💰 Token: ${config.accounts[accountName].tokenMint}`);
  
  return true;
}

function listAccounts() {
  console.log('📋 Available Accounts:');
  Object.keys(config.accounts).forEach(accountName => {
    const account = config.accounts[accountName];
    const isActive = config.activeAccount === accountName;
    console.log(`${isActive ? '✅' : '⚪'} ${accountName}: ${account.privateKey.substring(0, 10)}...`);
  });
  console.log(`\n🔧 Current Active Account: ${config.activeAccount}`);
}

// Command line interface
const args = process.argv.slice(2);
if (args.length === 0) {
  listAccounts();
} else if (args[0] === 'list') {
  listAccounts();
} else if (args[0] === 'switch') {
  if (args[1]) {
    switchAccount(args[1]);
  } else {
    console.log('❌ Please specify an account name to switch to');
    console.log('Usage: node switch-account.js switch <account_name>');
  }
} else {
  console.log('Usage:');
  console.log('  node switch-account.js                    - List all accounts');
  console.log('  node switch-account.js list               - List all accounts');
  console.log('  node switch-account.js switch <account>   - Switch to account');
}
