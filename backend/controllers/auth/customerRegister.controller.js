const Customer = require("../../models/Customer");

/**
 * POST /api/auth/customer/register
 */
exports.registerCustomer = async (req, res) => {
  try {
    const { firebaseUid, name, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Customer.findOne({ firebaseUid });
    if (exists) {
      return res.status(200).json({ message: "Customer already exists" });
    }

    const customer = await Customer.create({
      firebaseUid,
      name,
      email,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Customer register error:", error);
    res.status(500).json({ message: "Customer registration failed" });
  }
};
