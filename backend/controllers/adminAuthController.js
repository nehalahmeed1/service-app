const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const firebaseAdmin = require("../config/firebaseAdmin");

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
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Basic validation
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    // Ensure same admin credentials exist in Firebase Auth for web login.
    try {
      await firebaseAdmin.auth().getUserByEmail(normalizedEmail);
      return res.status(400).json({
        message: "Email already exists in authentication provider",
      });
    } catch (firebaseLookupError) {
      if (firebaseLookupError.code !== "auth/user-not-found") {
        throw firebaseLookupError;
      }
    }

    await firebaseAdmin.auth().createUser({
      email: normalizedEmail,
      password,
      displayName: name,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      name,
      email: normalizedEmail,
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
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Validate
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email: normalizedEmail });
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

    // Backfill Firebase Auth user for legacy admins created before sync support.
    try {
      await firebaseAdmin.auth().getUserByEmail(normalizedEmail);
    } catch (firebaseLookupError) {
      if (firebaseLookupError.code === "auth/user-not-found") {
        await firebaseAdmin.auth().createUser({
          email: normalizedEmail,
          password,
          displayName: admin.name,
        });
      } else {
        throw firebaseLookupError;
      }
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
