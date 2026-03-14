const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// Auto-create upload folder if it doesn't exist
const uploadPath = path.join(__dirname, "../public/images");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // Clean filename — remove spaces and special characters
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseName      = path.basename(file.originalname, fileExtension)
                              .replace(/[^a-zA-Z0-9]/g, "_"); // replace special chars with _

    // Unique name using timestamp + random number — no duplicates ever
    const uniqueName = `${baseName}_${Date.now()}_${Math.round(Math.random() * 1000)}${fileExtension}`;

    cb(null, uniqueName);
  }
});

// Only allow real image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  const extValid  = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Format non supporté. Formats acceptés: jpeg, jpg, png, gif, webp"));
  }
};

const uploadfile = multer({
  storage:   storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = uploadfile;