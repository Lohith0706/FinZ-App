
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LayoutGrid,
  List,
  Target,
  User,
  Sparkles,
  Wallet,
  Zap,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Send,
  Plus,
  Bot,
  X,
  Tag,
  Calendar,
  Trash2,
  Edit3,
  Users,
  Trophy,
  Flame,
  Award,
  ArrowUpRight,
  Receipt,
  UserPlus,
  Divide,
  MinusCircle,
  PlusCircle,
  CheckCircle2,
  Users2,
  Clock,
  RefreshCw,
  CreditCard,
  Bell,
  Medal,
  Crown,
  Filter,
  History,
  LogOut
} from 'lucide-react';
import { AuthUser, getCurrentUser } from './authService';
import AuthOverlay from './AuthOverlay';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Transaction, Goal, Category, AutopayItem } from './types';
import { getFinancialAdvice, sendFinZChatMessage } from './geminiService';

// --- CONSTANTS ---
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF2E7E',
  Shopping: '#00D1FF',
  Transport: '#8AFF2E',
  Entertainment: '#FF9933',
  Other: '#6366F1',
  Bills: '#A855F7',
};

const EXPENSE_CATEGORIES: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Other'];
const ALL_CATEGORIES: (Category | 'All')[] = ['All', ...EXPENSE_CATEGORIES, 'Income'];

const GOAL_CATEGORIES = [
  { name: 'Travel', icon: '🏖️' },
  { name: 'Gadgets', icon: '💻' },
  { name: 'Savings', icon: '💰' },
  { name: 'Education', icon: '📚' },
  { name: 'Other', icon: '✨' }
];

const SPLIT_CATEGORIES = [
  { name: 'Dining', icon: '🍔' },
  { name: 'Movies', icon: '🎬' },
  { name: 'Travel', icon: '🚗' },
  { name: 'Groceries', icon: '🛒' },
  { name: 'Rent', icon: '🏠' },
];

const TIME_RANGES = ['All', 'Weekly', 'Monthly', 'Yearly'] as const;
type TimeRange = typeof TIME_RANGES[number];

// Helper to get formatted date string relative to today
const getDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// --- MOCK DATA ---
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_GOALS: Goal[] = [];
const INITIAL_AUTOPAYS: AutopayItem[] = [];


const BADGES = [
  { id: 1, name: 'Saver Starter', icon: '🌱', unlocked: true, desc: 'First ₹1000 saved' },
  { id: 2, name: 'Streak Master', icon: '🔥', unlocked: true, desc: 'Logged 7 days in a row' },
  { id: 3, name: 'Budget King', icon: '👑', unlocked: true, desc: 'Stayed under budget for 1 month' },
  { id: 4, name: 'Wealth Wizard', icon: '🧙‍♂️', unlocked: false, desc: 'Reached 1 Lakh in savings' },
];

// --- STANDALONE COMPONENTS ---

const DashboardView = ({ transactions, goals, advice, loadingAdvice, fetchAdvice }: any) => {
  const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="pb-32 space-y-8 overflow-y-auto h-full px-4 pt-4 hide-scrollbar">
      <div className="bg-gradient-to-br from-[#2D314D] via-[#4F5B93] to-[#2D314D] p-6 rounded-[32px] shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute right-4 bottom-4 opacity-10"><Wallet size={120} strokeWidth={0.5} /></div>
        <div className="space-y-6 relative z-10">
          <div>
            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase">Total Balance</p>
            <h3 className="text-4xl font-extrabold text-white mt-1 tracking-tight">₹{balance.toLocaleString('en-IN')}</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full"><TrendingUp size={10} /></div>
                <span className="text-white/60 text-[10px] font-bold uppercase">Income</span>
              </div>
              <p className="text-lg font-bold text-white">₹{totalIncome.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-rose-500/20 text-rose-400 rounded-full"><TrendingDown size={10} /></div>
                <span className="text-white/60 text-[10px] font-bold uppercase">Expense</span>
              </div>
              <p className="text-lg font-bold text-white">₹{totalExpense.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg flex items-center gap-2 text-white">AI Insights <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /></h4>
          <button onClick={fetchAdvice} className="text-cyan-400 text-xs font-bold uppercase">Refresh</button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {loadingAdvice ? (
            [1, 2].map(i => <div key={i} className="min-w-[280px] h-24 bg-slate-900 animate-pulse rounded-2xl"></div>)
          ) : advice.map((item: any, idx: number) => (
            <div key={idx} className="min-w-[280px] p-4 bg-[#1C222E] rounded-2xl border border-white/5 flex gap-3 items-center">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                {item.type === 'warning' ? <ShieldCheck size={18} /> : <Sparkles size={18} />}
              </div>
              <p className="text-xs text-slate-300 font-medium">{item.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Expense Pie Chart Section */}
      <section className="bg-[#1C222E] p-6 rounded-[32px] border border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-extrabold text-lg text-white">Expense Mix</h4>
          <div className="p-2 bg-white/5 rounded-xl text-slate-400">
            <TrendingDown size={16} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name as string] || '#6366F1'}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#111723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.name as string] || '#6366F1' }}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{entry.name}</span>
                <span className="text-[10px] font-black text-white ml-auto">₹{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h4 className="font-extrabold text-lg text-white">Top Goals</h4>
          <ChevronRight size={18} className="text-slate-500" />
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
          {goals.map((goal: any) => {
            const progress = Math.min(100, (goal.saved / goal.target) * 100);
            return (
              <div key={goal.id} className="min-w-[160px] bg-[#1C222E] p-4 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-2xl">{goal.category === 'Travel' ? '🏖️' : goal.category === 'Gadgets' ? '💻' : goal.category === 'Savings' ? '💰' : '✨'}</div>
                  <span className="text-[10px] font-bold text-slate-500">{Math.round(progress)}%</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white truncate max-w-[120px]">{goal.name}</h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">₹{goal.saved.toLocaleString('en-IN')} / ₹{goal.target.toLocaleString('en-IN')}</p>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: goal.name === 'Goa Trip' ? '#FF6600' : goal.name === 'Gaming PC' ? '#00D1FF' : '#8AFF2E' }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const HistoryView = ({
  transactions,
  autopays,
  onAddTx,
  onEditTx,
  onAddAutopay,
  onEditAutopay,
  activeCat,
  setActiveCat,
  activeRange,
  setActiveRange
}: any) => {

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // Filter by Category
    if (activeCat !== 'All') {
      list = list.filter(t => t.category === activeCat);
    }

    // Filter by Time Range
    const now = new Date();
    // Normalize now to the start of the day for consistent comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (activeRange === 'Weekly') {
      const weekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter(t => new Date(t.date) >= weekAgo);
    } else if (activeRange === 'Monthly') {
      const monthAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
      list = list.filter(t => new Date(t.date) >= monthAgo);
    } else if (activeRange === 'Yearly') {
      const yearAgo = new Date(startOfToday.getTime() - 365 * 24 * 60 * 60 * 1000);
      list = list.filter(t => new Date(t.date) >= yearAgo);
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeCat, activeRange]);

  return (
    <div className="px-6 py-6 h-full overflow-y-auto hide-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-white">Activity</h2>
        <div className="flex gap-2">
          <button onClick={onAddAutopay} className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl hover:bg-indigo-500/30 transition-colors border border-indigo-500/20">
            <Clock size={20} strokeWidth={3} />
          </button>
          <button onClick={onAddTx} className="p-3 bg-white text-black rounded-2xl hover:bg-slate-200 transition-colors">
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Autopay / Subscriptions Scroller */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 px-1">
          <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw size={14} className="text-cyan-400" /> Autopay Manager
          </h4>
          <span className="text-[10px] font-black text-cyan-400">{autopays.length} ACTIVE</span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
          {autopays.map((pay: AutopayItem) => (
            <button
              key={pay.id}
              onClick={() => onEditAutopay(pay)}
              className="min-w-[200px] bg-gradient-to-br from-[#1C222E] to-[#111723] p-5 rounded-[28px] border border-white/5 space-y-4 text-left active:scale-[0.98] transition-all group hover:border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-inner">
                  {pay.name.toLowerCase().includes('netflix') ? '🍿' : pay.name.toLowerCase().includes('spotify') ? '🎵' : pay.name.toLowerCase().includes('jio') ? '📡' : '💳'}
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black rounded-lg border border-emerald-500/20 uppercase">AUTOPAY</div>
              </div>
              <div>
                <h5 className="font-bold text-sm text-white">{pay.name}</h5>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Next: {pay.nextDate}</p>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-white font-black">₹{pay.amount}</span>
                <ArrowUpRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </div>
            </button>
          ))}
          <button
            onClick={onAddAutopay}
            className="min-w-[140px] border-2 border-dashed border-white/5 rounded-[28px] flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all group"
          >
            <div className="p-3 bg-white/5 rounded-full text-slate-500 group-hover:text-white transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase">New Autopay</span>
          </button>
        </div>
      </section>

      {/* Dynamic Filters Section */}
      <section className="mb-6 space-y-4 bg-[#1C222E]/50 p-5 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-2 mb-1 px-1">
          <Filter size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter activity</span>
        </div>

        {/* Time Ranges */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {TIME_RANGES.map(range => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border shrink-0 ${activeRange === range
                ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-[#111723] border-white/5 text-slate-500 hover:border-white/10'
                }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border shrink-0 ${activeCat === cat
                ? 'bg-white border-white text-black'
                : 'bg-[#111723] border-white/5 text-slate-500 hover:border-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Transaction History */}
      <section className="space-y-4 pb-32">
        <div className="flex items-center justify-between px-1 mb-2">
          <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest">
            {filteredTransactions.length} results
          </h4>
          {filteredTransactions.length > 0 && (
            <span className="text-[10px] font-bold text-cyan-400 uppercase">
              Sum: ₹{filteredTransactions.reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : 0), 0).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-6 bg-white/5 rounded-full text-slate-600">
              <History size={48} strokeWidth={1} />
            </div>
            <div>
              <p className="font-bold text-slate-400">No transactions found</p>
              <p className="text-[10px] text-slate-600 uppercase font-black mt-1">Try changing your filters</p>
            </div>
          </div>
        ) : filteredTransactions.map((tx: any) => (
          <button
            key={tx.id}
            onClick={() => onEditTx(tx)}
            className="w-full bg-[#1C222E] p-4 rounded-3xl flex items-center justify-between border border-white/5 active:scale-[0.98] transition-all group hover:border-white/20 shadow-sm"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-slate-800 rounded-2xl text-xl">
                {tx.category === 'Food' ? '🍔' : tx.category === 'Income' ? '💰' : tx.category === 'Shopping' ? '🛍️' : tx.category === 'Transport' ? '🚗' : tx.category === 'Entertainment' ? '🎬' : tx.category === 'Bills' ? '📄' : '✨'}
              </div>
              <div>
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  {tx.description}
                  {tx.isAutopay && (
                    <span className="text-[7px] font-black bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase">
                      Autopay
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{tx.category} • {tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </p>
              <Edit3 size={12} className="ml-auto mt-1 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};

const SocialCirclesView = ({ onOpenSplitBill, currentUser, friends, onAddFriend, onRemoveFriend, leaderboard }: any) => {
  const [friendCodeInput, setFriendCodeInput] = React.useState('');
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [addError, setAddError] = React.useState('');

  const handleCopyCode = () => {
    if (currentUser?.friendCode) {
      navigator.clipboard.writeText(currentUser.friendCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleAddFriend = async () => {
    const code = friendCodeInput.trim().toUpperCase();
    if (!code) {
      setAddError('Please enter a friend code');
      return;
    }
    if (code === currentUser?.friendCode) {
      setAddError('You cannot add yourself!');
      return;
    }

    const result = await onAddFriend(code);
    if (result.success) {
      setFriendCodeInput('');
      setAddError('');
    } else {
      setAddError(result.error || 'Invalid friend code');
    }
  };

  // Calculate leaderboard from backend data
  const leaderboardData = React.useMemo(() => {
    return leaderboard.map((item: any, index: number) => ({
      ...item,
      name: item.id === currentUser?.id ? 'You' : item.username,
      avatar: item.username?.substring(0, 2).toUpperCase() || 'FR',
      rank: index + 1,
      trend: item.savings >= 0 ? 'up' : 'down'
    }));
  }, [leaderboard, currentUser]);

  return (
    <div className="px-6 py-6 h-full overflow-y-auto hide-scrollbar pb-32 space-y-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-black text-white">Social Circles</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Make saving social</p>
        </div>
        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
          <Users size={24} />
        </div>
      </div>

      {/* My Friend Code */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-[32px] border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus size={18} className="text-indigo-400" />
          <h3 className="font-black text-white">My Friend Code</h3>
        </div>
        <div className="bg-black/20 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Share this code</p>
            <p className="text-3xl font-black text-white tracking-wider">{currentUser?.friendCode || 'LOADING'}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-xs transition-all active:scale-95"
          >
            {copySuccess ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Add Friend */}
      <div className="bg-[#1C222E] p-6 rounded-[32px] border border-white/5 space-y-4">
        <h3 className="font-black text-white flex items-center gap-2">
          <UserPlus size={18} className="text-cyan-400" />
          Add Friend
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter friend code (e.g., ABC123)"
            value={friendCodeInput}
            onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
            className="flex-1 bg-[#111723] border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all uppercase"
            maxLength={6}
          />
          <button
            onClick={handleAddFriend}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-black text-sm transition-all active:scale-95"
          >
            Add
          </button>
        </div>
        {addError && (
          <p className="text-xs text-rose-400 font-bold">{addError}</p>
        )}
      </div>

      {/* Friends List */}
      {friends.length > 0 && (
        <div className="bg-[#1C222E] p-6 rounded-[32px] border border-white/5 space-y-4">
          <h3 className="font-black text-white flex items-center gap-2">
            <Users2 size={18} className="text-emerald-400" />
            My Friends ({friends.length})
          </h3>
          <div className="space-y-2">
            {friends.map((friendId: string) => {
              const friendProfiles = JSON.parse(localStorage.getItem('friend_profiles') || '{}');
              const profile = friendProfiles[friendId];
              return (
                <div key={friendId} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs">
                      {profile?.username?.substring(0, 2).toUpperCase() || 'FR'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{profile?.username || 'Friend'}</p>
                      <p className="text-[10px] text-slate-500 font-bold">Code: {profile?.friendCode || '---'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFriend(friendId)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Split Bill Trigger Card */}
      <button
        onClick={onOpenSplitBill}
        className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 p-6 rounded-[32px] shadow-lg shadow-cyan-500/20 flex items-center justify-between group active:scale-[0.98] transition-all border border-white/10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
            <Receipt size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-lg text-white">Split a Bill</h3>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Fair shares for friends & family</p>
          </div>
        </div>
        <ArrowUpRight size={24} className="text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>

      {/* Leaderboard with Top Badges */}
      <div className="bg-[#1C222E] p-6 rounded-[32px] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-lg text-white flex items-center gap-2">
            Savings Leaderboard <Trophy size={18} className="text-yellow-400" />
          </h4>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter bg-cyan-400/10 px-2 py-1 rounded-lg">ALL TIME</span>
        </div>
        {leaderboardData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm font-bold">Add friends to see the leaderboard!</p>
            <p className="text-slate-600 text-xs mt-2">Share your friend code above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboardData.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${item.rank === 1 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20' : item.name === 'You' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/5 border border-transparent'}`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className={`w-6 text-center block font-black ${item.rank === 1 ? 'text-yellow-400' : item.rank === 2 ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.rank}
                    </span>
                    {item.rank === 1 && (
                      <div className="absolute -top-3 -left-1 text-yellow-400 animate-bounce">
                        <Crown size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner ${item.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : item.name === 'You' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-white'}`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${item.rank === 1 ? 'text-yellow-100' : item.name === 'You' ? 'text-white' : 'text-slate-300'}`}>{item.name}</p>
                    {item.rank === 1 && (
                      <div className="flex gap-1 mt-1">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 text-[7px] font-black uppercase rounded border border-yellow-500/20">
                          <Medal size={8} /> CHAMPION
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${item.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>₹{item.savings.toLocaleString('en-IN')}</p>
                  <div className={`flex items-center justify-end gap-1 text-[9px] font-bold ${item.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {item.savings >= 0 ? 'Saving' : 'Spending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Refined AiChatView to fix the floating input area.
 * Now uses a solid layout where the input box is anchored at the bottom
 * and the message container occupies the remaining space.
 */
const AiChatView = ({ messages, isTyping, chatInput, setChatInput, onSend }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const QUICK_PROMPTS = [
    "How's my spending?",
    "Can I afford Goa?",
    "Give me a saving tip",
    "Analyze my bills"
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0D14] overflow-hidden">
      {/* Header - Fixed Top */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-[#0A0D14]/80 backdrop-blur-xl shrink-0 z-10">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-black text-white text-sm tracking-tight">FinZ AI</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online & Ready</span>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {messages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${msg.role === 'user'
              ? 'bg-cyan-500 text-black rounded-tr-none shadow-lg shadow-cyan-500/10'
              : 'bg-[#1C222E] text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1C222E] p-4 rounded-3xl rounded-tl-none border border-white/5 flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Docked Bottom */}
      <div className="shrink-0 bg-[#0A0D14] border-t border-white/5 pt-4 px-6 pb-28">
        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-2 px-2 mb-4">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Text Input Container */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Talk to your wingman..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            className="w-full bg-[#1C222E] border border-white/10 rounded-[24px] pl-5 pr-14 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all shadow-xl group-focus-within:shadow-cyan-500/5"
          />
          <button
            onClick={() => onSend()}
            disabled={!chatInput.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 w-10 rounded-2xl bg-cyan-500 text-black flex items-center justify-center disabled:opacity-20 disabled:grayscale transition-all active:scale-90"
          >
            <Send size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SplitBillOverlay = ({ onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState(['You', 'Mom', 'Dad', 'Priya']);
  const [newMember, setNewMember] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Dining');

  const sharePerPerson = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || members.length === 0) return 0;
    return val / members.length;
  }, [amount, members]);

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeMember = (name: string) => {
    if (name === 'You') return;
    setMembers(members.filter(m => m !== name));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] max-h-[90vh] bg-[#1A2231] rounded-[40px] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#1A2231] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400"><Receipt size={20} /></div>
            <h3 className="text-xl font-bold text-white tracking-tight">Split Bill</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
          <div className="flex flex-col items-center justify-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Total Amount</label>
            <div className="flex items-center justify-center gap-3 w-full">
              <span className="text-3xl font-bold text-slate-500">₹</span>
              <input
                type="number"
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-5xl font-black outline-none w-full text-center text-white placeholder:text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 text-center">Category</label>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {SPLIT_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 min-w-[80px] rounded-2xl border transition-all ${selectedCategory === cat.name
                    ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-[#111723] border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-black uppercase">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Split With ({members.length} People)</label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <div key={m} className={`pl-3 pr-2 py-2 rounded-xl border flex items-center gap-2 transition-colors ${m === 'You' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-[#111723] border-white/5 text-slate-200'}`}>
                  <span className="text-[11px] font-bold">{m}</span>
                  {m !== 'You' && (
                    <button onClick={() => removeMember(m)} className="text-slate-600 hover:text-rose-500 transition-colors">
                      <MinusCircle size={14} />
                    </button>
                  )}
                </div>
              ))}
              <div className="bg-[#111723] p-1.5 rounded-2xl border border-white/5 flex gap-2 w-full mt-2">
                <input
                  type="text"
                  placeholder="Add friend or family member..."
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMember()}
                  className="bg-transparent flex-1 px-3 py-2 text-xs font-bold outline-none text-white"
                />
                <button onClick={addMember} className="bg-cyan-500 p-2 rounded-xl text-black active:scale-95 transition-transform">
                  <UserPlus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 rounded-[32px] border border-cyan-500/20 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Receipt size={100} />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-black shadow-lg">
                <Divide size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Fair Share Per Person</p>
                <p className="text-3xl font-black text-white">₹{sharePerPerson.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#1A2231] sticky bottom-0">
          <button
            onClick={onClose}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-black py-5 rounded-[24px] shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all text-base flex items-center justify-center gap-2"
          >
            <Send size={18} /> Send Requests to {members.length - 1} People
          </button>
        </div>
      </div>
    </div>
  );
};

const AutopayOverlay = ({
  onClose,
  onSave,
  onDelete,
  name, setName,
  amount, setAmount,
  category, setCategory,
  nextDate, setNextDate,
  frequency, setFrequency,
  isEdit = false
}: any) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] max-h-[90vh] bg-[#1A2231] rounded-[40px] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#1A2231] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Clock size={20} /></div>
            <h3 className="text-xl font-bold text-white tracking-tight">{isEdit ? 'Edit Autopay' : 'Setup Autopay'}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1 text-center">Service Name</label>
            <div className="bg-[#111723] rounded-2xl p-5 border border-white/5">
              <input
                type="text"
                placeholder="e.g. Netflix, Rent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent text-xl font-bold outline-none w-full text-white placeholder:text-slate-800 text-center"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1 text-center">Amount</label>
              <div className="bg-[#111723] rounded-2xl p-5 border border-white/5 flex items-center justify-center gap-2">
                <span className="text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-lg font-bold outline-none w-full text-white placeholder:text-slate-800 text-center"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1 text-center">Date</label>
              <div className="bg-[#111723] rounded-2xl p-5 border border-white/5 flex items-center justify-center gap-2">
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none w-full text-white text-center inverted-color-scheme"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 text-center">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {['Weekly', 'Monthly', 'Yearly'].map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${frequency === f
                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-[#111723] border-white/5 text-slate-400'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400"><Bell size={20} /></div>
            <div>
              <p className="text-xs font-bold text-slate-200">Autopay Reminder</p>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">We'll notify you 24 hours before your bill is due to ensure your balance is topped up.</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#1A2231] sticky bottom-0 space-y-3">
          <button
            onClick={onSave}
            disabled={!name || !amount}
            className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white font-black py-5 rounded-[24px] shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all text-base"
          >
            {isEdit ? 'Update Autopay' : 'Enable Autopay'}
          </button>
          {isEdit && (
            <button
              onClick={onDelete}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Trash2 size={16} /> Disable Autopay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AddTxOverlay = ({
  onClose,
  onSave,
  onDelete,
  amount,
  setAmount,
  type,
  setType,
  category,
  setCategory,
  note,
  setNote,
  isEdit = false
}: any) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] max-h-[90vh] bg-[#1A2231] rounded-[40px] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1A2231] sticky top-0 z-10">
          <h3 className="text-xl font-bold text-white tracking-tight">{isEdit ? 'Edit Entry' : 'New Entry'}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
          <div className="flex flex-col items-center justify-center py-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Amount</label>
            <div className="flex items-center justify-center gap-3 w-full">
              <span className="text-3xl font-bold text-slate-500">₹</span>
              <input
                type="number"
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-5xl font-black outline-none w-full text-center text-white placeholder:text-slate-800"
              />
            </div>
            <div className="w-1/2 h-1 bg-cyan-500/20 rounded-full mt-4" />
          </div>

          <div className="flex bg-[#111723] p-1.5 rounded-[22px] border border-white/5 relative h-[60px]">
            <div
              className="absolute top-1.5 bottom-1.5 rounded-[18px] transition-all duration-300 ease-out z-0"
              style={{
                left: type === 'expense' ? '6px' : 'calc(50%)',
                width: 'calc(50% - 6px)',
                backgroundColor: type === 'expense' ? '#FF2E7E' : '#334155'
              }}
            />
            <button
              onClick={() => setType('expense')}
              className={`flex-1 font-bold text-sm relative z-10 transition-colors duration-300 ${type === 'expense' ? 'text-white' : 'text-slate-400'}`}
            >
              Expense
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 font-bold text-sm relative z-10 transition-colors duration-300 ${type === 'income' ? 'text-white' : 'text-slate-400'}`}
            >
              Income
            </button>
          </div>

          {type === 'expense' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
                <Tag size={12} /> Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                {EXPENSE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-4 rounded-2xl text-[10px] font-bold transition-all border ${category === cat
                      ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                      : 'bg-[#111723] border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 text-center">Note (Optional)</label>
            <div className="bg-[#111723] rounded-2xl p-5 border border-white/5 focus-within:border-white/20 transition-colors">
              <input
                type="text"
                placeholder="e.g. Lunch with friends"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-white placeholder:text-slate-800 text-center"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#1A2231] sticky bottom-0 space-y-3">
          <button
            onClick={onSave}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-black py-5 rounded-[24px] shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all text-base"
          >
            {isEdit ? 'Update Transaction' : 'Save Transaction'}
          </button>

          {isEdit && (
            <button
              onClick={onDelete}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Trash2 size={16} /> Delete Transaction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const GoalOverlay = ({
  onClose,
  onSave,
  onDelete,
  name,
  setName,
  target,
  setTarget,
  saved,
  setSaved,
  category,
  setCategory,
  deadline,
  setDeadline,
  isEdit = false
}: any) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] max-h-[90vh] bg-[#1A2231] rounded-[40px] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#1A2231] z-10">
          <h3 className="text-xl font-bold text-white tracking-tight">{isEdit ? 'Edit Goal' : 'New Goal'}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1 text-center">Goal Name</label>
            <div className="bg-[#111723] rounded-2xl p-5 border border-white/5">
              <input
                type="text"
                placeholder="e.g. Dream Trip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent text-xl font-bold outline-none w-full text-white placeholder:text-slate-800 text-center"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1 text-center">Target</label>
              <div className="bg-[#111723] rounded-2xl p-5 border border-white/5 flex items-center justify-center gap-2">
                <span className="text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-transparent text-lg font-bold outline-none w-full text-white placeholder:text-slate-800 text-center"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1 text-center">Saved</label>
              <div className="bg-[#111723] rounded-2xl p-5 border border-white/5 flex items-center justify-center gap-2">
                <span className="text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={saved}
                  onChange={(e) => setSaved(e.target.value)}
                  className="bg-transparent text-lg font-bold outline-none w-full text-white placeholder:text-slate-800 text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 px-1 mb-3">
              <Tag size={12} /> Category
            </label>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {GOAL_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-bold transition-all border flex items-center gap-2 ${category === cat.name
                    ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-[#111723] border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 px-1 mb-3">
              <Calendar size={12} /> Deadline
            </label>
            <div className="bg-[#111723] rounded-2xl p-5 border border-white/5">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none w-full text-white text-center placeholder:text-slate-800 inverted-color-scheme"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#1A2231] sticky bottom-0 space-y-3">
          <button
            onClick={onSave}
            disabled={!name || !target || parseFloat(target) <= 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-black py-5 rounded-[24px] shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all text-base"
          >
            {isEdit ? 'Update Goal' : 'Create Goal'}
          </button>

          {isEdit && (
            <button
              onClick={onDelete}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Trash2 size={16} /> Delete Goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'goals' | 'circles' | 'ai'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [autopays, setAutopays] = useState<AutopayItem[]>(INITIAL_AUTOPAYS);
  const [advice, setAdvice] = useState<{ type: string, message: string }[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Filters for History Tab
  const [activityCat, setActivityCat] = useState<Category | 'All'>('All');
  const [activityRange, setActivityRange] = useState<TimeRange>('All');

  // Transaction Modal State
  const [showAddTx, setShowAddTx] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'expense' | 'income'>('expense');
  const [newTxCategory, setNewTxCategory] = useState<Category>('Food');
  const [newTxNote, setNewTxNote] = useState('');

  // Goal Modal State
  const [showGoalOverlay, setShowGoalOverlay] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalSaved, setGoalSaved] = useState('');
  const [goalCategory, setGoalCategory] = useState('Savings');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Autopay Modal State
  const [showAutopayOverlay, setShowAutopayOverlay] = useState(false);
  const [editingAutopay, setEditingAutopay] = useState<AutopayItem | null>(null);
  const [autoName, setAutoName] = useState('');
  const [autoAmount, setAutoAmount] = useState('');
  const [autoCategory, setAutoCategory] = useState<Category>('Bills');
  const [autoNextDate, setAutoNextDate] = useState('');
  const [autoFrequency, setAutoFrequency] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Split Bill Modal State
  const [showSplitBill, setShowSplitBill] = useState(false);

  // AI State
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Hi! I'm your financial wingman. 🤖 Ask me anything about your spending, savings, or how to save for that Goa trip!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Friends State
  const [friends, setFriends] = useState<string[]>([]);

  // Flag to prevent overwriting backend data with initial empty state
  const initialLoadDone = useRef(false);


  // Fetch user data from backend
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/user-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setGoals(data.goals || []);
        setAutopays(data.autopays || []);
        initialLoadDone.current = true;
      } else {
        console.error('Fetch user data failed:', data.error);
        if (data.error === 'Invalid token') handleLogout();
      }
    } catch (err) {
      console.error('Network error fetching user data:', err);
    }
  }, []);

  // Save user data to backend
  const saveUserDataToBackend = useCallback(async (token: string, data: { transactions?: any[], goals?: any[], autopays?: any[] }) => {
    try {
      const res = await fetch('/api/update-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!result.success) {
        console.error('Save user data failed:', result.error);
      }
    } catch (err) {
      console.error('Network error saving user data:', err);
    }
  }, []);

  // Sync state with backend whenever it changes
  useEffect(() => {
    if (authToken && initialLoadDone.current) {
      saveUserDataToBackend(authToken, { transactions, goals, autopays });
    }
  }, [transactions, goals, autopays, authToken, saveUserDataToBackend]);


  // Load user data whenever currentUser changes
  useEffect(() => {
    if (currentUser && authToken) {
      fetchUserData(authToken);
      setFriends(currentUser.friends || []);
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_GOALS);
      setAutopays(INITIAL_AUTOPAYS);
      setFriends([]);
    }
  }, [currentUser, authToken, fetchUserData]);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const fetchLeaderboard = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/leaderboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  }, []);

  useEffect(() => {
    if (authToken && activeTab === 'circles') {
      fetchLeaderboard(authToken);
    }
  }, [authToken, activeTab, fetchLeaderboard, friends]);

  useEffect(() => {
    const savedToken = localStorage.getItem('finflex_token');
    const savedUser = localStorage.getItem('finflex_user');

    if (savedToken && savedUser) {
      const user = JSON.parse(savedUser);
      setAuthToken(savedToken);
      setCurrentUser(user);

      getCurrentUser(savedToken).then(res => {
        if (!res.success) {
          handleLogout();
        }
      }).finally(() => setIsAuthLoading(false));
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    initialLoadDone.current = false;
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('finflex_token', token);
    localStorage.setItem('finflex_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    initialLoadDone.current = false;
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('finflex_token');
    localStorage.removeItem('finflex_user');
  };

  const fetchAdvice = useCallback(async () => {
    setLoadingAdvice(true);
    const res = await getFinancialAdvice(transactions, goals);
    setAdvice(res);
    setLoadingAdvice(false);
  }, [transactions, goals]);

  useEffect(() => {
    if (currentUser && activeTab === 'home' && advice.length === 0) fetchAdvice();
  }, [activeTab, fetchAdvice, advice.length, currentUser]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || chatInput;
    if (!messageToSend.trim() || isTyping) return;

    const userMessage = { role: 'user' as const, text: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      const reply = await sendFinZChatMessage(messageToSend, transactions, goals);
      setMessages(prev => [...prev, { role: 'model', text: reply || "Sorry, I couldn't process that." }]);
    } catch (err: any) {
      console.error("Chat error details:", err);
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${err.message || "Connection failed"}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const openAddTransaction = () => {
    setEditingTransaction(null);
    setNewTxAmount('');
    setNewTxType('expense');
    setNewTxCategory('Food');
    setNewTxNote('');
    setShowAddTx(true);
  };

  const openEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setNewTxAmount(tx.amount.toString());
    setNewTxType(tx.type);
    setNewTxCategory(tx.category);
    setNewTxNote(tx.description);
    setShowAddTx(true);
  };

  const handleDeleteTransaction = () => {
    if (editingTransaction) {
      setTransactions(transactions.filter(t => t.id !== editingTransaction.id));
      setShowAddTx(false);
    }
  };

  const handleSaveTransaction = () => {
    const amount = parseFloat(newTxAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? {
        ...t,
        amount,
        type: newTxType,
        category: newTxType === 'income' ? 'Income' : newTxCategory,
        description: newTxNote || (newTxType === 'income' ? 'Income' : newTxCategory),
      } : t));
    } else {
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        amount,
        type: newTxType,
        category: newTxType === 'income' ? 'Income' : newTxCategory,
        description: newTxNote || (newTxType === 'income' ? 'Income' : newTxCategory),
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions([newTx, ...transactions]);
    }

    setShowAddTx(false);
  };

  const openAddGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setGoalTarget('');
    setGoalSaved('0');
    setGoalCategory('Savings');
    setGoalDeadline('');
    setShowGoalOverlay(true);
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalTarget(goal.target.toString());
    setGoalSaved(goal.saved.toString());
    setGoalCategory(goal.category);
    setGoalDeadline(goal.deadline);
    setShowGoalOverlay(true);
  };

  const handleDeleteGoal = () => {
    if (editingGoal) {
      setGoals(goals.filter(g => g.id !== editingGoal.id));
      setShowGoalOverlay(false);
    }
  };

  const handleSaveGoal = () => {
    const target = parseFloat(goalTarget);
    const saved = parseFloat(goalSaved || '0');
    if (isNaN(target) || target <= 0) return;

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? {
        ...g,
        name: goalName,
        target,
        saved,
        category: goalCategory,
        deadline: goalDeadline
      } : g));
    } else {
      const newGoal: Goal = {
        id: Math.random().toString(36).substring(2, 9),
        name: goalName,
        target,
        saved,
        category: goalCategory,
        deadline: goalDeadline
      };
      setGoals([...goals, newGoal]);
    }

    setShowGoalOverlay(false);
  };

  const openAddAutopay = () => {
    setEditingAutopay(null);
    setAutoName('');
    setAutoAmount('');
    setAutoNextDate('');
    setAutoFrequency('Monthly');
    setShowAutopayOverlay(true);
  };

  const openEditAutopay = (pay: AutopayItem) => {
    setEditingAutopay(pay);
    setAutoName(pay.name);
    setAutoAmount(pay.amount.toString());
    setAutoNextDate(pay.nextDate);
    setAutoFrequency(pay.frequency);
    setShowAutopayOverlay(true);
  };

  const handleSaveAutopay = () => {
    const amount = parseFloat(autoAmount);
    if (!autoName || isNaN(amount)) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      amount,
      type: 'expense',
      category: autoCategory,
      description: `Autopay: ${autoName}`,
      date: new Date().toISOString().split('T')[0],
      isAutopay: true
    };

    if (editingAutopay) {
      setAutopays(autopays.map(p => p.id === editingAutopay.id ? {
        ...p,
        name: autoName,
        amount,
        nextDate: autoNextDate,
        frequency: autoFrequency
      } : p));
    } else {
      const newAuto: AutopayItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: autoName,
        amount,
        category: autoCategory,
        nextDate: autoNextDate || new Date().toISOString().split('T')[0],
        frequency: autoFrequency,
        status: 'active'
      };
      setAutopays([...autopays, newAuto]);
    }

    // Add as a transaction record
    setTransactions([newTx, ...transactions]);
    setShowAutopayOverlay(false);
  };

  const handleDeleteAutopay = () => {
    if (editingAutopay) {
      setAutopays(autopays.filter(p => p.id !== editingAutopay.id));
      setShowAutopayOverlay(false);
    }
  };

  // Friend Management Functions
  const handleAddFriend = async (friendCode: string) => {
    try {
      const res = await fetch(`/api/resolve-friend-code?code=${friendCode}`);
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Invalid friend code' };
      }

      const friend = data.user;
      if (friends.includes(friend.id)) {
        return { success: false, error: 'Already friends!' };
      }

      const updatedFriends = [...friends, friend.id];
      setFriends(updatedFriends);

      // Update on backend
      if (authToken) {
        await fetch('/api/update-friends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ friends: updatedFriends })
        });
      }

      // Store friend profile for leaderboard (cached locally for this session)
      const friendProfiles = JSON.parse(localStorage.getItem('friend_profiles') || '{}');
      friendProfiles[friend.id] = {
        username: friend.username,
        friendCode: friend.friendCode
      };
      localStorage.setItem('friend_profiles', JSON.stringify(friendProfiles));

      return { success: true };
    } catch (err) {
      console.error('Add friend error:', err);
      return { success: false, error: 'Connection error' };
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    const updatedFriends = friends.filter(id => id !== friendId);
    setFriends(updatedFriends);

    if (authToken) {
      try {
        await fetch('/api/update-friends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ friends: updatedFriends })
        });
      } catch (err) {
        console.error('Remove friend error:', err);
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen bg-[#0A0D14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthOverlay onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen max-w-lg mx-auto bg-[#0A0D14] text-slate-100 relative overflow-hidden flex flex-col font-['Plus_Jakarta_Sans'] shadow-2xl">
      <header className="px-6 py-4 flex justify-between items-center bg-[#0A0D14] border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">FinFlex</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Logged in as</span>
            <span className="text-xs font-bold text-white leading-tight">{currentUser.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl transition-all border border-white/5"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden relative bg-[#0A0D14]">
        {activeTab === 'home' && (
          <DashboardView
            transactions={transactions}
            goals={goals}
            advice={advice}
            loadingAdvice={loadingAdvice}
            fetchAdvice={fetchAdvice}
          />
        )}

        {activeTab === 'stats' && (
          <HistoryView
            transactions={transactions}
            autopays={autopays}
            onAddTx={openAddTransaction}
            onEditTx={openEditTransaction}
            onAddAutopay={openAddAutopay}
            onEditAutopay={openEditAutopay}
            activeCat={activityCat}
            setActiveCat={setActivityCat}
            activeRange={activityRange}
            setActiveRange={setActivityRange}
          />
        )}

        {activeTab === 'ai' && (
          <AiChatView
            messages={messages}
            isTyping={isTyping}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={handleSendMessage}
          />
        )}

        {activeTab === 'goals' && (
          <div className="p-6 h-full overflow-y-auto hide-scrollbar pb-32">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">Goals</h2>
              <button onClick={openAddGoal} className="p-3 bg-cyan-500 text-black rounded-2xl hover:bg-cyan-400 transition-colors">
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-4">
              {goals.length === 0 && (
                <div className="bg-[#1C222E] p-12 rounded-[40px] border border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4">🎯</div>
                  <h4 className="font-bold text-slate-300">No goals yet</h4>
                  <p className="text-xs text-slate-500 mt-2">Create your first goal to start flexing your savings!</p>
                </div>
              )}
              {goals.map(goal => {
                const progress = Math.min(100, (goal.saved / goal.target) * 100);
                const categoryIcon = GOAL_CATEGORIES.find(c => c.name === goal.category)?.icon || '✨';

                return (
                  <div
                    key={goal.id}
                    onClick={() => openEditGoal(goal)}
                    className="bg-[#1C222E] p-6 rounded-[32px] border border-white/5 space-y-4 active:scale-[0.98] transition-all cursor-pointer group hover:border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                          {categoryIcon}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">{goal.name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                            <Calendar size={10} /> {goal.deadline || 'No deadline'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-400 font-black text-lg block">₹{goal.target.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{Math.round(progress)}% SAVED</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider">
                      <span>SAVED ₹{goal.saved.toLocaleString('en-IN')}</span>
                      <span>₹{(goal.target - goal.saved).toLocaleString('en-IN')} TO GO</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'circles' && (
          <SocialCirclesView
            onOpenSplitBill={() => setShowSplitBill(true)}
            currentUser={currentUser}
            friends={friends}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
            leaderboard={leaderboard}
          />
        )}
      </main>

      {showAddTx && (
        <AddTxOverlay
          onClose={() => setShowAddTx(false)}
          onSave={handleSaveTransaction}
          onDelete={handleDeleteTransaction}
          amount={newTxAmount}
          setAmount={setNewTxAmount}
          type={newTxType}
          setType={setNewTxType}
          category={newTxCategory}
          setCategory={setNewTxCategory}
          note={newTxNote}
          setNote={setNewTxNote}
          isEdit={!!editingTransaction}
        />
      )}

      {showGoalOverlay && (
        <GoalOverlay
          onClose={() => setShowGoalOverlay(false)}
          onSave={handleSaveGoal}
          onDelete={handleDeleteGoal}
          name={goalName}
          setName={setGoalName}
          target={goalTarget}
          setTarget={setGoalTarget}
          saved={goalSaved}
          setSaved={setGoalSaved}
          category={goalCategory}
          setCategory={setGoalCategory}
          deadline={goalDeadline}
          setDeadline={setGoalDeadline}
          isEdit={!!editingGoal}
        />
      )}

      {showAutopayOverlay && (
        <AutopayOverlay
          onClose={() => setShowAutopayOverlay(false)}
          onSave={handleSaveAutopay}
          onDelete={handleDeleteAutopay}
          name={autoName} setName={setAutoName}
          amount={autoAmount} setAmount={setAutoAmount}
          category={autoCategory} setCategory={setAutoCategory}
          nextDate={autoNextDate} setNextDate={setAutoNextDate}
          frequency={autoFrequency} setFrequency={setAutoFrequency}
          isEdit={!!editingAutopay}
        />
      )}

      {showSplitBill && <SplitBillOverlay onClose={() => setShowSplitBill(false)} />}

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#0A0D14]/90 backdrop-blur-3xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-[60]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
          <LayoutGrid size={24} strokeWidth={activeTab === 'home' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </button>

        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
          <List size={24} strokeWidth={activeTab === 'stats' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Activity</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`relative -mt-12 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,209,255,0.4)] hover:scale-110 active:scale-90 transition-all group border border-white/20 ${activeTab === 'ai' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-gradient-to-br from-indigo-500 to-cyan-400'}`}
        >
          <Sparkles className="text-white group-hover:animate-pulse" size={32} />
          <div className="absolute -bottom-6 flex flex-col items-center">
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'ai' ? 'text-cyan-400' : 'text-slate-600'}`}>Ask AI</span>
          </div>
        </button>

        <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'goals' ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
          <Target size={24} strokeWidth={activeTab === 'goals' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Goals</span>
        </button>

        <button onClick={() => setActiveTab('circles')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'circles' ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
          <Users size={24} strokeWidth={activeTab === 'circles' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Circles</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
