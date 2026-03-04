
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheckIcon, LockClosedIcon, UserIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.username.toLowerCase() === usernameInput.trim().toLowerCase());
    
    if (user) {
      // Use user's password if it exists, otherwise fallback to '123' for legacy users
      const correctPassword = user.password || '123';
      if (password === correctPassword) {
        onLogin(user);
      } else {
        setError('كلمة المرور غير صحيحة.');
      }
    } else {
      setError('اسم المستخدم غير صحيح.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-900 z-0"></div>
      <div className="absolute top-[48%] left-0 w-full h-24 bg-gradient-to-b from-blue-900 to-slate-100 z-0 opacity-50"></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden border border-slate-200">
        <div className="bg-blue-800 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-700 opacity-20 transform rotate-45 scale-150"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/10 p-4 rounded-full mb-4 backdrop-blur-sm border border-white/20">
                    <ShieldCheckIcon className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">نظام تقييم جودة العمليات الرقابية</h1>
                <p className="text-blue-200 text-sm">تسجيل الدخول للمتابعة</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                اسم المستخدم
            </label>
            <input
              type="text"
              required
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="ادخل اسم المستخدم"
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-shadow text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-center gap-2">
                <LockClosedIcon className="w-4 h-4 text-blue-600" />
                كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-shadow text-center"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-bold text-center animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span>تسجيل الدخول</span>
            <ArrowRightEndOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        </form>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400">دائرة الجودة والتميز المؤسسي</p>
        </div>
      </div>
    </div>
  );
};