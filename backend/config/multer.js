const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(
        __dirname,
        "..",
        "uploads",
        folder
      );
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique =
        Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// ✅ EXPORT MULTER INSTANCES (THIS IS THE KEY)
const uploadIdentity = multer({
  storage: createStorage("identity"),
  fileFilter,
});

const uploadAddress = multer({
  storage: createStorage("address"),
  fileFilter,
});

const uploadProfile = multer({
  storage: createStorage("profile"),
  fileFilter,
});

const uploadWork = multer({
  storage: createStorage("work"),
  fileFilter,
});

const uploadBank = multer({
  storage: createStorage("bank"),
  fileFilter,
});

module.exports = {
  uploadIdentity,
  uploadAddress,
  uploadProfile,
  uploadWork,
  uploadBank,
};
