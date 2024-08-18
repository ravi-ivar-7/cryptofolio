import React, { useEffect } from 'react'
import {ethers} from 'ethers'
function TokenHistory({walletAddress, contractAddress}) {

    const apiKey = 'KBSTDXJY5Q7X1A9Q9YGIFR4NNHNSR8GQJE';
    const baseUrl = 'https://api-goerli.etherscan.io/api';
    const startDate = '2022-01-01';
    const endDate = '2024-01-02'


    const fetchTokenHistory = async()=>{
        try {
                const response = await fetch(`${baseUrl}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`);
            const data = await response.json();
            console.log(data);
            // Filter transactions based on date range
            const filteredData = data.result.filter(tx => {
              const txDate = new Date(tx.timeStamp * 1000); // Convert timestamp to date
              return txDate >= new Date(startDate) && txDate <= new Date(endDate);
            });
            console.log(filteredData);
        
            // Calculate balance based on transactions
            let balance = 0;
            filteredData.forEach(tx => {
              if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
                balance += parseFloat(ethers.formatUnits(tx.value, 18)); // Assuming 18 decimals
              } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
                balance -= parseFloat(ethers.formatUnits(tx.value, 18)); // Assuming 18 decimals
              }
            });
          } catch (error) {
            console.error('Error fetching historical balance:', error);
          }        
    }


    useEffect(()=>{
        fetchTokenHistory();
    }, []);

  
  return (
    <div>TokenHistory</div>
  )
}

export default TokenHistory