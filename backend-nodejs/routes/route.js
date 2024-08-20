const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken')
const { authenticate } = require('../controllers/user/authenticate');
const {addToWatchlist, removeFromWatchlist, getWatchList} = require('../controllers/watchlist.js')

router.get('/', (req, res) => {
    res.status(200).json({ status: 'Server is running.' });
});


router.post('/authenticate', authenticate);
router.post('/add-to-watchlist',verifyToken, addToWatchlist)
router.post('/remove-from-watchlist',verifyToken, removeFromWatchlist)
router.post('/get-watchlist',verifyToken, getWatchList)



module.exports = router;
