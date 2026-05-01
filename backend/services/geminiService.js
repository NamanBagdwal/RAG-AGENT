const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if API key is provided, if not, create a dummy mock for the server to start
const apiKey = process.env.GEMINI_API_KEY;
let genAI;
if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn("GEMINI_API_KEY is not set. Using a mock for testing.");
  genAI = {
    getGenerativeModel: () => ({
      embedContent: async (params) => {
        return { embedding: { values: new Array(768).fill(0.1) } }; // Mock embedding
      },
      generateContentStream: async (params) => {
        // Mock stream
        async function* mockStream() {
          yield { text: () => "This is a mock response because the Gemini API key is not configured. " };
          yield { text: () => "Please configure it in the .env file." };
        }
        return { stream: mockStream() };
      }
    })
  };
}

const generateEmbeddings = async (texts) => {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  // The SDK might not support batch embedding directly via a single call in older versions,
  // but let's assume we map over them. We'll handle rate limits manually if needed.
  const embeddings = await Promise.all(texts.map(async (text) => {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      console.error("Embedding error:", err);
      return new Array(768).fill(0); // Fallback zero vector
    }
  }));
  
  return embeddings;
};

const generateChatResponse = async (query, contextChunks) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  let contextText = "Context:\n";
  contextChunks.forEach((chunk, i) => {
    contextText += `[Citation: Page ${chunk.metadata.pageNumber}] ${chunk.text}\n\n`;
  });

  const prompt = `
You are an Enterprise SOP AI Assistant.
Answer the user's query strictly using the provided context from the SOP documents.
Do not hallucinate or make up information. If the answer is not contained in the context, explicitly state "I cannot find the answer in the provided SOPs."
Every claim you make MUST be followed by an exact citation based on the context provided, in the format [Page X].

${contextText}

User Query: ${query}
`;

  return await model.generateContentStream(prompt);
};

module.exports = { generateEmbeddings, generateChatResponse };
