
import React, { useState } from 'react';
import { ImageIcon, Sparkles, Loader2, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { ImageSize } from '../types';
import { generateFinancialImage } from '../services/geminiService';

const AIImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check for API Key first
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio?.openSelectKey();
    }

    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateFinancialImage(prompt, size);
      if (url) {
        setGeneratedImageUrl(url);
      } else {
        setError('ไม่สามารถสร้างรูปภาพได้ กรุณาลองเปลี่ยนคำสั่งใหม่');
      }
    } catch (err: any) {
      if (err.message?.includes('Requested entity was not found')) {
        setError('พบปัญหาเกี่ยวกับ API Key กรุณาเลือกคีย์ใหม่อีกครั้ง');
        await (window as any).aistudio?.openSelectKey();
      } else {
        setError('เกิดข้อผิดพลาดในการสร้างรูปภาพ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">แรงบันดาลใจ/เป้าหมาย (Prompt)</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="เช่น 'บ้านในฝันริมทะเลสไตล์มินิมอล' หรือ 'รถสปอร์ตสีแดงสำหรับคนรักความเร็ว'"
          className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 outline-none transition-all font-semibold resize-none h-28"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ความละเอียด (Resolution)</label>
        <div className="grid grid-cols-3 gap-3">
          {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`py-3 rounded-2xl text-sm font-black transition-all border-2 ${size === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            กำลังวาดฝันให้คุณ...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            สร้างภาพเป้าหมาย
          </>
        )}
      </button>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {generatedImageUrl && (
        <div className="mt-8 space-y-4 animate-in zoom-in-95 duration-500">
          <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-50">
            <img src={generatedImageUrl} alt="Generated inspiration" className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <a 
                href={generatedImageUrl} 
                download="my-financial-goal.png"
                className="bg-white text-slate-900 p-4 rounded-2xl hover:bg-slate-100 transition-colors shadow-xl flex items-center gap-2 font-bold"
               >
                 <Download className="w-5 h-5" />
                 บันทึกรูป
               </a>
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
            "ภาพที่สวยงามคือจุดเริ่มต้นของเป้าหมายที่เป็นจริง"
          </p>
        </div>
      )}

      {!generatedImageUrl && !isGenerating && (
        <div className="py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300">
          <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
          <p className="font-black uppercase tracking-widest text-xs">Visualize Your Savings Goal</p>
        </div>
      )}
    </div>
  );
};

export default AIImageGenerator;
