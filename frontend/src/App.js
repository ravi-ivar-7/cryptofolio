import React from "react";
import "./styles.css";

import Navbar from "./components/Navbar.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactNotifications } from 'react-notifications-component'

import MetaMaskComponent from "./pages/Metamask.js";
import About from './pages/About.js'

export default function App() {
  return (
    <div className="App">
      <Router>
      <ReactNotifications />
        <Navbar />
        <Routes>
          <Route path="/" element={<MetaMaskComponent />} />
          <Route path="/about" element={<About/>} > </Route>
        </Routes>
      </Router>
    </div>
  );
}
