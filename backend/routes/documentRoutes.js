const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Multer setup for local upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.route('/')
  .get(protect, getDocuments)
  .post(protect, admin, upload.single('file'), uploadDocument);

router.route('/:id')
  .delete(protect, admin, deleteDocument);

module.exports = router;
