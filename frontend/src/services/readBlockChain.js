import { JsonRpcProvider, formatEther } from 'ethers';

// Create a provider connected to the Ethereum mainnet via Infura
const provider = new JsonRpcProvider(`https://mainnet.infura.io/v3/0e6b22a9424848479cfdc7696e3e0ccf`);

const queryBlockchain = async () => {
    const block = await provider.getBlockNumber();
    console.log("Current block number:", block);

    const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // 0x78446322BF5a829D895dF1A1E633bce4cB6c4de9

    // Get the balance of the specified address
    const balance = await provider.getBalance(address);
    console.log(balance)
    // Convert the balance from Wei to Ether and log it
    console.log("Account balance (in Ether):", formatEther(balance));
};

queryBlockchain();
