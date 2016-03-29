const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timeStamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timeStamp }, config.secret);
}

exports.signin = (req, res, next) => {
  //User has already had their email and password auth'd
  //req.user is passed on from passort
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password' });
  }

  User.findOne({ email }, (err, existingUser) => {
    if (err) { return next(err); }

    if (existingUser) {
        return res.status(422).send({ error: 'Email is in use' });
    }

    const user = new User({email, password});

    user.save(err => {
      if (err) { return next(err); }

      res.json({ token: tokenForUser(user) });
    });

  });
}
