const Ad = require('../models/Ad');
const Purchase = require('../models/Purchase');

class AdController {
  async index(req, res) {
    const filters = {
      purchasedBy: {
        $exists: false,
      },
    };
    if (req.query.price_min || req.query.price_max) {
      filters.price = {};
      if (req.query.price_min) {
        filters.price.$gte = req.query.price_min;
      }
      if (req.query.price_max) {
        filters.price.$lte = req.query.price_max;
      }
    }
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, 'i');
    }
    const ads = await Ad.paginate(filters, {
      limit: 20,
      page: req.query.page || 1,
      populate: ['author'],
      sort: '-createdAt',
    });
    return res.json(ads);
  }

  async show(req, res) {
    const ads = await Ad.findById(req.params.id);
    return res.json(ads);
  }

  async store(req, res) {
    const ad = await Ad.create({
      ...req.body,
      author: req.userId,
    });
    return res.json(ad);
  }

  async update(req, res) {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.json(ad);
  }

  async destroy(req, res) {
    await Ad.findByIdAndDelete(req.params.id);
    return res.send();
  }

  async purchaseAd(req, res) {
    const purchase = await Purchase
      .findById(req.params.purchase)
      .populate({
        path: 'ad',
        populate: {
          path: 'author',
        },
      });
    if (!purchase) {
      return res.status(400).json({ error: 'Purchase not found' });
    }
    if (purchase.ad.author.id !== req.userId) {
      return res.status(403).json({
        error: 'User is not the owner of the Ad',
      });
    }
    if (purchase.ad.purchasedBy !== undefined) {
      return res.status(403).json({
        error: 'Ad already purchased',
      });
    }
    const ad = Ad.findByIdAndUpdate(purchase.ad.id, {
      purchasedBy: purchase.id,
    });
    return res.json(ad);
  }
}

module.exports = new AdController();
