const Join = require('joi');

module.exports = {
  body: {
    title: Join.string().required(),
    description: Join.string().required(),
    price: Join.number().required(),
  },
};
