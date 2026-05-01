const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  metadata: {
    pageNumber: { type: Number },
    sectionTitle: { type: String },
    loc: {
      lines: {
        from: { type: Number },
        to: { type: Number },
      }
    }
  }
});

module.exports = mongoose.model('Chunk', chunkSchema);
