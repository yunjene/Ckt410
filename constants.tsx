
import React from 'react';
import { Category } from './types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'อาหาร & เครื่องดื่ม', color: 'bg-rose-400' },
  { id: 'travel', name: 'การเดินทาง', color: 'bg-orange-400' },
  { id: 'shopping', name: 'ช้อปปิ้ง', color: 'bg-pink-400' },
  { id: 'bills', name: 'บิล & สาธารณูปโภค', color: 'bg-yellow-400' },
  { id: 'entertainment', name: 'บันเทิง', color: 'bg-purple-400' },
  { id: 'others', name: 'อื่นๆ', color: 'bg-slate-400' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'เงินเดือน', color: 'bg-emerald-500' },
  { id: 'bonus', name: 'โบนัส', color: 'bg-teal-400' },
  { id: 'investment', name: 'การลงทุน', color: 'bg-cyan-400' },
  { id: 'others', name: 'รายรับอื่นๆ', color: 'bg-sky-400' },
];
