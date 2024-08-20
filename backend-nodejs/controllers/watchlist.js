require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const addToWatchlist = async (req, res) => {
    console.log('wal')
    const client = new MongoClient(process.env.MONGODB_URL);
    const { user, coin } = req.body;
    console.log(coin)
    try {
        if (!user || !coin) {
            return res.status(400).json({ warn: "User and coin are required" });
        }

        await client.connect();
        const db = client.db("controlia");
        const watchlistCollection = db.collection('cryptofolioWatchlist');

        const result = await watchlistCollection.updateOne(
            { email: user.email },
            { $addToSet: { coins: coin } }, // `coins` array stores each added coin
            { upsert: true }
        );

        if (result.matchedCount > 0 || result.upsertedCount > 0) {
            return res.status(200).json({ info: "Coin added to watchlist successfully" });
        }

        return res.status(500).json({ warn: "Failed to add coin to watchlist" });
    } catch (error) {
        console.error(`ERROR DURING ADDING TO WATCHLIST: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        await client.close();
    }
};

const removeFromWatchlist = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    const { user, coinId } = req.body;

    try {
        if (!user || !coinId) {
            return res.status(400).json({ warn: "User and coin ID are required" });
        }

        await client.connect();
        const db = client.db("controlia");
        const watchlistCollection = db.collection('cryptofolioWatchlist');

        const result = await watchlistCollection.updateOne(
            { email: user.email },
            { $pull: { coins: { id: coinId } } } // Use `$pull` to remove the specific coin by its `id`
        );


        if (result.modifiedCount > 0) {
            return res.status(200).json({ info: "Coin removed from watchlist successfully" });
        }

        return res.status(404).json({ warn: "Coin not found in watchlist" });
    } catch (error) {
        console.error(`ERROR DURING REMOVING FROM WATCHLIST: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        await client.close();
    }
};

const getWatchList = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { email, name } = req.data.data;
        await client.connect();
        const db = client.db("controlia");
        const watchlistCollection = db.collection('cryptofolioWatchlist');

        const watchList = await watchlistCollection.find(
            { email: email }
        ).toArray() || [];
        return res.status(200).json({ info: 'Fetched watchlist successfully', watchList });
    } catch (error) {
        console.error(`ERROR DURING FETCHING WATCHLIST: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        await client.close();
    }
};


module.exports = { addToWatchlist, removeFromWatchlist, getWatchList };
