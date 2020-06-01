const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

//JWT authentication
const authorize = (req, res, next) => {
    const authorization = req.headers.authorization;
    let token = null;

    if(authorization && authorization.split(" ").length == 2) {
        token = authorization.split(" ")[1];
    } else {
        res.status(403).json({ error: true, message: "Authorization header not found" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.APIKEY)
        if(decoded.exp > Date.now()) {
            res.status(403).json({ error: true, message: "Authorization header not found" });
            return; 
        }
        next()
    } catch (e) {
        res.status(403).json({ error: true, message: "Authorization header not found" });
    }
}

//Authorised route for history between dates
router.get('/:symbol', authorize, function (req, res, next) {

    const symbol = req.params.symbol;
    const fromDate = req.query.from;
    const toDate = req.query.to;
    if(!toDate || !fromDate){
        res.status(400).json({ error: true, message: "Parameters allowed are from and to, example: /stocks/authed/AAL?from=2020-03-15" });
    } else {
        req.db.from('stocks').select("*").where(`symbol` , `${symbol}`).whereBetween('timestamp', [`${fromDate}`, `${toDate}`])
        .then((rows) => {
            if(rows.length === 0){
                res.status(404).json({ error: true, message: `No entries available for query symbol for supplied date range` });
                console.log('Failed request, no entries for stock code in specified dates: ', symbol, fromDate, toDate);
            } else { 
                res.status(200).json( rows );
                console.log('Successful request, Retrieved entries for stock code in specified dates: ', symbol, fromDate, toDate);
            }
        })
    }
});

module.exports = router;
