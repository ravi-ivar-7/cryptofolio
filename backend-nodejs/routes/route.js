const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken')
const { authenticate } = require('../controllers/user/authenticate');
const {addToWatchlist, removeFromWatchlist} = require('../controllers/watchlist.js')

router.post('/authenticate', authenticate);
router.post('/add-to-watchlist', addToWatchlist)
router.post('remove-from-watchlist', removeFromWatchlist)



module.exports = router;
