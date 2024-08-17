require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/encodeToken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        const { userId, email, name, password } = req.body;

        // Validate required fields
        if (!(email && name && userId && password)) {
            return res.status(400).json({ warn: "All fields are required!" });
        }

        await client.connect();
        const db = client.db("cryptofolio");
        const userCollection = db.collection('user');

        // Check if user already exists
        const existingUser = await userCollection.findOne({ $or: [{ email: email }, { userId: userId }] });
        if (existingUser) {
            return res.status(409).json({ warn: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            userId: userId,
            email: email,
            name: name,
            password: hashedPassword,
        };

        // Store user information in MongoDB
        await userCollection.insertOne(newUser);

        // Generate token for user
        const tokenData = { email, userId, name };
        const token = generateToken(tokenData);

        return res.status(201).json({ info: "Account created successfully", token, user: tokenData });

    } catch (error) {
        console.error(`ERROR DURING REGISTRATION: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { registerUser };
