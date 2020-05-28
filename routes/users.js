var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/register', function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  req.db.from('users').select("*").where('email', `${email}`)
    .then((rows) => {
        req.db('users').insert({email: `${email}`,hash: `${password}`})
        .then((ret) => {
          res.status(200).json({ success: true, message: 'User created'});
        })
        .catch((err) => {
          res.status(409).json({ error: true, message: `User already exists!` });
        })
      })
});

module.exports = router;
