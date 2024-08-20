require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const addToWatchlist = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URI);
    const { userId, item } = req.body; // Expect userId and item (e.g., token symbol) in the request body

    try {
        if (!userId || !item) {
            return res.status(400).json({ warn: "User ID and item are required" });
        }

        await client.connect();
        const db = client.db("cryptofolio");
        const watchlistCollection = db.collection('watchlist');

        // Add item to user's watchlist
        const result = await watchlistCollection.updateOne(
            { userId: userId },
            { $addToSet: { items: item } }, // Use $addToSet to avoid duplicates
            { upsert: true } // Create a new document if one doesn't exist
        );

        if (result.matchedCount > 0 || result.upsertedCount > 0) {
            return res.status(200).json({ info: "Item added to watchlist successfully" });
        }

        return res.status(500).json({ warn: "Failed to add item to watchlist" });
    } catch (error) {
        console.error(`ERROR DURING ADDING TO WATCHLIST: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        await client.close();
    }
};
const removeFromWatchlist = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    const { userId, item } = req.body; // Expect userId and item (e.g., token symbol) in the request body

    try {
        if (!userId || !item) {
            return res.status(400).json({ warn: "User ID and item are required" });
        }

        await client.connect();
        const db = client.db("cryptofolio");
        const watchlistCollection = db.collection('watchlist');

        // Remove item from user's watchlist
        const result = await watchlistCollection.updateOne(
            { userId: userId },
            { $pull: { items: item } } // Use $pull to remove the item
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ info: "Item removed from watchlist successfully" });
        }

        return res.status(404).json({ warn: "Item not found in watchlist" });
    } catch (error) {
        console.error(`ERROR DURING REMOVING FROM WATCHLIST: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        await client.close();
    }
};

module.exports = { addToWatchlist ,removeFromWatchlist};
