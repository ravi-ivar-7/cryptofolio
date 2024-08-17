require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { generateToken } = require('../../middlewares/encodeToken');
const bcrypt = require('bcryptjs');

const loginUser = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        const { userId, password } = req.body;

        if (!(userId && password)) {
            return res.status(400).json({ warn: "Email/username and/or password are required!" });
        }

        await client.connect();
        const db = client.db("cryptofolio");
        const userCollection = db.collection('user');

        const userDocument = await userCollection.findOne({ $or: [{ email: userId }, { userId: userId }] });
        if (!userDocument) {
            return res.status(401).json({ warn: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, userDocument.password);

        if (passwordMatch) {
            const tokenData = { email: userDocument.email, userId: userDocument.userId, name: userDocument.name };
            const token = generateToken(tokenData);
            return res.status(200).json({ info: 'Successful login.', token, user: tokenData });
        }

        return res.status(401).json({ warn: "Invalid credentials" });

    } catch (error) {
        console.error(`ERROR DURING LOGIN: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { loginUser };
