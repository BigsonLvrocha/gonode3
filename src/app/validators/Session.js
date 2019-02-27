const Join = require('joi');

module.exports = {
  body: {
    email: Join.string().email().required(),
    password: Join.string().required(),
  },
};
