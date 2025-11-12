const express = require('express');
const router = express.Router();
const SettingsModel = require('../models/SettingsModel');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.get('/admin-email', async (req, res, next) => {
  try {
    const setting = await SettingsModel.findByKey('admin_email');
    return res.status(200).json({
      success: true,
      adminEmail: setting?.value || '',
    });
  } catch (err) {
    next(err);
  }
});


router.get("/construction_rate", async (req, res) => {

    try {
      const setting = await SettingsModel.findByKey('construction_rate');
      return res.status(200).json({
        success: true,
        construction_rate: setting?.value || '',
      });
    } catch (err) {
      next(err);
    }

});

router.post('/construction_rate', async (req, res, next) => {
  try {
    const { value } = req.body;

    const updated = await SettingsModel.upsert('construction_rate', value);

    return res.status(200).json({
      success: true,
      message: 'Construction Rate updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/admin-email', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email is required.',
      });
    }

    const updated = await SettingsModel.upsert('admin_email', email);

    return res.status(200).json({
      success: true,
      message: 'Admin email updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
