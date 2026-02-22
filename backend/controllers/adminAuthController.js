const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

/**
 * =====================================
 * REGISTER ADMIN
 * =====================================
 * - Creates admin record in MongoDB
 * - Password hashed for optional local fallback login
 */
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",       // or SUPER_ADMIN
      status: "APPROVED",  // change to PENDING if approval flow needed
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });

  } catch (error) {
    console.error("Register admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/**
 * =====================================
 * LOGIN ADMIN
 * =====================================
 * - MongoDB fallback login (email + password)
 * - Useful alongside Firebase Auth
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });

  } catch (error) {
    console.error("Login admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
};
