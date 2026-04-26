const { newKit } = require('@celo/contractkit');
require('dotenv').config();

// Try multiple RPC endpoints
const RPC_URLS = [
  'https://forno.celo.org',
  'https://rpc.ankr.com/celo',
  'https://1rpc.io/celo',
  'https://alfajores-forno.celo-testnet.org',
];

async function run() {
  for (const url of RPC_URLS) {
    console.log(`\n🔗 Trying: ${url}`);
    const kit = newKit(url);

    try {
      const block = await kit.web3.eth.getBlockNumber();
      const chainId = await kit.web3.eth.getChainId();
      const networkName = chainId === 42220 ? 'Celo Mainnet' : chainId === 44787 ? 'Alfajores Testnet' : 'Unknown';

      console.log(`   ✅ Connected! Block: ${block} | Chain: ${networkName} (${chainId})`);

      // Check cUSD
      const stableToken = await kit.contracts.getStableToken();
      const name = await stableToken.name();
      console.log(`   ✅ cUSD: ${name}`);

      // Check fee collector
      const feeCollector = process.env.VITE_FEE_COLLECTOR;
      if (feeCollector) {
        const balance = await stableToken.balanceOf(feeCollector);
        const bal = (BigInt(balance.toString()) / BigInt(1e18)).toString();
        console.log(`   💰 Fee Collector Balance: ${bal} cUSD`);
      }

      console.log('\n🎉 Celo SDK is working! Use this RPC in your .env\n');
      process.exit(0);
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message.slice(0, 80)}`);
    }
  }

  console.log('\n⚠️  All RPCs failed. Check your internet connection or try a VPN.\n');
  process.exit(1);
}

run();
