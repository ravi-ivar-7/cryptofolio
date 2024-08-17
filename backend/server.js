require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/route');
const http = require('http');

const HTTP_PORT = process.env.HTTP_PORT;
const HOST = 'localhost';

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// FOR HTTP server
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP SERVER LISTENING ON ${HOST}:${HTTP_PORT}`);
});

// Use routes defined in router.js
app.use('/', routes);

// 404 Error Handling
app.all('*', (req, res, next) => {
  console.log('Page not found');
  return res.status(404).json({ message: `Can't find ${req.url} on the server` });
});
