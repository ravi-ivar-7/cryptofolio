import React, { useState } from 'react';

const NODEJS_BASEURL = process.env.REACT_APP_NODEJS_BASEURL

const Authenticate = ({ onLoginSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticating, setIsAuthentication] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsAuthentication(true)
        try {
            const response = await fetch(`${NODEJS_BASEURL}/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.status === 200) {
                    onLoginSuccess(data.cryptofolioUser, data.cryptofolioToken);
                } 
            else {
                console.log(data.warn)
                setError(data.warn || 'Authentication failed.');
            }
        } catch (error) {
            console.log(error)
            setError('An error occurred during authentication.');
        }
        finally{
            setIsAuthentication(false)
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <form style={{
                backgroundColor: '#fff8e1',

                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 1)',
                width: '100%',
            }} onSubmit={handleSubmit}>
                <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Authenticate to work with Watchlist</h2>
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <button disabled={isAuthenticating} type="submit" style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                }}>
                    Login/Register
                </button>
            </form>
        </div>
    );
};

export default Authenticate;
