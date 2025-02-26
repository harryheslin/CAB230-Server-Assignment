const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

//Registration route
router.post('/register', function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  
  if(!email || !password){
    res.status(400).json({ error:true, message: "Request body incomplete - email and password needed" })
    res.end();
    return;
  }

req.db.from('users').select("*").where('email', `${email}`)
  .then((users) => {
    if(users.length > 0) {
      res.status(409).json({ error:true, message: "User already exists!" })
      res.end();
      return;
    }  
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return req.db('users').insert({email: `${email}`,hash: `${hash}`})
  })
  .then(() => {
    res.status(201).json({ success:true, message: "User created" })
    res.end();
    console.log("New user created", email);
  })  
})

//Login route
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
      res.end();
      console.log("Incorrect credentials login", email);
      return;
    }

    const user = users[0];
    return bcrypt.compare(password, user.hash);
  })
  .then((match) => {
    if(!match) {
      res.status(401).json({"error": true, "message": "Incorrect email or password"})
      res.end();
      console.log("Incorrect credentials login", email);
      return;
    }
    const APIKEY = process.env.APIKEY;
    const expire_in = 60 * 60 * 24;
    const exp = Date.now() + expire_in * 1000;
    const token = jwt.sign({ email, exp }, APIKEY);
    res.json({ token: token, token_type: "Bearer", expires_in: expire_in })
    console.log("User logged in ", email);

  }) 

})
module.exports = router;
