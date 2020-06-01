const express = require('express');
const router = express.Router();

//Route for all stock symbols
router.get('/symbols', function (req, res, next) {

    const industry = Object.entries(req.query).length !== 0 ? req.query.industry ? req.query.industry : "invalid" : "";

    if(industry === "invalid"){
        res.status(400).json({ error: true, message: `Invalid query parameter: only 'industry' is permitted` });
    
    } else {
        req.db.from('stocks').select("name", "symbol", "industry").where('industry', 'like', `%${industry}%`).distinct()
        .then((rows) => {
            
            if(rows.length === 0){
                res.status(404).json({ error: true, message: `Industry sector not found` });
                console.log('Failed request, industry not found: ', industry);
            } else {
                const result = rows;
                res.status(200).json( result );
                console.log('Successful request, stocks retrieved');
            }
        })
        .catch((err) => {
            console.log(err);
        })
    }
    });

//Unauthenticaed search by stock symbol
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
            console.log('Failed request, stock code does not exist: ', symbol);
        } else { 
            res.status(200).json( rows );
            console.log('Successful request, stock code retrieved: ', symbol);
        }
    })
    .catch((err) => {
      console.log(err);
    })
});

module.exports = router;

