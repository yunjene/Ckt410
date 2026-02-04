
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, RefreshCw } from 'lucide-react';
import { Transaction, ChatMessage } from '../types';
import { getGeminiChatResponse } from '../services/geminiService';

interface AIChatBotProps {
  transactions: Transaction[];
}

const AIChatBot: React.FC<AIChatBotProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'สวัสดีครับ! ผมคือผู้ช่วยทางการเงินของคุณ มีอะไรให้ผมช่วยแนะนำ หรือวิเคราะห์รายการค่าใช้จ่ายของคุณวันนี้ไหมครับ?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const stream = await getGeminiChatResponse(input, messages, transactions);
      let fullText = '';
      
      // Create a temporary message for streaming
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-purple-600'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] p-5 rounded-3xl shadow-sm text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
              {msg.text || (isTyping && idx === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : '')}
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length-1].role === 'user' && (
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-white text-purple-600">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-100">
               <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="ถามคำถามเกี่ยวกับการเงินของคุณ..."
            className="w-full pl-6 pr-16 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-purple-100 focus:bg-white outline-none transition-all font-semibold"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-100 active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
          AI may provide helpful financial advice but always double-check important decisions.
        </p>
      </div>
    </div>
  );
};

export default AIChatBot;
