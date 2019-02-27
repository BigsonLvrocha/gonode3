const Join = require('joi');

module.exports = {
  body: {
    ad: Join.string().required(),
    content: Join.string().required(),
  },
};
