const SettingsModel = require("../models/SettingsModel");

// Store or update email in settings
exports.storeEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    const settingKey = "contact_email"; // you can change this key name if needed
    const result = await SettingsModel.upsert(settingKey, email);

    res.status(200).json({
      success: true,
      message: "Email saved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error saving email:", error);
    next(error);
  }
};

// Retrieve stored email
exports.getEmail = async (req, res, next) => {
  try {
    const settingKey = "contact_email";
    const result = await SettingsModel.findByKey(settingKey);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No email found in settings.",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching email:", error);
    next(error);
  }
};
