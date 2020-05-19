var express = require('express');
//const mysql = require('mysql');
var router = express.Router();

router.get('/symbols', function (req, res, next) {
    res.send('This will return all stocks with an optional industry query');
});

router.get('/SYMBOL', function (req, res, next) {
    res.send('Returns the latest data for a specific stock specified by code');
});

router.get('/authed/SYMBOL', function (req, res, next) {
    res.send('Return entries of stock searched by symbol, optionally filtered by date');
});

module.exports = router;

