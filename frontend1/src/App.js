import { useState } from 'react';
import Navbar from './components/navbar/Navbar';
import Watchlist from './components/watchlist/Watchlist';
import styles from './App.module.css';
import TokenHistory from './components/tokenHistory/TokenHistory';
import NativeTokenInfo from './components/nativeTokenInfo/NativeTokenInfo';
import { ethers } from "ethers";
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let signer, provider; //can change these to usestates later


  // Function to fetch ETH balance
  const fetchEthBalance = async (address) => {
    const balance = await provider.getBalance(address);
    console.log(balance);
  };


  const connectWallet = async () => {
    try {
      // Clear any previous errors
      setError(null);
      setIsLoading(true);

      // Check if the browser has an Ethereum provider (Metamask)
      if (typeof window.ethereum !== 'undefined') {
        // Request wallet connection
        provider = new ethers.BrowserProvider(window.ethereum)

        // Get the signer to interact with the blockchain
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        // Store the address in state
        setWalletAddress(address);
        setIsConnected(true);
        fetchEthBalance(address);
        console.log(address);
      } else {
        throw new Error("Metamask is not installed. Please install it to use this app.");
      }
    } catch (err) {
      // Handle errors such as user rejection or absence of Metamask
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAddressSubmit = () => {
    try {
      // Clear any previous errors
      setError(null);

      // Validate Ethereum address
      if (ethers.isAddress(manualAddress)) {
        provider = new ethers.getDefaultProvider('mainnet');
        setWalletAddress(manualAddress);
        setIsConnected(false);
      } else {
        throw new Error("Invalid Ethereum address. Please check and try again.");
      }
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <>
      <Navbar walletAddress={walletAddress} />

      <div className={styles.connectComponent}>
        <button className={styles.connectButton} onClick={connectWallet}>Connect</button>
        <span>or</span>
        <input type='text' placeholder='Enter address 0x...'
          value={manualAddress} onChange={(e) => { setManualAddress(e.target.value) }}>
        </input>
        <button onClick={handleManualAddressSubmit}>Submit</button>
      </div>
      {walletAddress && <NativeTokenInfo walletAddress={walletAddress}/>}
      {walletAddress && <Watchlist walletAddress={walletAddress}/>}
      {/* {walletAddress && <TokenHistory walletAddress={walletAddress} />} */}

    </>
  );
}

export default App;
