
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Target, 
  Plus, 
  Save, 
  LogOut, 
  Trash2,
  AlertCircle,
  BrainCircuit,
  Image as ImageIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Transaction, SavingsGoal, TransactionType, Category } from './types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './constants';
import AIChatBot from './components/AIChatBot';
import AIImageGenerator from './components/AIImageGenerator';
import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip as ReChartsTooltip } from 'recharts';

/**
 * Recharts wrapper component to handle responsive behavior and typing for PieCharts.
 * This fixes the children typing error by ensuring the internal PieChart component receives children correctly.
 */
const ReChartsPieChart = ({ children }: { children: React.ReactNode }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ReChartsPie>{children}</ReChartsPie>
  </ResponsiveContainer>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard'>('login');
  const [username, setUsername] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>({ target: 0, name: 'เงินออมของฉัน' });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-tools'>('overview');

  const { totalIncome, totalExpense, currentBalance } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: inc,
      totalExpense: exp,
      currentBalance: inc - exp
    };
  }, [transactions]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) setCurrentPage('dashboard');
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      setError('กรุณาระบุชื่อรายการและจำนวนเงิน');
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError('จำนวนเงินต้องมากกว่า 0');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    setError('');
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleSaveGoal = () => {
    if (tempGoal && parseFloat(tempGoal) > 0) {
      setSavingsGoal({ ...savingsGoal, target: parseFloat(tempGoal) });
      setIsEditingGoal(false);
    }
  };

  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    /**
     * Explicitly typing the map return to fix arithmetic operation errors during sort.
     * This ensures 'value' is correctly recognized as a number type.
     */
    return Object.entries(grouped).map(([catId, amount]): { name: string; value: number; color: string } => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
      return {
        name: cat?.name || 'อื่นๆ',
        value: amount,
        color: cat?.color.replace('bg-', '') || 'slate-400'
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
          <div className="text-center mb-10">
            <div className="bg-indigo-100 p-5 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Wallet className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-black text-indigo-900 mb-2">ช่วยเก็บตัง</h1>
            <p className="text-slate-500 font-medium">Smart Finance Assistant Powered by AI</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">ชื่อของคุณ</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อเพื่อเริ่มต้น..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all bg-slate-50 text-lg font-semibold"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200 transform hover:-translate-y-1"
            >
              เริ่มต้นจัดการเงิน
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">ช่วยเก็บตัง</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Hello, {username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              แดชบอร์ด
            </button>
            <button 
              onClick={() => setActiveTab('ai-tools')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'ai-tools' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Tools
              </div>
            </button>
            <button 
              onClick={() => setCurrentPage('login')}
              className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Wallet size={120} />
                </div>
                <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-2">เงินคงเหลือสุทธิ</p>
                <h2 className="text-4xl font-black">฿{currentBalance.toLocaleString()}</h2>
                <div className="mt-6 flex items-center gap-2 bg-white/20 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-white/10">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-bold">{currentBalance >= 0 ? 'สถานะ: ปกติ' : 'สถานะ: วิกฤต'}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">รายรับรวม</p>
                  <div className="bg-emerald-100 p-3 rounded-2xl">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800">฿{totalIncome.toLocaleString()}</h2>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">รายจ่ายรวม</p>
                  <div className="bg-rose-100 p-3 rounded-2xl">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800">฿{totalExpense.toLocaleString()}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                {/* Input Form */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex gap-2">
                    <button 
                      onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0].id); }}
                      className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      รายรับ
                    </button>
                    <button 
                      onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0].id); }}
                      className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      รายจ่าย
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <form onSubmit={handleAddTransaction} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จำนวนเงิน (บาท)</label>
                        <div className="relative">
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">฿</span>
                          <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 text-4xl font-black text-slate-800 border-b-4 border-slate-100 focus:border-indigo-500 outline-none py-2 bg-transparent placeholder-slate-200 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รายการ</label>
                        <input 
                          type="text" 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="เช่น ข้าวกลางวัน..."
                          className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 outline-none transition-all font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หมวดหมู่</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 outline-none transition-all font-semibold cursor-pointer appearance-none"
                        >
                          {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {error && (
                        <div className="flex items-center gap-3 text-rose-500 text-sm bg-rose-50 p-4 rounded-2xl font-bold border border-rose-100">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          {error}
                        </div>
                      )}

                      <button 
                        type="submit"
                        className={`w-full py-5 rounded-2xl font-black text-white text-lg transition-all shadow-xl flex items-center justify-center gap-2 transform active:scale-95 ${type === 'expense' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
                      >
                        <Plus className="w-6 h-6" />
                        บันทึกรายการ
                      </button>
                    </form>
                  </div>
                </section>

                {/* Savings Goal */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                        <Target className="w-6 h-6 text-indigo-500" />
                        เป้าหมายการออม
                      </h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Savings Progress</p>
                    </div>
                    {!isEditingGoal && (
                      <button 
                        onClick={() => setIsEditingGoal(true)} 
                        className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                      >
                        ตั้งเป้าหมาย
                      </button>
                    )}
                  </div>

                  {isEditingGoal ? (
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={tempGoal}
                        placeholder="ระบุจำนวนเงิน..."
                        className="flex-1 px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
                        onChange={(e) => setTempGoal(e.target.value)}
                      />
                      <button onClick={handleSaveGoal} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700">
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savingsGoal.target > 0 ? (
                        <>
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-slate-500">ความสำเร็จ</span>
                            <span className="text-2xl font-black text-indigo-600">
                              {Math.min((currentBalance / savingsGoal.target) * 100, 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${Math.min((currentBalance / savingsGoal.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>เริ่มต้น</span>
                            <span>เป้าหมาย: ฿{savingsGoal.target.toLocaleString()}</span>
                          </div>
                          <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                            <p className="text-sm font-bold text-indigo-900">
                              {currentBalance >= savingsGoal.target ? 'ยินดีด้วย! คุณถึงเป้าหมายแล้ว 🎉' : `อีก ฿${Math.max(0, savingsGoal.target - currentBalance).toLocaleString()} จะถึงเป้าหมาย!`}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">ยังไม่ได้ระบุเป้าหมาย</p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

              <div className="lg:col-span-8 space-y-8">
                {/* Visual Analysis */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-8">
                    <PieChart className="w-6 h-6 text-purple-500" />
                    วิเคราะห์พฤติกรรมการจ่ายเงิน
                  </h3>
                  
                  {chartData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="h-64">
                        <ReChartsPieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`#${entry.color === 'rose-400' ? 'fb7185' : entry.color === 'orange-400' ? 'fb923c' : entry.color === 'pink-400' ? 'f472b6' : entry.color === 'yellow-400' ? 'facc15' : entry.color === 'purple-400' ? 'c084fc' : '94a3b8'}`} />
                            ))}
                          </Pie>
                          <ReChartsTooltip />
                        </ReChartsPieChart>
                      </div>
                      <div className="space-y-4">
                        {chartData.map((item, idx) => (
                          <div key={idx} className="group cursor-default">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-bold text-slate-700 flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-${item.color}`} />
                                {item.name}
                              </span>
                              <span className="font-black text-slate-400">฿{item.value.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-50 rounded-full h-2">
                              <div 
                                className={`h-full rounded-full bg-${item.color} transition-all duration-700`} 
                                style={{ width: `${(item.value / totalExpense) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                      <PieChart className="w-20 h-20 mb-4 opacity-10" />
                      <p className="font-black uppercase tracking-widest text-sm">ยังไม่มีข้อมูลรายจ่ายที่ต้องวิเคราะห์</p>
                    </div>
                  )}
                </section>

                {/* Transaction List */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">รายการล่าสุด</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest shadow-sm">
                        {transactions.length} ITEMS
                      </span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <div key={t.id} className="p-6 hover:bg-slate-50 transition-all flex justify-between items-center group">
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {t.type === 'income' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-lg leading-tight">{t.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {(t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find(c => c.id === t.category)?.name}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('th-TH')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className={`text-xl font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'income' ? '+' : '-'} ฿{t.amount.toLocaleString()}
                            </span>
                            <button 
                              onClick={() => handleDelete(t.id)}
                              className="opacity-0 group-hover:opacity-100 p-2.5 text-slate-300 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-24 text-center text-slate-300">
                        <Wallet className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p className="font-black uppercase tracking-widest text-sm mb-1">ความว่างเปล่า...</p>
                        <p className="text-xs font-bold text-slate-400">เริ่มจดบันทึกวันนี้ เพื่ออนาคตทางการเงินที่ดีกว่า</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12">
                 <div className="bg-purple-600 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-purple-200 relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                      <BrainCircuit size={240} />
                    </div>
                    <div className="max-w-2xl relative z-10">
                      <h2 className="text-5xl font-black mb-4">AI Financial Tools</h2>
                      <p className="text-purple-100 text-xl font-medium leading-relaxed">
                        ปลดล็อกศักยภาพทางการเงินของคุณด้วย AI อัจฉริยะ ให้คำปรึกษา และสร้างสรรค์แรงบันดาลใจในการออมเงิน
                      </p>
                    </div>
                 </div>
              </div>
              
              <div className="lg:col-span-7">
                <section className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden h-[700px] flex flex-col">
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 p-2 rounded-xl">
                        <BrainCircuit className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-black text-slate-800">Financial Advisor AI</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border px-3 py-1 rounded-full">Powered by Gemini Pro</span>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <AIChatBot transactions={transactions} />
                  </div>
                </section>
              </div>

              <div className="lg:col-span-5">
                 <section className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden h-full">
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-black text-slate-800">Savings Inspiration Creator</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border px-3 py-1 rounded-full">Nano Banana Pro</span>
                  </div>
                  <div className="p-8">
                    <AIImageGenerator />
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent floating AI toggle for convenience */}
      {activeTab === 'overview' && (
        <button 
          onClick={() => setActiveTab('ai-tools')}
          className="fixed bottom-8 right-8 bg-purple-600 text-white p-5 rounded-3xl shadow-2xl shadow-purple-300 hover:bg-purple-700 transition-all hover:-translate-y-2 group flex items-center gap-3 active:scale-90 z-50"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="font-black text-sm pr-1">คุยกับ AI</span>
        </button>
      )}
    </div>
  );
};

export default App;
