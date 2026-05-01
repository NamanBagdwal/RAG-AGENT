import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Loader2, Bot, User as UserIcon, BookOpen, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      // Create a temporary message for the assistant's streaming response
      setMessages(prev => [...prev, { role: 'assistant', content: '', citations: [], isStreaming: true }]);

      const response = await fetch('http://localhost:5000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let finalCitations = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.text) {
                assistantMessage += data.text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
              if (data.citations) {
                finalCitations = data.citations;
              }
            } catch (e) {
              console.error('Error parsing SSE', e);
            }
          }
        }
      }

      // Stream finished, update final message
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].isStreaming = false;
        newMessages[newMessages.length - 1].citations = finalCitations;
        return newMessages;
      });

    } catch (error) {
      console.error('Chat error', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your request.', 
          isError: true 
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">How can I help you today?</h2>
            <p className="text-gray-400">Ask me anything about the company's Standard Operating Procedures.</p>
            <div className="grid grid-cols-1 gap-2 w-full mt-8">
              {["What is the onboarding process?", "How do I request PTO?", "What are the security guidelines?"].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-3 text-sm text-left border border-gray-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/5 transition-colors text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-4xl mx-auto \${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm \${
                msg.role === 'user' 
                  ? 'bg-indigo-600 ml-4' 
                  : 'bg-gradient-to-tr from-blue-500 to-indigo-500 mr-4'
              }`}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              
              <div className={`flex flex-col \${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`rounded-2xl px-5 py-3.5 shadow-sm \${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : msg.isError 
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm'
                      : 'bg-[#111827] border border-gray-800 text-gray-200 rounded-tl-sm'
                }`}>
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 max-w-none text-[15px]">
                    {msg.content ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.isStreaming && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    )}
                  </div>
                </div>

                {/* Citations block */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 w-full">
                    <details className="group border border-gray-800 bg-[#111827]/50 rounded-xl overflow-hidden">
                      <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-gray-400 flex items-center gap-2 hover:bg-gray-800 transition-colors">
                        <BookOpen className="w-3.5 h-3.5" />
                        View Sources ({msg.citations.length})
                        <ChevronRight className="w-3.5 h-3.5 ml-auto group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="p-3 border-t border-gray-800 bg-gray-900/50 space-y-3">
                        {msg.citations.map((cit, i) => (
                          <div key={i} className="text-xs space-y-1">
                            <div className="flex items-center gap-2 text-indigo-400 font-medium">
                              <span className="w-4 h-4 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                {i + 1}
                              </span>
                              Page {cit.pageNumber} {cit.sectionTitle && `- \${cit.sectionTitle}`}
                            </div>
                            <p className="text-gray-500 pl-6 italic line-clamp-3">
                              "{cit.textSnippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-[#0B0F19] border-t border-gray-800">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-end bg-[#111827] border border-gray-800 rounded-2xl shadow-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a question about the SOPs..."
              className="w-full max-h-32 min-h-[56px] py-4 pl-4 pr-14 bg-transparent border-none text-white focus:ring-0 resize-none outline-none"
              rows={1}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 p-2 rounded-xl bg-indigo-600 text-white disabled:bg-gray-800 disabled:text-gray-500 hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              AI can make mistakes. Check citations for accuracy.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
