import React from 'react';

export default function About() {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>About Cryptofolio</h1>

            <p style={styles.description}>
                Welcome to Cryptofolio, a single-page application designed to manage cryptocurrency portfolio. This project was developed as part of the assessment for Spearx's Summer '25 internship. The goal is to provide a tool to manage, track, and optimize crypto assets. While some features have been implemented, there are additional ideas and enhancements that I may work on in the future, depending on convenience and situation.
            </p>
            <h2 style={styles.subtitle}>Key Features</h2>
            <ul style={styles.featureList}>
                <li style={styles.featureItem}>📈 <strong>Real-Time Tracking:</strong> Add tokens to your watchlist and view their current balance.</li>
                <li style={styles.featureItem}>📊 <strong>Historical Analysis:</strong> Analyze the historical balance of your tokens based on various dates.</li>
                <li style={styles.featureItem}>🔒 <strong>Token Management:</strong> Check token allowance and perform operations such as transferring and approving tokens.</li>
                <li style={styles.featureItem}>🔮 <strong>Future Trend Predictions:</strong> Leverage advanced forecasting techniques to predict future trends in the cryptocurrency market.</li>
            </ul>
            <h2 style={styles.subtitle}>Prediction Methods</h2>
            <p style={styles.description}>
                Cryptofolio uses cutting-edge methods to predict future trends in the cryptocurrency market. Our available prediction methods include:
            </p>
            <ul style={styles.methodList}>
                <li style={styles.methodItem}>📉 <strong>Exponential Smoothing:</strong> A time series forecasting method that applies decreasing weights to past observations.</li>
                <li style={styles.methodItem}>📈 <strong>ARIMA:</strong> AutoRegressive Integrated Moving Average model for understanding and forecasting time series data.</li>
                <li style={styles.methodItem}>🔮 <strong>Prophet:</strong> A forecasting tool by Facebook that handles seasonality and trends effectively.</li>
                <li style={styles.methodItem}>🤖 <strong>Random Forest:</strong> A machine learning technique that uses multiple decision trees to predict future values.</li>
            </ul>
            <p style={styles.warning}>
                <b>Warning</b>: <hr></hr>
                While measures have been taken to secure this application, a strong authentication mechanism has not been fully implemented. It is advisable to use random account credentials where required and avoid providing any personal information.
                <hr></hr>
                Additionally, please note that the predictive models used for forecasting future trends may not be accurate or reliable. They have been implemented for testing purposes only and will be improved in future updates.
            </p>


        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        color: '#333333',
        fontSize: '2.5em',
        marginBottom: '20px',
    },
    subtitle: {
        color: '#444444',
        fontSize: '1.8em',
        marginTop: '20px',
        marginBottom: '10px',
    },
    description: {
        color: '#555555',
        fontSize: '1.1em',
        lineHeight: '1.6',
    },
    featureList: {
        listStyleType: 'none',
        padding: 0,
    },
    featureItem: {
        backgroundColor: '#f0f0f0',
        padding: '10px',
        margin: '5px 0',
        borderRadius: '4px',
    },
    methodList: {
        listStyleType: 'none',
        padding: 0,
    },
    methodItem: {
        backgroundColor: '#e9ecef',
        padding: '10px',
        margin: '5px 0',
        borderRadius: '4px',
    },
    warning: {
        color: '#FF6F61', // Warning color
        backgroundColor: '#FFF3E0', // Light background color for better readability
        border: '1px solid #FF6F61', // Border color matching the warning text
        padding: '10px',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: 'bold',
        margin: '10px 0',
        lineHeight: '1.5',
    },
};
