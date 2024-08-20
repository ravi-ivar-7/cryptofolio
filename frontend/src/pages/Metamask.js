import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import { PriceChart, ForecastChart } from '../components/chart.js'
import Authenticate from './Authenticate.js'

const ETHERSCAN_APIKEYS = process.env.REACT_APP_ETHERSCAN_APIKEYS
const ETHERSCAN_BASEURL = process.env.REACT_APP_ETHERSCAN_BASEURL

const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK

const FASTAPI_BASEURL = process.env.REACT_APP_FASTAPI_BASEURL
const NODEJS_BASEURL = process.env.REACT_APP_NODEJS_BASEURL

const COINGECKO_APIKEYS = process.env.REACT_APP_COINGECKO_APIKEYS

const TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

const MetaMaskComponent = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [balance, setBalance] = useState(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [manualAddress, setManualAddress] = useState('');
    const [manualConnected, setManualConnected] = useState(false);
    const [metaMaskConnected, setMetaMaskConnected] = useState(false);
    const [balanceChartValues, setBalanceChartValues] = useState(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState()

    useEffect(() => {
        const cryptofolioUserName = localStorage.getItem('cryptofolioUserName');
        const cryptofolioUserEmail = localStorage.getItem('cryptofolioUserEmail');
        const cryptofolioToken = localStorage.getItem('cryptofolioToken');
        if (!cryptofolioUserName || !cryptofolioUserEmail || !cryptofolioToken) {
            localStorage.removeItem('cryptofolioToken')
            localStorage.removeItem('cryptofolioUser')
            setIsAuthenticated(false)
        }
        else {
            setUser({ email: cryptofolioUserEmail, name: cryptofolioUserName })
            setIsAuthenticated(!!cryptofolioToken && !!cryptofolioUserName && !!cryptofolioUserEmail);
        }

    }, []);

    const handleLoginSuccess = (user, token) => {
        localStorage.setItem('cryptofolioUserEmail', user.email);
        localStorage.setItem('cryptofolioUserName', user.name);
        localStorage.setItem('cryptofolioToken', token);
        setUser({ email: user.email, name: user.name })
        setIsAuthenticated(true);
    };

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

    const getInitialBalance = async (address, blockNumber, provider) => {
        try {
            const balance = await provider.getBalance(address, ethers.toBigInt(blockNumber));
            return ethers.formatEther(balance);
        } catch (error) {
            showNotification('Error', 'Failed to fetch initial balance', 'danger');
            return '0';// default to 0, 
        }
    };

    const calculateHistoricalBalance = async (address, transactions, provider) => {
        try {
            const initialBalance = await getInitialBalance(address, transactions[0].blockNumber, provider);
            let balance = ethers.parseEther(initialBalance);
            const balanceHistory = [{ timestamp: transactions[0].timeStamp, balance: initialBalance }];
            for (let i = 1; i < transactions.length; i++) {
                const tx = transactions[i];
                const value = ethers.parseEther(ethers.formatEther(tx.value));
                if (tx.to.toLowerCase() === address.toLowerCase()) {
                    balance = balance + value// Inbound transaction
                }
                if (tx.from.toLowerCase() === address.toLowerCase()) {
                    balance = balance - (value); // Outbound transaction
                    balance = balance - (ethers.parseEther(ethers.formatEther(tx.gasPrice * tx.gasUsed))); // Deduct gas fees
                }
                balanceHistory.push({ timestamp: tx.timeStamp, balance: ethers.formatEther(balance) });
            }
            const xValue = balanceHistory.map(item => new Date(item.timestamp * 1000)); // Convert to Date object
            const yValue = balanceHistory.map(item => parseFloat(item.balance)); // Convert balance to float
            setBalanceChartValues([xValue, yValue]);
        } catch (error) {
            console.log(error)
            showNotification('Error', 'Failed to calculate historical balance', 'danger');
        }
    };

    const getTransactionHistory = async (address) => { // and from this transation list, we will calculate balace over time of user account
        if (address) {
            const url = `${ETHERSCAN_BASEURL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_APIKEYS}`;
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

    const fetchEthBalance = async (address) => {
        if (!provider || !address) return;
        try {
            const balance = await provider.getBalance(address);
            const formattedBalance = ethers.formatEther(balance);
            showNotification('Info', `Balance fetched: ${formattedBalance} ETH`, 'info');
            setBalance(formattedBalance);
        } catch (error) {
            showNotification('Error', 'Failed to fetch balance', 'danger');
        }
    };

    useEffect(() => {
        if (walletAddress || manualAddress) { fetchEthBalance(walletAddress || manualAddress); }
    }, [walletAddress, manualAddress, provider]);

    const connectToMetaMaskManually = async (manualAddress) => {
        try {
            if (ethers.isAddress(manualAddress)) {
                const newProvider = new ethers.getDefaultProvider(DEFAULT_NETWORK);
                setProvider(newProvider)
                setWalletAddress(manualAddress);
                setManualConnected(true)
                showNotification('Success', `Manually connected address: ${manualAddress}`, 'success');
                const transactionList = await getTransactionHistory(manualAddress);
                await calculateHistoricalBalance(manualAddress, transactionList, newProvider)
            } else {
                showNotification("Error", "Invalid Ethereum address. Please check and try again.", "danger");
            }
        } catch (error) {
            showNotification('Error', `Failed to connect manually.`, 'danger');
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
                setMetaMaskConnected(true)
                const transactionList = await getTransactionHistory(walletAddress);
                await calculateHistoricalBalance(walletAddress, transactionList, newProvider)
                console.log(balanceChartValues, 'balance chart vlaues')
                showNotification('Success', `Connected address: ${walletAddress}`, 'success');
            } catch (error) {
                showNotification('Error', `User denied account access.`, 'danger');
                console.error('User denied account access', error);
            }
        } else {
            showNotification('Error', 'MetaMask is not installed. Please add MetaMask extension to your browser.', 'danger');
            console.error('MetaMask is not installed');
        }
    };

    const sendTransaction = async (toAddress, amountInEther) => {
        if (!signer) return;
        const tx = { to: toAddress, value: ethers.parseEther(amountInEther), };
        try {
            const transactionResponse = await signer.sendTransaction(tx);
            showNotification('Info', `Transaction Hash: ${transactionResponse.hash}`, 'info');
            await transactionResponse.wait();
            showNotification('Success', 'Transaction Mined', 'success');
        } catch (error) {
            showNotification('Error', `Transation Failed. Error ${error.code}`, 'danger');
        }
    };
    // -----------------------------------------------------------------------------------------------------------------------------

    const [selectedCoinId, setSelectedCoinId] = useState('');
    const [watchList, setWatchList] = useState([]);
    const [coinList, setCoinList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCoins, setFilteredCoins] = useState([]);
    const [showHistoricalChart, setShowHistoricalChart] = useState(false);
    const [showDateInputs, setShowDateInputs] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [coinDetails, setCoinDetails] = useState(null);
    const [showCoinDetails, setShowCoinDetails] = useState(false)
    const [coinDetailsLoading, setCoinDetailsLoading] = useState(false)
    const [marketPriceHistory, setMarketPriceHistory] = useState(null);

    const [displayFutureTrends, setDisplayFutureTrends] = useState(false);
    const [futureTrendLoading, setFutureTrendLoading] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [forecastDataMap, setForecastDataMap] = useState({});
    const [coinIdForAnalysis, setCoinIdForAnalysis] = useState('');

    const futureOptions = ['exponential_smoothing', 'arima', 'prophet', 'random_forest'];

    useEffect(() => {
        const fetchCoinList = async () => {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-cg-api-key': COINGECKO_APIKEYS
                }
            };
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/coins/list', options);
                const coins = await response.json();
                setCoinList(coins);
            } catch (error) {
                console.error('Error fetching coin list:', error);
            }
        };

        const fetchWatchList = async () => {
            try {
                const token = localStorage.getItem('cryptofolioToken');

                const response = await fetch(`${NODEJS_BASEURL}/get-watchlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    showNotification('Error', errorData.warn || 'An error occurred during fetching the watchlist.', 'danger');
                    return;
                }
                const data = await response.json();
                const watchList = data.watchList;

                if (watchList.length > 0) {
                    // Access the first object in the array
                    const watchListItem = watchList[0];
                    // Extract coins from the first item
                    const { coins } = watchListItem;
                    // Set the state with the coins array
                    setWatchList(coins);
                } else {
                    showNotification('Error', 'Watchlist is empty.', 'warning');
                    setWatchList([]); 
                }
            } catch (error) {
                console.log('Error fetching watchlist:', error);
                showNotification('Error', 'An error occurred during fetching the watchlist.', 'danger');
            }
        };


        fetchCoinList();
        if (isAuthenticated) {
            fetchWatchList();
        }
    }, [isAuthenticated]);



    useEffect(() => {
        if (coinList) {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = coinList.filter(coin =>
                coin.name.toLowerCase().includes(lowercasedQuery) ||
                coin.symbol.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredCoins(filtered);
        }
    }, [searchQuery, coinList]);

    const addToWatchList = async (coin) => {
        if (!coin) return;

        try {
            const token = localStorage.getItem('cryptofolioToken');

            const response = await fetch(`${NODEJS_BASEURL}/add-to-watchlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ user, coin }),
            });

            const data = await response.json();
            if (response.status === 200) {
                setWatchList(prevWatchList => [...prevWatchList, coin]);
            } else {
                console.log(data.warn);
                showNotification('Error', data.warn || 'An error occurred during adding coin to watchlist.', 'danger');
            }
        } catch (error) {
            console.log(error);
            showNotification('Error', 'An error occurred during adding coin to watchlist.', 'danger');
        }
    };




    const handleRemoveCoin = async (coinId) => {
        try {
            const token = localStorage.getItem('cryptofolioToken');

            const response = await fetch(`${NODEJS_BASEURL}/remove-from-watchlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ user, coinId }),
            });

            const data = await response.json();
            if (response.status === 200) {
                setWatchList(watchList.filter(coin => coin.id !== coinId));
            } else {
                console.log(data.warn);
                showNotification('Error', data.warn || 'An error occurred during removing coin from watchlist.', 'danger');
            }
        } catch (error) {
            console.log(error);
            showNotification('Error', 'An error occurred during removing coin from watchlist.', 'danger');
        }
    };


    const hanldeCoinIdForAnalysis = async (coinId) => {
        setCoinIdForAnalysis(coinId)
        setForecastDataMap([]);
        setShowHistoricalChart(false)
        setCoinDetails(null)
        setMarketPriceHistory(null)
        setDisplayFutureTrends(false)
        setShowCoinDetails(false)
        setSelectedOptions([])
        setShowDateInputs(false)
        setStartDate(null)
        setEndDate(null)

    }

    const handleCoinDetails = async (coinId) => {
        if (!(manualConnected || metaMaskConnected)) {
            showNotification('Error', `Connect to your account to fetch details of coin ${coinId}.`, 'danger');
            setCoinDetails(false)
            return;
        }
        setCoinDetailsLoading(true)
        const provider = ethers.getDefaultProvider('mainnet');
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const coinInfo = await response.json();
            const detailPlatforms = coinInfo.detail_platforms;

            if (!detailPlatforms || Object.keys(detailPlatforms).length === 0) {
                throw new Error('No platforms found in detail_platforms');
            }

            // Fetch the first platform's details
            const firstPlatform = Object.keys(detailPlatforms)[0];
            const contractAddress = await detailPlatforms[firstPlatform]?.contract_address
            const decimals = await detailPlatforms[firstPlatform]?.decimal_place

            if (!contractAddress || !decimals) {
                throw new Error('Contract address or decimals not found');
            }
            const tokenContract = new ethers.Contract(contractAddress, TOKEN_ABI, provider);

            // Fetch the balance
            const balance = await tokenContract.balanceOf(walletAddress);
            const formattedBalance = ethers.formatUnits(balance, decimals);

            // Construct the new coin details object
            const newCoinDetails = {
                name: coinInfo.name,
                symbol: coinInfo.symbol,
                description: coinInfo.description.en,
                platform: firstPlatform,
                contractAddress,
                balance: formattedBalance,
                image: coinInfo.image.small,
                homepage: coinInfo.links.homepage[0], // Taking the first homepage link
                whitepaper: coinInfo.links.whitepaper,
                blockchainSite: coinInfo.links.blockchain_site[0] // Taking the first blockchain site link
            };
            setCoinDetails(newCoinDetails);
            showNotification('Success', `Data for ${newCoinDetails.symbol} fetched successfully`, 'info');
        } catch (error) {
            showNotification('Error', 'Failed to fetch token data', 'danger');
            console.error('Failed to fetch token data', error);
        }
        finally {
            setCoinDetailsLoading(false)
        }
    };
    const handleHistoricalCoinDataChart = (coinId, startDate, endDate) => {
        if (showDateInputs) {
            // Convert dates to Unix timestamps
            const start = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : Math.floor(Date.now() / 1000) - (3 * 2629743);
            const end = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : Math.floor(Date.now() / 1000);

            handleHistoricalCoinData(coinId, start, end);
            setShowHistoricalChart(true);
        }
    };
    const handleHistoricalCoinData = async (coinId, start, end) => {
        const options = {
            method: 'GET',
            headers: { accept: 'application/json', 'x-cg-api-key': 'CG-S2ttSUxQwf3Q1opsge95Zzh1' }
        };

        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${start}&to=${end}`, options);
            const data = await response.json();
            const xValue = data['prices'].map(elem => new Date(elem[0]));
            const yValue = data['prices'].map(elem => elem[1]);
            setMarketPriceHistory([xValue, yValue]);

            console.log('Historical price data:', data['prices']);
        } catch (err) {
            showNotification('Error', 'Failed to fetch historical price data', 'danger');
            console.error('Failed to fetch historical price data', err);
        }
    };


    const handleFutureTrendOptions = async (selectedOptions, coin) => {
        setFutureTrendLoading(true);
        const updatedForecastDataMap = {};
        setForecastDataMap({})
        try {
            const options = {
                method: 'GET',
                headers: { accept: 'application/json', 'x-cg-api-key': COINGECKO_APIKEYS }
            };
            const start = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : Math.floor(Date.now() / 1000) - (3 * 2629743); // Default to last 3 months
            const end = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : Math.floor(Date.now() / 1000);
            // Fetch historical price data
            const dataResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart/range?vs_currency=usd&from=${start}&to=${end}`, options);
            if (!dataResponse.ok) {
                throw new Error('Failed to fetch historical price data');
            }
            const data = await dataResponse.json();
            const xValue = data['prices'].map(elem => new Date(elem[0]));
            const yValue = data['prices'].map(elem => elem[1]);
            const priceForTrend = yValue;
            const prophetData = xValue.map((date, index) => ({ ds: date.toISOString().split('T')[0], y: yValue[index] }));

            for (const option of selectedOptions) {
                let bodyData;

                if (option === 'prophet') {
                    bodyData = { data: prophetData };
                } else {
                    bodyData = { data: priceForTrend };
                }

                try {
                    const response = await fetch(`${FASTAPI_BASEURL}/forecast/${option}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyData),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to analyze trend using ${option}`);
                    }

                    const result = await response.json();

                    let xForecast, yForecast;

                    if (option === 'prophet') {
                        xForecast = result.forecast.map(item => item.ds);
                        yForecast = result.forecast.map(item => item.yhat);
                    } else {
                        xForecast = result.forecast.map(item => item.index);
                        yForecast = result.forecast.map(item => item.forecast);
                    }

                    updatedForecastDataMap[option] = { xForecast, yForecast };

                } catch (error) {
                    showNotification('Error', error.message, 'danger');
                    console.error(`Error occurred for ${option}:`, error);
                }
            }
            setForecastDataMap(updatedForecastDataMap);
        } catch (error) {
            showNotification('Error', error.message, 'danger');
            console.error('Error analyzing future trends:', error);
        } finally {
            setFutureTrendLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Cryptofolio</h2>
            {isAuthenticated ? (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#444' }}>
                    <h3>Welcome, {user.name}!</h3>
                    <p>Email: {user.email}</p>
                </div>
            ) : null}

            <div style={{
                margin: '20px auto',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                backgroundColor: '#e8f5e9',
                border: '1px solid #ccc',
                textAlign: 'center'
            }}>
                {!metaMaskConnected ? (<div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <button
                        onClick={connectToMetaMask}
                        style={{
                            margin: '5px',
                            padding: '10px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Connect to MetaMask
                    </button>
                    <p> OR </p>
                </div>) : (
                    null
                )}


                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <input
                        type="text"
                        placeholder="Enter Address Key"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        style={{
                            padding: '10px',
                            margin: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <button
                        onClick={() => connectToMetaMaskManually(manualAddress)}
                        style={{
                            padding: '10px',
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

                {(metaMaskConnected || manualConnected) ? (
                    <div style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
                        {balance ? <div>Balance: {balance} ETH</div> : null}
                        {walletAddress ? <div>Address: {walletAddress}</div> : null}
                        {balanceChartValues ? (
                            <div style={{
                                width: '80%',
                                height: '400px',
                                margin: '20px auto',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                            }}>
                                <PriceChart xData={balanceChartValues[0]} yData={balanceChartValues[1]} chartTitle={'Balance over time.'} />
                            </div>
                        ) : null}
                    </div>
                ) : null}

            </div>


            <div style={{
                margin: '20px auto',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #ccc',
                textAlign: 'center'
            }}>
                <p> {!metaMaskConnected ? ('Please connect via Meta Mask to enable transaction') : null} </p>
                <input
                    type="text"
                    placeholder="Recipient Address"
                    id="recipient"
                    style={{
                        padding: '10px',
                        margin: '10px',
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
                        margin: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        width: 'calc(20% - 20px)'
                    }}
                />
                <button disabled={metaMaskConnected}
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

            {isAuthenticated ? (
                <div>
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginTop: '30px' }}>
                        <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
                            Coin Watchlist
                        </h2>

                        <div>
                            {coinList.length ? (
                                <div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <input
                                            type="text"
                                            placeholder="Search for a coin..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '200px', marginBottom: '10px' }}
                                        />
                                        <select
                                            value={selectedCoinId}
                                            onChange={(e) => setSelectedCoinId(e.target.value)}
                                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '200px' }}
                                        >
                                            <option value="">Select a coin</option>
                                            {filteredCoins.map((coin) => (
                                                <option key={coin.id} value={coin.id}>
                                                    {coin.name} ({coin.symbol})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        disabled={!selectedCoinId}
                                        onClick={() => {
                                            const selectedCoin = coinList.find(coin => coin.id === selectedCoinId);
                                            addToWatchList(selectedCoin);
                                        }}
                                        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Add to Watchlist
                                    </button>
                                </div>
                            ) : 'Please wait while we load the coin list...'}
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <h3>Your Watchlist:</h3>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {watchList.map((coin) => (
                                    <li
                                        key={coin.id}
                                        style={{
                                            marginBottom: '10px',
                                            padding: '10px',
                                            backgroundColor: '#fff',
                                            borderRadius: '5px',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%',
                                            padding: '10px',
                                            boxSizing: 'border-box',
                                            gap: '10px'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <strong>ID:</strong> {coin.id}
                                            </div>
                                            <div style={{ flex: 2 }}>
                                                <strong>Name:</strong> {coin.name}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <strong>Symbol:</strong> {coin.symbol}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCoin(coin.id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#dc3545',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                    flexShrink: 0
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {/* coin specific area */}
                                        {coinIdForAnalysis === coin.id ? (
                                            <div>
                                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                    <button
                                                        onClick={() => {
                                                            if (showDateInputs) {
                                                                setShowHistoricalChart(false);
                                                            }
                                                            setShowDateInputs(!showDateInputs);
                                                        }}
                                                        style={{
                                                            padding: '5px 10px',
                                                            backgroundColor: '#007bff',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            flex: 1
                                                        }}
                                                    >
                                                        {showDateInputs ? 'Hide Historical Data Chart' : 'Show Historical Data Chart'}
                                                    </button>


                                                    <button disabled={coinDetailsLoading}
                                                        onClick={() => {
                                                            if (!showCoinDetails) {
                                                                handleCoinDetails(coin.id);
                                                            }
                                                            setShowCoinDetails(!showCoinDetails);
                                                        }}
                                                        style={{
                                                            padding: '5px 10px',
                                                            backgroundColor: '#17a2b8',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            flex: 1
                                                        }}
                                                    >
                                                        {showCoinDetails ? 'Hide Coin Details' : 'Show Coin Details'}
                                                    </button>

                                                    <button
                                                        disabled={futureTrendLoading}
                                                        onClick={() => setDisplayFutureTrends(!displayFutureTrends)}
                                                        style={{
                                                            padding: '5px 10px',
                                                            backgroundColor: '#28a745',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {displayFutureTrends ? 'Hide Future Trends' : 'Show Future Trends'}
                                                    </button>
                                                </div>



                                                {displayFutureTrends && (
                                                    <div style={{ width: '100%', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', margin: 'auto' }}>
                                                        {futureOptions.map((option) => (
                                                            <div key={option}>
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        value={option}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedOptions([...selectedOptions, option]);
                                                                            } else {
                                                                                setSelectedOptions(selectedOptions.filter((o) => o !== option));
                                                                            }
                                                                        }}
                                                                    />
                                                                    {option.replace('_', ' ')}
                                                                </label>
                                                            </div>
                                                        ))}

                                                        <button
                                                            onClick={() => handleFutureTrendOptions(selectedOptions, coin)}
                                                            style={{
                                                                padding: '5px 10px',
                                                                backgroundColor: '#28a745',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer',
                                                                flex: 1,
                                                                marginTop: '10px',
                                                            }}
                                                            disabled={selectedOptions.length === 0 || futureTrendLoading}
                                                        >
                                                            {futureTrendLoading ? 'Analyzing...' : 'Start Analysis (This might take some time)'}
                                                        </button>


                                                        <div>
                                                            <h2>Forecast</h2>

                                                            {Object.keys(forecastDataMap).length === 0 ? (
                                                                <p>No forecast data available.</p>
                                                            ) : (
                                                                Object.keys(forecastDataMap).map((option) => {

                                                                    const { xForecast, yForecast } = forecastDataMap[option];

                                                                    const chartTitle = `${option} Forecast`;

                                                                    return (
                                                                        <ForecastChart
                                                                            key={option}
                                                                            xData={xForecast}
                                                                            yData={yForecast}
                                                                            chartTitle={chartTitle}
                                                                        />
                                                                    );
                                                                })
                                                            )}
                                                        </div>



                                                    </div>
                                                )}


                                                {showDateInputs && (
                                                    <div style={{ width: '100%', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', margin: 'auto' }}>
                                                        <label>
                                                            Start Date:
                                                            <input
                                                                type="date"
                                                                onChange={(e) => setStartDate(e.target.value)}
                                                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '200px', margin: '10px' }}
                                                            />
                                                        </label>
                                                        <label>
                                                            End Date:
                                                            <input
                                                                type="date"
                                                                onChange={(e) => setEndDate(e.target.value)}
                                                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '200px', margin: '10px' }}
                                                            />
                                                        </label>
                                                        <button
                                                            onClick={() => {
                                                                handleHistoricalCoinDataChart(coin.id, startDate, endDate);
                                                            }}
                                                            style={{
                                                                margin: '10px',
                                                                padding: '5px',
                                                                backgroundColor: '#007bff',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer',
                                                                flex: 1
                                                            }}
                                                        >
                                                            Show Chart
                                                        </button>
                                                        {showHistoricalChart && (
                                                            <div style={{ marginTop: '20px', width: '100%' }}>
                                                                {marketPriceHistory ? (
                                                                    (() => {  // Immediately Invoked Function Expression (IIFE) to handle logic inside JSX
                                                                        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
                                                                        const adjustedDays = days === 0 ? 30 : days;
                                                                        return (
                                                                            <PriceChart
                                                                                xData={marketPriceHistory[0]}
                                                                                yData={marketPriceHistory[1]}
                                                                                chartTitle={`${adjustedDays} days price variations`}
                                                                            />
                                                                        );
                                                                    })()
                                                                ) : 'Loading chart...'}
                                                            </div>

                                                        )}
                                                    </div>
                                                )}

                                                {coinDetailsLoading ? ('Loading coin balance and other details...') : (
                                                    <div>
                                                        {coinDetails && showCoinDetails && (
                                                            <div style={{ width: '100%', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', margin: 'auto' }}>


                                                                <h1><strong>Name:</strong>{coinDetails.name}</h1>
                                                                <img
                                                                    src={coinDetails.image}
                                                                    alt={`${coinDetails.name} logo`}
                                                                    style={{ width: '100px', height: '100px', borderRadius: '10px' }}
                                                                />
                                                                <h2><strong>Symbol:</strong>{coinDetails.symbol}</h2>
                                                                <p><strong>Description:</strong> {coinDetails.description}</p>
                                                                <p><strong>Platform:</strong> {coinDetails.platform}</p>
                                                                <p><strong>Contract Address:</strong> {coinDetails.contractAddress}</p>
                                                                <p><strong>Balance:</strong> {coinDetails.balance}</p>
                                                                <p><strong>Homepage:</strong> <a href={coinDetails.homepage} target="_blank" rel="noopener noreferrer">{coinDetails.homepage}</a></p>
                                                                <p><strong>Whitepaper:</strong> <a href={coinDetails.whitepaper} target="_blank" rel="noopener noreferrer">{coinDetails.whitepaper}</a></p>
                                                                <p><strong>Blockchain Site:</strong> <a href={coinDetails.blockchainSite} target="_blank" rel="noopener noreferrer">{coinDetails.blockchainSite}</a></p>
                                                            </div>
                                                        )}

                                                    </div>
                                                )}
                                            </div>
                                        ) : <button
                                            onClick={() => {
                                                hanldeCoinIdForAnalysis(coin.id)
                                            }}
                                            style={{
                                                margin: '10px',
                                                padding: '5px',
                                                backgroundColor: '#007bff',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                        >
                                            Click here for {coin.name}  analysis
                                        </button>}


                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            ) : (
                <Authenticate onLoginSuccess={handleLoginSuccess} />
            )}


        </div>
    );
};

export default MetaMaskComponent;
