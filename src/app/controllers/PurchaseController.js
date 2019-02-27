const Ad = require('../models/Ad');
const User = require('../models/User');
const PurchaseMail = require('../jobs/PurchaseMail');
const Queue = require('../services/Queue');

module.exports = {
  async store(req, res) {
    const { ad, content } = req.body;
    const purchasedAd = await Ad.findById(ad).populate('author');
    if (purchasedAd.purchasedBy !== undefined) {
      return res.status(403).json({ error: 'Ad already purchased' });
    }
    const user = await User.findById(req.userId);
    Queue.create(PurchaseMail.key, {
      ad: purchasedAd,
      user,
      content,
    }).save();
    return res.send();
  },
};
