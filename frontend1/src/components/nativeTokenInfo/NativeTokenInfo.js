import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

function NativeTokenInfo({ walletAddress }) {

  const provider = ethers.getDefaultProvider('mainnet');
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = 'KBSTDXJY5Q7X1A9Q9YGIFR4NNHNSR8GQJE';
  const baseUrl = 'https://api-sepolia.etherscan.io/api';


  //this is to get transactions of token in your wallet
  const handleFetchBalances = async () => {
    setLoading(true);
    try {
      const transactions = await getTransactionHistory(walletAddress);
      console.log(transactions);

      const historicalBalances = await calculateHistoricalBalance(walletAddress, transactions);
      setBalances(historicalBalances);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //      
  const getTransactionHistory = async (walletAddress) => {
    const url = `${baseUrl}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1') {
      return data.result;
    } else {
      throw new Error('Error fetching transaction history: ' + data.message);
    }
  };

  const getInitialBalance = async (walletAddress, blockNumber) => {
    const balance = await provider.getBalance(walletAddress, ethers.toBigInt(blockNumber));
    return ethers.formatEther(balance);
  };

  const calculateHistoricalBalance = async (walletAddress, transactions) => {
    const initialBalance = await getInitialBalance(walletAddress, transactions[0].blockNumber);
    let balance = ethers.parseEther(initialBalance);

    const balanceHistory = [{ timestamp: transactions[0].timeStamp, balance: initialBalance }];

    transactions.forEach((tx) => {
      const value = ethers.parseEther(ethers.formatEther(tx.value));
      if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
        balance = balance + value; // Inbound transaction
      }
      if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
        balance = balance - value; // Outbound transaction
        balance = balance - ethers.parseEther(ethers.formatEther(tx.gasPrice * tx.gasUsed));
      }
      balanceHistory.push({ timestamp: tx.timeStamp, balance: ethers.formatEther(balance) });
    });
    console.log(balanceHistory);

  };




  //config for coinGecko api
  const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'x-cg-api-key': 'CG-S2ttSUxQwf3Q1opsge95Zzh1' }
  };

  const secondsInMonth = 2629743;
  const date = new Date();
  const endDate = Math.floor(date.getTime() / 1000);
  const startDate = endDate - (3 * secondsInMonth); //3 months ago
  // const [startDate, setStartDate] = useState(new Date);
  const [currentBalance, setCurrentBalance] = useState(null);
  //get current balance of native token
  const fetchCurrentBalance = async () => {
    try {
      const response = await fetch(`${baseUrl}?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${apiKey}`);
      const data = await response.json();
      setCurrentBalance(ethers.formatEther(data.result));
    } catch (err) {
      console.error(err);
    }
  }

  //function to get historical masterprice of token
  const fetchHistoricalPrice = async () => {
    try {
      console.log(startDate, endDate);

      const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${startDate}&to=${endDate}`, options);
      const data = await response.json();
      console.log(data['prices']);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchCurrentBalance();
    fetchHistoricalPrice();
    handleFetchBalances();
  }, [])

  return (<>
    <div>NativeTokenInfo</div>
    <div>Current balance: {currentBalance}

    </div>
    <label for="start-date">Start Date:</label>
    <input type="date" id="start-date" />
    <label for="end-date">End Date:</label>
    <input type="date" id="end-date" />
    <button>Get Balances</button>
    <div id="balance-output"></div>
  </>
  )
}

export default NativeTokenInfo