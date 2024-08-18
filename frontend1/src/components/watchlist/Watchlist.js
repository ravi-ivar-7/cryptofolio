import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useEffect } from 'react';
import TokenHistory from '../tokenHistory/TokenHistory';
// Replace with your own token contract address
const TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

const Watchlist = ({ walletAddress }) => {
    const [watchlist, setWatchlist] = useState([]);
    const [newTokenAddress, setNewTokenAddress] = useState('');
    const [tokenData, setTokenData] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch data for tokens in the watchlist
        const fetchTokenData = async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);

            try {
                const data = {};
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
                setTokenData(data);
            } catch (error) {
                setError('Error fetching token data.');
                console.error('Error:', error);
            }
        };

        if (watchlist.length > 0) {
            fetchTokenData();
        }
    }, [watchlist]);

    const addTokenToWatchlist = () => {
        if (ethers.isAddress(newTokenAddress)) {
            setWatchlist([...watchlist, newTokenAddress]);
            setNewTokenAddress('');
        } else {
            setError('Invalid contract address.');
        }
    };

    const removeTokenFromWatchlist = (address) => {
        setWatchlist(watchlist.filter(item => item !== address));
    };

    return (
        <div>
            <h2>Token Watchlist</h2>
            <input
                type="text"
                value={newTokenAddress}
                onChange={(e) => setNewTokenAddress(e.target.value)}
                placeholder="Enter token contract address"
            />
            <button onClick={addTokenToWatchlist}>Add to Watchlist</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {watchlist.map(address => (
                    <li key={address}>
                        {tokenData[address] ? (
                            <div>
                                <h3>{tokenData[address].name} ({tokenData[address].symbol})</h3>
                                <p>Balance: {tokenData[address].balance} {tokenData[address].symbol}</p>
                                <button onClick={() => removeTokenFromWatchlist(address)}>Remove</button>
                            </div>
                        ) : (
                            <p>Loading data for {address}...</p>
                        )}
                    {<TokenHistory walletAddress={walletAddress} contractAddress={address}/>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Watchlist;
