var express = require('express');
var router = express.Router();

router.get('/symbols', function (req, res, next) {

    const industry = Object.entries(req.query).length !== 0 ? req.query.industry ? req.query.industry : "invalid" : "";

    if(industry === "invalid"){
        res.status(404).json({ error: true, message: `Invalid query parameter: only 'industry' is permitted` });
    
    } else {
        req.db.from('stocks').select("name", "symbol", "industry").where('industry', 'like', `%${industry}%`).distinct()
        .then((rows) => {
            
            if(rows.length === 0){
                res.status(404).json({ error: true, message: `Industry sector not found` });
            } else {
                const result = rows;
                res.status(200).json( result );
            }
        })
        .catch((err) => {
            console.log(err);
        })
    }
    });

router.get(`/:symbol`, function (req, res, next) {

    const dateParams = req.query.to || req.query.from ? true : false;
    const symbol = req.params.symbol;
    req.db.from('stocks').select("*").where('symbol', `${symbol}`).first()
    .then((rows) => {
        if(dateParams){
            res.status(400).json({ error: true, message: `Date parameters only available on authenticated route /stocks/authed` });
        }
        if(!rows){
            res.status(404).json({ error: true, message: `No entry for symbol in stocks database` });
        } else { 
            res.status(200).json( rows );
        }
    })
    .catch((err) => {
      console.log(err);
    })
});

router.get('/authed/SYMBOL', function (req, res, next) {
    res.send('Return entries of stock searched by symbol, optionally filtered by date');
});

module.exports = router;

