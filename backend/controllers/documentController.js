const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { generateEmbeddings } = require('../services/geminiService');

// Helper to chunk text
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
};

// @desc    Upload & Process SOP PDF
// @route   POST /api/documents
// @access  Private/Admin
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const newDoc = await Document.create({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      status: 'processing',
      uploadedBy: req.user._id,
      metadata: {
        fileSize: req.file.size
      }
    });

    res.status(202).json({ message: 'Document processing started', document: newDoc });

    // Background processing
    processDocument(newDoc._id, req.file.path).catch(err => {
      console.error('Error processing document', err);
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processDocument = async (docId, filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Update doc with page count
    await Document.findByIdAndUpdate(docId, {
      'metadata.totalPages': data.numpages
    });

    const textChunks = chunkText(data.text);
    
    // Process chunks in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < textChunks.length; i += batchSize) {
      const batch = textChunks.slice(i, i + batchSize);
      const embeddings = await generateEmbeddings(batch); // Assumes service handles batch embedding
      
      const chunkDocs = batch.map((text, idx) => ({
        documentId: docId,
        text,
        embedding: embeddings[idx],
        metadata: {
          pageNumber: Math.floor((i + idx) / (textChunks.length / data.numpages)) || 1, // rough estimate
        }
      }));

      await Chunk.insertMany(chunkDocs);
    }

    await Document.findByIdAndUpdate(docId, { status: 'indexed' });
    
  } catch (error) {
    console.error('Document Processing Failed:', error);
    await Document.findByIdAndUpdate(docId, { status: 'failed' });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({}).populate('uploadedBy', 'name email');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private/Admin
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (document) {
      await Chunk.deleteMany({ documentId: document._id });
      // Try to delete file
      try {
        fs.unlinkSync(`uploads/${document.filename}`);
      } catch (e) {
        console.warn('File already deleted or not found');
      }
      
      await document.deleteOne();
      res.json({ message: 'Document removed' });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };
