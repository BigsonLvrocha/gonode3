const Join = require('joi');

module.exports = {
  body: {
    name: Join.string().required(),
    email: Join.string().email().required(),
    password: Join.string().required().min(6),
  },
};
