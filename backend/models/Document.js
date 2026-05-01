const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['processing', 'indexed', 'failed'],
    default: 'processing',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  metadata: {
    totalPages: { type: Number },
    fileSize: { type: Number }, // in bytes
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
