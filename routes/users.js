var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var jwt = require('jsonwebtoken');

//Registration
router.post('/register', function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  
  if(!email || !password){
    res.status(400).json({ error:true, message: "Request body incomplete - email and password needed" })
    return;
  }

req.db.from('users').select("*").where('email', `${email}`)
  .then((users) => {
    if(users.length > 0) {
      res.status(409).json({ error:true, message: "User already exists!" })
      return;
    }  
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return req.db('users').insert({email: `${email}`,hash: `${hash}`})
  })
  .then(() => {
    res.status(201).json({ success:true, message: "User created" })
  })  
})

//Login
router.post('/login', function(req, res, next) {
const email = req.body.email;
const password = req.body.password;

if(!email || !password) {
  res.status(400).json({"error": true, "message": "Request body invalid - email and password are required"})
  return;
}

req.db.from('users').select("*").where('email', `${email}`)
  .then((users) => {
    if(users.length === 0) {
      res.status(401).json({"error": true, "message": "Incorrect email or password"})
      return;
    }

    const user = users[0];
    return bcrypt.compare(password, user.hash);
  })
  .then((match) => {
    if(!match) {
      res.status(401).json({"error": true, "message": "Incorrect email or password"})
      return;
    }
    const APIKEY = process.env.APIKEY;
    const expire_in = 60 * 60 * 24;
    const exp = Math.floor(Date.now() / 1000) + expire_in;
    const token = jwt.sign({ email, exp }, APIKEY);
    res.json({ token: token, token_type: "Bearer", expires_in: expire_in })
  }) 

})
module.exports = router;
