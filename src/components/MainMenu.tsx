import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, Plus, Play, Trash2, Download } from 'lucide-react';

export default function MainMenu({ user, onNewGame, onContinue }: { user: any, onNewGame: () => void, onContinue: (saveId: string) => void }) {
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');

  useEffect(() => {
    fetchSaves();
  }, [user.id]);

  const fetchSaves = async () => {
    try {
      const res = await fetch(`/api/users/${user.id}/saves`);
      const data = await res.json();
      setSaves(data.saves);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (saveId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dữ liệu này?')) return;
    try {
      await fetch(`/api/saves/${saveId}`, { method: 'DELETE' });
      fetchSaves();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = () => {
    try {
      // Extract the base64 part from the text block
      const match = importCode.match(/\[MÃ KHÔI PHỤC\]\n([A-Za-z0-9+/=]+)/);
      const base64Str = match ? match[1] : importCode.trim();
      
      const decoded = atob(base64Str);
      const parsed = JSON.parse(decoded);
      
      if (parsed.id) {
        onContinue(parsed.id);
      } else {
        alert('Mã lưu trữ không hợp lệ!');
      }
    } catch (err) {
      alert('Mã lưu trữ không hợp lệ hoặc bị lỗi!');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-ben-black text-ben-green font-mono scanline">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full p-8 border border-ben-green/30 rounded-xl bg-ben-gray/50 backdrop-blur-sm relative overflow-hidden"
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
        <p className="text-center text-sm opacity-70 mb-8 uppercase tracking-widest">Giai đoạn 2: Main Menu</p>

        <div className="space-y-4">
          <button
            onClick={onNewGame}
            className="w-full flex items-center justify-center space-x-3 bg-ben-green/10 border border-ben-green/50 text-ben-green font-bold py-4 rounded uppercase tracking-widest hover:bg-ben-green hover:text-black transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>[1] Bắt đầu mới</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="w-full flex items-center justify-center space-x-3 bg-black border border-ben-green/30 text-ben-green font-bold py-3 rounded uppercase tracking-widest hover:bg-ben-green/20 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>[2] Nhập mã lưu trữ</span>
          </button>

          {loading ? (
            <div className="text-center opacity-50">Đang tải dữ liệu...</div>
          ) : saves.length > 0 ? (
            <div className="border border-ben-green/30 rounded p-4 space-y-4">
              <h3 className="uppercase tracking-widest opacity-70 text-sm mb-4">[3] Tiếp tục</h3>
              {saves.map(save => (
                <div key={save.id} className="flex items-center justify-between bg-black/50 p-4 rounded border border-ben-green/20">
                  <div>
                    <div className="font-orbitron text-lg">{save.title}</div>
                    <div className="text-xs opacity-70">Timeline: {save.timeline} | Năng lượng: {save.omnitrix_energy}%</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onContinue(save.id)}
                      className="p-2 bg-ben-green/20 text-ben-green rounded hover:bg-ben-green hover:text-black transition-colors"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(save.id)}
                      className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center opacity-50 p-4 border border-ben-green/30 border-dashed rounded">
              Không tìm thấy dữ liệu lưu trữ
            </div>
          )}
        </div>
      </motion.div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-ben-gray border border-ben-green rounded-xl p-6 max-w-lg w-full relative">
            <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">X</button>
            <h2 className="text-xl font-bold text-ben-green mb-4 border-b border-ben-green/30 pb-2">Nhập Mã Lưu Trữ</h2>
            <p className="text-sm opacity-70 mb-4">Dán toàn bộ đoạn văn bản lưu trữ hoặc chỉ cần dán đoạn mã Base64 vào đây.</p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="w-full h-32 bg-black border border-ben-green/50 rounded p-3 text-ben-green font-mono text-sm focus:outline-none focus:border-ben-green mb-4"
              placeholder="Dán mã lưu trữ..."
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="px-4 py-2 bg-ben-green text-black font-bold rounded hover:bg-ben-green/80 transition-colors disabled:opacity-50"
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
