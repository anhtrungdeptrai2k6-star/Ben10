import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Terminal } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Lỗi kết nối hệ thống Plumber');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-ben-black text-ben-green font-mono scanline">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full p-8 border border-ben-green/30 rounded-xl bg-ben-gray/50 backdrop-blur-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ben-green to-transparent opacity-50"></div>
        
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-ben-green flex items-center justify-center relative omnitrix-glow">
            <div className="w-16 h-16 bg-ben-green rounded-full flex items-center justify-center">
              <Terminal className="w-8 h-8 text-black" />
            </div>
            <div className="absolute inset-0 border-t-4 border-black rounded-full rotate-45"></div>
            <div className="absolute inset-0 border-t-4 border-black rounded-full -rotate-45"></div>
          </div>
        </div>

        <h2 className="text-center font-orbitron text-2xl mb-2 tracking-widest">PLUMBER OS</h2>
        <p className="text-center text-sm opacity-70 mb-8 uppercase tracking-widest">Giai đoạn 1: Đăng nhập</p>

        {error && <div className="text-red-500 text-center mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green"
              placeholder="Nhập ID..."
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green"
              placeholder="Nhập mật khẩu..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ben-green text-black font-bold py-3 rounded uppercase tracking-widest hover:bg-ben-green/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Truy cập'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
