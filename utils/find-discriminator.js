const { Connection, PublicKey } = require('@solana/web3.js');
const config = require('../config.js');

async function findDiscriminator() {
  console.log('🔍 Finding the correct instruction discriminator...');
  
  try {
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const contractAddress = new PublicKey(config.contractAddress);
    
    // Get recent transactions for this program
    const signatures = await connection.getSignaturesForAddress(contractAddress, { limit: 10 });
    
    console.log(`📝 Found ${signatures.length} recent transactions`);
    
    for (let i = 0; i < Math.min(3, signatures.length); i++) {
      const sig = signatures[i];
      console.log(`\n🔍 Transaction ${i + 1}: ${sig.signature}`);
      
      try {
        const tx = await connection.getTransaction(sig.signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });
        
        if (tx && tx.meta && tx.meta.logMessages) {
          // Look for ClaimRewards instruction
          const claimLogs = tx.meta.logMessages.filter(log => 
            log.includes('ClaimRewards') || log.includes('Instruction:')
          );
          
          if (claimLogs.length > 0) {
            console.log('✅ Found ClaimRewards transaction!');
            console.log('📝 Logs:', claimLogs);
            
            // Try to find the instruction data
            if (tx.transaction && tx.transaction.message && tx.transaction.message.instructions) {
              const instructions = tx.transaction.message.instructions;
              for (let j = 0; j < instructions.length; j++) {
                const ix = instructions[j];
                if (ix.programIdIndex !== undefined) {
                  const programId = tx.transaction.message.accountKeys[ix.programIdIndex];
                  if (programId.toString() === contractAddress.toString()) {
                    console.log(`🎯 Found claim instruction at index ${j}`);
                    console.log(`📝 Instruction data: ${Buffer.from(ix.data, 'base64').toString('hex')}`);
                    console.log(`📝 First 8 bytes (discriminator): ${Buffer.from(ix.data, 'base64').slice(0, 8).toString('hex')}`);
                    return;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`❌ Error getting transaction: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findDiscriminator();
