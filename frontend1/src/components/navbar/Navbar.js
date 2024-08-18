import React from 'react'
import styles from './Navbar.module.css'
function Navbar({walletAddress}) {

  // walletAddress = walletAddress.slice(0, 5);

  return (
    <>
    <nav className={styles.container}>
      <span>Crypto-Portfolio</span>
      <span>
        <a>Home</a>
        <a>About</a>
      </span>
      {walletAddress?<span>{walletAddress.slice(0, 5)+"..."}</span>:<span>Connect</span>}
      
    </nav>
    </>
  )
}

export default Navbar