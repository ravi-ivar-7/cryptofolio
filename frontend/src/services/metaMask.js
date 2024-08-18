import React, { useState, useEffect } from 'react';
import { JsonRpcProvider, parseEther, formatEther, Wallet } from 'ethers';
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

const MetaMaskComponent = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [privateKey, setPrivateKey] = useState('');

    useEffect(() => {
        // Load saved values from localStorage
        const savedAddress = localStorage.getItem('address');
        const savedBalance = localStorage.getItem('balance');
        const savedTransactionHash = localStorage.getItem('transactionHash');

        if (savedAddress) setAddress(savedAddress);
        if (savedBalance) setBalance(savedBalance);
        if (savedTransactionHash) setTransactionHash(savedTransactionHash);

        // Note: provider and signer are not stored in localStorage due to their complex nature
    }, []);

    useEffect(() => {
        // Save values to localStorage whenever they change
        localStorage.setItem('address', address);
        localStorage.setItem('balance', balance);
        localStorage.setItem('transactionHash', transactionHash);
    }, [address, balance, transactionHash]);

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

    const connectToMetaMask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const newProvider = new JsonRpcProvider(window.ethereum);
                const newSigner = newProvider.getSigner();
                const userAddress = await newSigner.getAddress();

                setProvider(newProvider);
                setSigner(newSigner);
                setAddress(userAddress);
                showNotification('Success', `Connected address: ${userAddress}`, 'success');
            } catch (error) {
                showNotification('Error', 'User denied account access', 'danger');
                console.error('User denied account access', error);
            }
        } else {
            showNotification('Error', 'MetaMask is not installed', 'danger');
            console.error('MetaMask is not installed');
        }
    };

    const connectToMetaMaskManually = async () => {
        try {
            const provider = new JsonRpcProvider();
            const wallet = new Wallet(privateKey, provider);
            const address = wallet.address;
            // const balance = await wallet.getBalance();

            showNotification('Success', `Manually connected address: ${address}`, 'success');
            setProvider(provider);
            setSigner(wallet);
            setAddress(address);
            // setBalance(formatEther(balance));
        } catch (error) {
            showNotification('Error', 'Failed to connect manually', 'danger');
            console.error('Failed to connect manually:', error);
        }
    };

    const getBalance = async () => {
        if (!provider || !address) return;
        try {
            const balance = await provider.getBalance(address);
            setBalance(formatEther(balance));
            showNotification('Info', `Balance fetched: ${formatEther(balance)} ETH`, 'info');
        } catch (error) {
            showNotification('Error', 'Failed to fetch balance', 'danger');
            console.error('Failed to fetch balance', error);
        }
    };

    const sendTransaction = async (toAddress, amountInEther) => {
        if (!signer) return;

        const tx = {
            to: toAddress,
            value: parseEther(amountInEther),
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
                    style={{ margin: '5px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Connect to MetaMask
                </button>
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <input
                    type="text"
                    placeholder="Enter Private Key"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    style={{ padding: '10px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button 
                    onClick={connectToMetaMaskManually} 
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Connect Manually
                </button>
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button 
                    onClick={getBalance} 
                    style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Get Balance
                </button>
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <input
                    type="text"
                    placeholder="Recipient Address"
                    id="recipient"
                    style={{ padding: '10px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button 
                    onClick={() => sendTransaction(document.getElementById('recipient').value, '0.01')} 
                    style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Send Transaction
                </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
                <div>Address: {address}</div>
                <div>Balance: {balance} ETH</div>
                <div>Transaction Hash: {transactionHash}</div>
            </div>
        </div>
    );
};

export default MetaMaskComponent;
