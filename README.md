# Cryptofolio

Cryptofolio is a single-page application (SPA) designed to help users manage and track their cryptocurrency holdings efficiently. It offers a seamless experience for adding tokens to a watch list, viewing current and historical balances, checking token allowances, and performing various operations like transferring tokens.

## Features

### 1. **Wallet Connection**
- Connect to your cryptocurrency wallet using MetaMask or any other supported wallet.
- Alternatively, provide a wallet address directly to access your portfolio.

### 2. **Watch List**
- Add your favorite tokens to a personalized watch list.
- View the current balance of each token in real-time.

### 3. **Historical Data**
- Access historical balance data for each token in your portfolio.
- Use the date picker to select specific date ranges and analyze your portfolio's performance over time.

### 4. **Allowance Management**
- Check your token allowance for various smart contracts.
- Ensure that your tokens are being managed securely.

### 5. **Token Operations**
- Approve tokens for use by another address.

### 6. **Visual Representations**
- Explore your portfolio through intuitive visualizations, including charts and graphs.
- Analyze your token balances, historical data, and allowances with clear and interactive visual elements.

## Technology Stack

### Frontend
- **React.js**: A powerful JavaScript library for building the user interface.
- **react-router-dom**: For handling Single Page Application (SPA) routing.
- **Use-Case**: Provides the user interface, integrates with MetaMask for wallet interactions, and handles user interactions.

### Backend (Node.js)
- **Node.js**: A runtime environment for executing JavaScript on the server.
- **Express.js**: A web application framework for building APIs.
- **Use-Case**: Manages user watchlists and provides mechanisms for authentication and authorization.

### Backend (FastAPI)
- **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.6+ based on standard Python type hints.
- **Use-Case**: Analyzes historical cryptocurrency data and predicts trends using techniques such as exponential smoothing, ARIMA, Prophet, and Random Forest.

### Blockchain Integration
- **Ether.js**: A library for interacting with the Ethereum blockchain.

### Database
- **MongoDB**: A NoSQL database for storing user data, token information, and transaction history.

## Project Structure

The project directory contains the following folders:
- `frontend` - React frontend application
- `backend-nodejs` - Node.js backend server
- `backend-fastapi` - FastAPI backend server

## Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (for the Node.js backend and React frontend)
- [Python](https://www.python.org/) (for the FastAPI backend)
- [pip](https://pip.pypa.io/en/stable/) (Python package installer)
- [Poetry](https://python-poetry.org/) (for managing Python dependencies) (optional but recommended)
- **MetaMask** wallets installed on your browser.

## Setup and Installation

1. **Clone the Repository**
   ```bash
   git clone git@github.com:ravi-ivar-7/cryptofolio.git
   cd cryptofolio

### Frontend (React)

1. Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm start
    ```

    The React application will be accessible at [http://localhost:3000](http://localhost:3000).

### Backend (Node.js)

1. Navigate to the `backend-nodejs` directory:

    ```bash
    cd backend-nodejs
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    npm start
    ```

    The Node.js backend will be accessible at [http://localhost:5000](http://localhost:5000) (or the port specified in your configuration).

### Backend (FastAPI)

1. Navigate to the `backend-fastapi` directory:

    ```bash
    cd backend-fastapi
    ```

2. Set up a virtual environment (optional but recommended):

    ```bash
    python -m venv venv
    ```

    Activate the virtual environment:
    - On Windows:

        ```bash
        venv\Scripts\activate
        ```

    - On macOS/Linux:

        ```bash
        source venv/bin/activate
        ```

3. Install the dependencies:

    ```bash
    pip install -r requirements.txt
    ```

    If you are using Poetry, you can install the dependencies with:

    ```bash
    poetry install
    ```

4. Start the FastAPI server:

    ```bash
    uvicorn main:app --reload
    ```

    The FastAPI server will be accessible at [http://localhost:8000](http://localhost:8000).

## Environment Variables

- You may need to configure environment variables for the servers. Create a `.env` file in each server directory with the necessary environment variables. 
- You can take help from `.env.example` file.


## Running the Application with Docker

To run the Cryptofolio application using Docker and Docker Compose, follow these steps:

### Prerequisites

Make sure you have Docker and Docker Compose installed on your machine. You can download and install Docker from [Docker's official website](https://www.docker.com/get-started).

### Setting Up Docker

1. **Clone the Repository**

   If you haven’t already cloned the repository, do so by running:

   ```bash
   git clone https://github.com/ravi-ivar-7/cryptofolio.git
   cd cryptofolio

2. **After making .env file for each server**
- Run following command in root directory(cryptofolio):
`docker-compose up --build`

3. **To stop the containers**
- Run `docker-compose down`