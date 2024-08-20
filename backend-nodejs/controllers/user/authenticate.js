require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/encodeToken');
const bcrypt = require('bcryptjs');

const authenticate = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);

    try {
        const { email, name, password } = req.body;

        if (!(email && name && password)) {
            return res.status(400).json({ warn: "All fields are required!" });
        }

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('cryptofolioUsers');

        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
            // Authenticate existing user
            const passwordMatch = await bcrypt.compare(password, existingUser.password);

            if (passwordMatch) {
                const tokenData = { email, name };
                const token = generateToken(tokenData);
                return res.status(200).json({ info: "Login successful", cryptofolioToken: token, cryptofolioUser: tokenData });
            }

            return res.status(401).json({ warn: "Invalid credentials" });
        } else {
            // Register new user
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = {
                email: email,
                name: name,
                password: hashedPassword,
            };
            await usersCollection.insertOne(newUser);
            const tokenData = { email, name };
            const token = generateToken(tokenData);
            return res.status(201).json({ info: "Account created successfully", cryptofolioToken: token, cryptofolioUser: tokenData });
        }

    } catch (error) {
        console.error(`ERROR DURING AUTHENTICATION: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { authenticate };
