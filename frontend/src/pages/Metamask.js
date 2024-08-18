import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import TokenHistory from '../services/tokenHistory.js';

const apiKey = 'KBSTDXJY5Q7X1A9Q9YGIFR4NNHNSR8GQJE';
const baseUrl = 'https://api-sepolia.etherscan.io/api';

const DEFAULT_NETWORK = 'sepolia'

const TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

const MetaMaskComponent = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [balance, setBalance] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [manualAddress, setManualAddress] = useState('');
    // const [startDate, setStartDate] = useState(new Date);
    const [watchlist, setWatchlist] = useState([]);
    const [newTokenAddress, setNewTokenAddress] = useState('');
    const [tokenData, setTokenData] = useState({});

    // useEffect(() => {
    //     const savedWalletAddress = localStorage.getItem('address');
    //     const savedBalance = localStorage.getItem('balance');
    //     const savedTransactionHash = localStorage.getItem('transactionHash');

    //     if (savedWalletAddress) setWalletAddress(savedWalletAddress);
    //     if (savedBalance) setBalance(savedBalance);
    //     if (savedTransactionHash) setTransactionHash(savedTransactionHash);
    // }, []);

    // useEffect(() => {
    //     localStorage.setItem('walletAddress', walletAddress);
    //     localStorage.setItem('balance', balance);
    //     localStorage.setItem('transactionHash', transactionHash);
    // }, []);

    const showNotification = (title, message, type) => {
        Store.addNotification({
            title: title,
            message: message,
            type: type,
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
                duration: 5000,
                onScreen: true
            }
        });
    };
    // token addition to watchlist, getting their balances:

    const fetchTokenData = async (watchlist) => {
        // const provider = new ethers.BrowserProvider(window.ethereum);
        const provider = new ethers.getDefaultProvider('mainnet');
        try {
            const data = {};
            console.log(watchlist);
            
            for (const address of watchlist) {
                const tokenContract = new ethers.Contract(address, TOKEN_ABI, provider);
                const [name, symbol, decimals] = await Promise.all([
                    tokenContract.name(),
                    tokenContract.symbol(),
                    tokenContract.decimals()
                ]);

                

                const balance = await tokenContract.balanceOf(walletAddress);

                data[address] = {
                    name,
                    symbol,
                    decimals,
                    balance: ethers.formatUnits(balance, decimals)
                };
            }
            console.log("inside fetchtokendata");
            
            console.log(data);
            
            setTokenData(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

   
    const addTokenToWatchlist = () => {
        if (ethers.isAddress(newTokenAddress)) {
            let newWatchlist = watchlist;
            newWatchlist = [...newWatchlist, newTokenAddress];
            setWatchlist([...watchlist, newTokenAddress]);
            setNewTokenAddress('');
            fetchTokenData(newWatchlist, provider);
        }
    };

    const removeTokenFromWatchlist = (address) => {
        setWatchlist(watchlist.filter(item => item !== address));
    };
// endhere

    const getTransactionHistory = async (address) => {
        if (address) {
            const url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log('data', data)
            if (data.status === '1') {
                return data.result;
            } else {
                throw new Error('Error fetching transaction history: ' + data.message);
            }

        } else {
            showNotification('Error', `Wallet Address missing: ${address}`, 'danger')
        }

    };

    const getInitialBalance = async (address, blockNumber, provider) => {
        const balance = await provider.getBalance(address, ethers.toBigInt(blockNumber));
        console.log(balance, 'getIntialBalace')
        return ethers.formatEther(balance);
    };

    const calculateHistoricalBalance = async (address, transactions, provider) => {
        console.log(address, 'address', transactions)
        const initialBalance = await getInitialBalance(address, transactions[0].blockNumber, provider);
        let balance = ethers.parseEther(initialBalance);

        const balanceHistory = [{ timestamp: transactions[0].timeStamp, balance: initialBalance }];

        transactions.forEach((tx) => {
            if (tx.blockNumber === transactions[0].blockNumber) {
                return;
            }
            const value = ethers.parseEther(ethers.formatEther(tx.value));
            if (tx.to.toLowerCase() === address.toLowerCase()) {
                balance = balance + value; // Inbound transaction
            }
            if (tx.from.toLowerCase() === address.toLowerCase()) {
                balance = balance - value; // Outbound transaction
                balance = balance - ethers.parseEther(ethers.formatEther(tx.gasPrice * tx.gasUsed));
            }
            balanceHistory.push({ timestamp: tx.timeStamp, balance: ethers.formatEther(balance) });
        });
        console.log(balanceHistory);

    };

    //function to get historical masterprice of token
    const fetchHistoricalPrice = async () => {
        const options = {
            method: 'GET',
            headers: { accept: 'application/json', 'x-cg-api-key': 'CG-S2ttSUxQwf3Q1opsge95Zzh1' }
        };

        const secondsInMonth = 2629743;
        const date = new Date();
        const endDate = Math.floor(date.getTime() / 1000);
        const startDate = endDate - (3 * secondsInMonth);

        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${startDate}&to=${endDate}`, options);
            const data = await response.json();
            console.log(' historical price')
            console.log(data['prices']);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchEthBalance = async (address) => {
        if (!provider || !address) return;
        try {
            const balance = await provider.getBalance(address);
            const formattedBalance = ethers.formatEther(balance);
            setBalance(formattedBalance);
            showNotification('Info', `Balance fetched: ${formattedBalance} ETH`, 'info');
        } catch (error) {
            showNotification('Error', 'Failed to fetch balance', 'danger');
            console.error('Failed to fetch balance', error);
        }
    };
    const connectToMetaMaskManually = async () => {
        try {
            if (ethers.isAddress(manualAddress)) {
                const newProvider = new ethers.getDefaultProvider(DEFAULT_NETWORK);
                setProvider(newProvider)
                setWalletAddress(manualAddress);
                setIsConnected(false)
                showNotification('Success', `Manually connected address: ${manualAddress}`, 'success');
                await fetchEthBalance(manualAddress);
                await fetchHistoricalPrice(walletAddress)
                const transactionList = await getTransactionHistory(manualAddress);
                await calculateHistoricalBalance(manualAddress, transactionList, newProvider)
            } else {
                showNotification("Error", "Invalid Ethereum address. Please check and try again.", "danger");
            }
        } catch (error) {
            showNotification('Error', 'Failed to connect manually', 'danger');
            console.error('Failed to connect manually:', error);
        }
    };
    const connectToMetaMask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                const newSigner = await newProvider.getSigner();
                const walletAddress = await newSigner.getAddress();

                setProvider(newProvider);
                setSigner(newSigner);
                setWalletAddress(walletAddress);
                setIsConnected(true);
                showNotification('Success', `Connected address: ${walletAddress}`, 'success');
                setIsConnected(true)
                await fetchEthBalance(walletAddress);
                await fetchHistoricalPrice(walletAddress)
                const transactionList = await getTransactionHistory(walletAddress);
                await calculateHistoricalBalance(walletAddress, transactionList, newProvider)

            } catch (error) {
                showNotification('Error', 'User denied account access', 'danger');
                console.error('User denied account access', error);
            }
        } else {
            showNotification('Error', 'MetaMask is not installed', 'danger');
            console.error('MetaMask is not installed');
        }
    };


    const sendTransaction = async (toAddress, amountInEther) => {
        if (!signer) return;

        const tx = {
            to: toAddress,
            value: ethers.parseEther(amountInEther),
        };

        try {
            const transactionResponse = await signer.sendTransaction(tx);
            setTransactionHash(transactionResponse.hash);
            showNotification('Info', `Transaction Hash: ${transactionResponse.hash}`, 'info');
            await transactionResponse.wait();
            showNotification('Success', 'Transaction Mined', 'success');
        } catch (error) {
            showNotification('Error', 'Transaction Failed', 'danger');
            console.error('Transaction Failed', error);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h2 style={{ textAlign: 'center', color: '#333' }}>MetaMask Interaction</h2>
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
            onClick={connectToMetaMask}
            style={{
                margin: '5px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            Connect to MetaMask
        </button>
    </div>
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <input
            type="text"
            placeholder="Enter Address Key"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            style={{
                padding: '10px',
                marginRight: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc'
            }}
        />
        <button
            onClick={connectToMetaMaskManually}
            style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            Connect Manually
        </button>
    </div>

    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
    <input
        type="text"
        placeholder="Recipient Address"
        id="recipient"
        style={{
            padding: '10px',
            marginRight: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: 'calc(40% - 20px)'
        }}
    />
    <input
        type="text"
        placeholder="Amount (ETH)"
        id="amount"
        style={{
            padding: '10px',
            marginRight: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: 'calc(20% - 20px)'
        }}
    />
    <button
        onClick={() => sendTransaction(document.getElementById('recipient').value, document.getElementById('amount').value)}
        style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        }}
    >
        Send Transaction
    </button>
</div>

    <div style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
        <div>Address: {walletAddress}</div>
        <div>Balance: {balance} ETH</div>
        <div>Transaction Hash: {transactionHash}</div>
    </div>

    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginTop: '30px' }}>
        <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>Token Watchlist</h2>
        <input
            type="text"
            value={newTokenAddress}
            onChange={(e) => setNewTokenAddress(e.target.value)}
            placeholder="Enter token contract address"
            style={{
                padding: '10px',
                width: 'calc(100% - 120px)',
                marginRight: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc'
            }}
        />
        <button
            onClick={addTokenToWatchlist}
            style={{
                margin:'10px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            Add to Watchlist
        </button>
        <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '20px' }}>
            {watchlist.map(address => (
                <li key={address} style={{
                    padding: '15px',
                    backgroundColor: '#fff',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                }}>
                    {tokenData[address] ? (
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{tokenData[address].name} ({tokenData[address].symbol})</h3>
                            <p style={{ margin: '0 0 10px 0' }}>Balance: {tokenData[address].balance} {tokenData[address].symbol}</p>
                            <button
                                onClick={() => removeTokenFromWatchlist(address)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center' }}>Loading data for {address}...</p>
                    )}
                  {walletAddress && <TokenHistory walletAddress={walletAddress} contractAddress={address} />}

                </li>
            ))}
        </ul>
    </div>
    
</div>

    );
};

export default MetaMaskComponent;
