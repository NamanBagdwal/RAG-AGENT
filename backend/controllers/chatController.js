const ChatSession = require('../models/ChatSession');
const Chunk = require('../models/Chunk');
const { generateEmbeddings, generateChatResponse } = require('../services/geminiService');

// @desc    Stream chat response (RAG)
// @route   POST /api/chat/stream
// @access  Private
const streamChat = async (req, res) => {
  const { query, sessionId } = req.body;
  const userId = req.user._id;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    // 1. Embed user query
    const [queryEmbedding] = await generateEmbeddings([query]);

    // 2. Vector Search (Using MongoDB $vectorSearch)
    // NOTE: This requires Atlas Vector Search to be set up on the Chunk collection
    const contextChunks = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Name of the index you created in Atlas
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5
        }
      },
      {
        $project: {
          text: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 3. Generate response using Gemini via streaming
    const result = await generateChatResponse(query, contextChunks);
    
    let fullResponse = "";
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Prepare citations
    const citations = contextChunks.map(c => ({
      documentId: c.documentId,
      pageNumber: c.metadata.pageNumber,
      sectionTitle: c.metadata.sectionTitle,
      textSnippet: c.text.substring(0, 200) + '...'
    }));

    // Send final metadata (citations, etc.)
    res.write(`data: ${JSON.stringify({ done: true, citations })}\n\n`);
    res.end();

    // 4. Save to history
    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    } else {
      session = new ChatSession({ userId, title: query.substring(0, 30) });
    }

    if (session) {
      session.messages.push({ role: 'user', content: query });
      session.messages.push({ role: 'assistant', content: fullResponse, citations });
      await session.save();
    }

  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};

// @desc    Get user's chat sessions
// @route   GET /api/chat/sessions
// @access  Private
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id })
      .select('title createdAt updatedAt')
      .sort('-updatedAt');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat session history
// @route   GET /api/chat/sessions/:id
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (session && session.userId.toString() === req.user._id.toString()) {
      res.json(session);
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { streamChat, getChatSessions, getChatHistory };
