const jwt = require('jsonwebtoken');
const decodedToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        return decodedToken;

    } catch (error) {
        console.error('ERROR DECODING TOKEN: ', error);
        return null; 
    }
};

module.exports = { decodedToken }