const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const uploadPath = path.join(__dirname, "../public/images");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseName      = path.basename(file.originalname, fileExtension)
                              .replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueName = `${baseName}_${Date.now()}_${Math.round(Math.random() * 1000)}${fileExtension}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp/;
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/octet-stream', // ← emulator camera fix
  ];

  const extValid  = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedMimes.includes(file.mimetype);

  if (extValid || mimeValid) { // ← OR instead of AND
    cb(null, true);
  } else {
    cb(new Error(
      "Format non supporté. Formats acceptés: jpeg, jpg, png, gif, webp"));
  }
};

const uploadfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = uploadfile;