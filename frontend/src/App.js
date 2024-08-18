import React from "react";
import "./styles.css";

import Navbar from "./components/Navbar.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactNotifications } from 'react-notifications-component'
import Home from "./pages/Home.js";
import MetaMaskComponent from "./pages/Metamask.js";


export default function App() {
  return (
    <div className="App">
      <Router>
      <ReactNotifications />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/metamask" element={<MetaMaskComponent/>} > </Route>
        </Routes>
      </Router>
    </div>
  );
}
