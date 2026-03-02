import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Terminal } from 'lucide-react';

const getOmnitrixTheme = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("albedo") || t.includes("nemetrix") || t.includes("antitrix")) return { hex: "#FF0000", rgb: "255, 0, 0" };
  if (t.includes("carnitrix") || t.includes("bloodtrix")) return { hex: "#8B0000", rgb: "139, 0, 0" };
  if (t.includes("chaquetrix") || t.includes("gwen")) return { hex: "#FF69B4", rgb: "255, 105, 180" };
  if (t.includes("mad watch") || t.includes("mad ben")) return { hex: "#FFA500", rgb: "255, 165, 0" };
  if (t.includes("negatrix") || t.includes("nega ben")) return { hex: "#A9A9A9", rgb: "169, 169, 169" };
  if (t.includes("bad ben")) return { hex: "#98FF98", rgb: "152, 255, 152" };
  if (t.includes("benzaro") || t.includes("xenlutrix") || t.includes("voidtrix") || t.includes("eon")) return { hex: "#9400D3", rgb: "148, 0, 211" };
  if (t.includes("hero watch") || t.includes("ben 23")) return { hex: "#00BFFF", rgb: "0, 191, 255" };
  return { hex: "#39FF14", rgb: "57, 255, 20" }; // Default Green
};

export default function CharacterCreation({ user, onComplete }: { user: any, onComplete: (saveId: string) => void }) {
  const [character, setCharacter] = useState({
    name: '',
    omnitrixType: '',
    timeline: 'Classic',
    identityRole: 'Bạn Ben',
    background: '',
    age: 10,
    personality: 'Dũng cảm'
  });
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [matureMode, setMatureMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = getOmnitrixTheme(character.omnitrixType);
  const themeStyles = {
    '--theme-color': theme.hex,
    '--theme-glow': `rgba(${theme.rgb}, 0.5)`,
    '--theme-glow-strong': `rgba(${theme.rgb}, 0.8)`,
    '--theme-scanline': `rgba(${theme.rgb}, 0.05)`,
  } as React.CSSProperties;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, character, hardcoreMode, matureMode })
      });
      const data = await res.json();
      onComplete(data.saveId);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ben-black text-ben-green font-mono scanline py-12" style={themeStyles}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-3xl w-full p-8 border border-ben-green/30 rounded-xl bg-ben-gray/50 backdrop-blur-sm relative overflow-hidden"
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
        <p className="text-center text-sm opacity-70 mb-8 uppercase tracking-widest">Giai đoạn 3: Tạo Nhân Vật</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Tên nhân vật</label>
              <input
                type="text"
                required
                value={character.name}
                onChange={e => setCharacter({...character, name: e.target.value})}
                className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Tuổi tác</label>
              <input
                type="number"
                required
                min="5"
                max="100"
                value={character.age}
                onChange={e => setCharacter({...character, age: parseInt(e.target.value)})}
                className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Loại Omnitrix / Thiết bị</label>
              <input
                list="omnitrix-list"
                required
                value={character.omnitrixType}
                onChange={e => setCharacter({...character, omnitrixType: e.target.value})}
                placeholder="Chọn hoặc nhập tên thiết bị..."
                className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green"
              />
              <datalist id="omnitrix-list">
                {/* Canon - Prime Continuity */}
                <option value="Prototype Omnitrix (Classic)" />
                <option value="Recalibrated Omnitrix (Alien Force)" />
                <option value="Ultimatrix (Ultimate Alien)" />
                <option value="Complete Omnitrix (Omniverse)" />
                <option value="Biomnitrix (Ben 10,000)" />
                <option value="Unitrix (Eunice)" />
                <option value="Nemetrix (Khyber)" />
                
                {/* Canon - Alternate Universes */}
                <option value="Hero Watch (Ben 23)" />
                <option value="Power Watch (Gwen 10)" />
                <option value="Mad Watch (Mad Ben)" />
                <option value="Negatrix (Nega Ben)" />
                <option value="Bad Ben's Omnitrix" />
                <option value="Benzaro's Omnitrix" />
                <option value="Albedo's Ultimatrix" />
                <option value="Albedo's Stabilizer" />
                <option value="Argitrix (Argit)" />
                <option value="Omnitrix (Eon's Timeline)" />
                
                {/* Reboot Continuity */}
                <option value="Reboot Omnitrix (Season 1)" />
                <option value="Omni-Enhanced Omnitrix (Season 2)" />
                <option value="Omni-Kix Omnitrix (Season 4)" />
                <option value="Omni-Naut Armor Omnitrix (Season 5)" />
                <option value="Antitrix (Kevin 11 Reboot)" />

                {/* Fan-made / AU */}
                <option value="Carnitrix (Fan-made AU)" />
                <option value="Chaquetrix (Fan-made AU)" />
                <option value="Bloodtrix (Fan-made AU)" />
                <option value="Xenlutrix (Fan-made AU)" />
                <option value="Voidtrix (Fan-made AU)" />
                <option value="Omnitrix 5YL (5 Years Later)" />
                <option value="Ultimatrix Custom (Fan-made)" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Timeline</label>
              <select
                value={character.timeline}
                onChange={e => setCharacter({...character, timeline: e.target.value})}
                className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green appearance-none"
              >
                <option value="Classic">Classic</option>
                <option value="Alien Force">Alien Force</option>
                <option value="Ultimate Alien">Ultimate Alien</option>
                <option value="Omniverse">Omniverse</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Thân phận</label>
              <select
                value={character.identityRole}
                onChange={e => setCharacter({...character, identityRole: e.target.value})}
                className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green appearance-none"
              >
                <option value="Bạn Ben">Bạn Ben</option>
                <option value="Bạn Gwen">Bạn Gwen</option>
                <option value="Thành viên Plumbers">Thành viên Plumbers</option>
                <option value="Kẻ thù">Kẻ thù</option>
                <option value="Nhân vật tự do">Nhân vật tự do</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Tính cách</label>
              <input
                type="text"
                required
                value={character.personality}
                onChange={e => setCharacter({...character, personality: e.target.value})}
                className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest opacity-70 mb-2">Tiểu sử / Xuất thân</label>
            <textarea
              required
              value={character.background}
              onChange={e => setCharacter({...character, background: e.target.value})}
              placeholder="Ví dụ: Một thợ sửa ống nước tập sự, hoặc một người ngoài hành tinh lưu lạc..."
              className="w-full bg-black border border-ben-green/50 rounded p-3 text-ben-green focus:outline-none focus:border-ben-green min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-3 p-4 border border-red-500/30 bg-red-500/10 rounded">
            <input
              type="checkbox"
              id="hardcore"
              checked={hardcoreMode}
              onChange={e => setHardcoreMode(e.target.checked)}
              className="w-5 h-5 accent-red-500"
            />
            <label htmlFor="hardcore" className="text-red-400 font-bold tracking-widest uppercase">
              Hardcore Mode ☠️ (Chết = Xóa Save)
            </label>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-purple-500/30 bg-purple-500/10 rounded">
            <input
              type="checkbox"
              id="mature"
              checked={matureMode}
              onChange={e => setMatureMode(e.target.checked)}
              className="w-5 h-5 accent-purple-500"
            />
            <label htmlFor="mature" className="text-purple-400 font-bold tracking-widest uppercase">
              Chế độ 18+ 🩸 (Bạo lực/Máu me/Dark Fantasy)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ben-green text-black font-bold py-4 rounded uppercase tracking-widest hover:bg-ben-green/90 transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? 'Đang khởi tạo...' : '[Khởi tạo]'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
