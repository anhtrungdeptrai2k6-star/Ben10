import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, ShieldAlert, Zap, User, LogOut, Save, FileText, Disc, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

const ALIEN_CATEGORIES = [
  {
    name: "Classic",
    aliens: ["Heatblast", "Wildmutt", "Diamondhead", "XLR8", "Grey Matter", "Four Arms", "Stinkfly", "Ripjaws", "Upgrade", "Ghostfreak", "Cannonbolt", "Wildvine", "Spitter", "Buzzshock", "Arctiguana", "Blitzwolfer", "Snare-oh", "Frankenstrike", "Upchuck", "Ditto", "Eye Guy", "Way Big"]
  },
  {
    name: "Alien Force",
    aliens: ["Swampfire", "Echo Echo", "Humungousaur", "Jetray", "Big Chill", "Chromastone", "Brainstorm", "Spidermonkey", "Goop", "Alien X", "Lodestar", "Rath", "Nanomech"]
  },
  {
    name: "Ultimate Alien",
    aliens: ["Water Hazard", "AmpFibian", "Armodrillo", "Terraspin", "NRG", "Fasttrack", "ChamAlien", "Eatle", "Clockwork", "Juryrigg", "Shocksquatch"]
  },
  {
    name: "Omniverse",
    aliens: ["Feedback", "Bloxx", "Gravattack", "Crashhopper", "Ball Weevil", "Walkatrout", "Pesky Dust", "Mole-Stache", "The Worst", "Kickin Hawk", "Toepick", "Astrodactyl", "Bullfrag", "Atomix", "Gutrot", "Whampire"]
  },
  {
    name: "Reboot & AU",
    aliens: ["Overflow", "Shock Rock", "Slapback", "Surge", "Gax", "Rocks", "Squidstrictor", "Ventrilosquid"]
  },
  {
    name: "Concept & Non-Canon",
    aliens: ["Decimus Prime", "Bob the Blob", "Antigravitesla", "Plantapocalypse", "Portaler", "Squirtapiller", "Somnambulizard", "Bungee Sponge", "Hippopotomass", "Crabtastic", "Mealymouth", "Rollaway", "Treadbare", "Thrash", "Snakepit", "Shellhead", "Sandbox", "Braindrain", "L'Goon", "Skele-TON", "TenTen"]
  }
];

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

export default function GameInterface({ saveId, onExit }: { saveId: string, onExit: () => void }) {
  const [save, setSave] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAliens, setShowAliens] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveCode, setSaveCode] = useState('');
  const [fusionMode, setFusionMode] = useState(false);
  const [selectedFusion, setSelectedFusion] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [saveId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/saves/${saveId}`);
      const data = await res.json();
      if (data.save) {
        setSave(data.save);
        setLogs(data.logs);
        if (data.logs.length === 0) {
          generatePrologue(data.save);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveClick = () => {
    if (!save) return;
    
    const recentEvents = logs
      .filter(l => l.speaker === 'System')
      .slice(-2)
      .map(l => l.content.substring(0, 100) + '...')
      .join('\n- ');

    const codeObj = { id: save.id };
    const encodedId = btoa(JSON.stringify(codeObj));

    const formattedCode = `=== BÁO CÁO LƯU TRỮ PLUMBER OS ===
Nhân vật: ${save.char_name} (${save.char_age} tuổi)
Thân phận: ${save.char_identity}
Thiết bị: ${save.char_omnitrix} (Năng lượng: ${save.omnitrix_energy}%)
Vị trí hiện tại: ${save.current_location}
Sự kiện (Arc): ${save.current_arc}
Mục tiêu: ${save.main_objective}

Sự kiện gần đây:
- ${recentEvents || 'Chưa có sự kiện nào.'}

[MÃ KHÔI PHỤC]
${encodedId}
==================================`;

    setSaveCode(formattedCode);
    setShowSaveModal(true);
  };

  const copySaveCode = () => {
    navigator.clipboard.writeText(saveCode);
    alert('Đã sao chép mã lưu trữ vào khay nhớ tạm!');
  };

  const theme = save ? getOmnitrixTheme(save.char_omnitrix) : { hex: "#39FF14", rgb: "57, 255, 20" };
  const themeStyles = {
    '--theme-color': theme.hex,
    '--theme-glow': `rgba(${theme.rgb}, 0.5)`,
    '--theme-glow-strong': `rgba(${theme.rgb}, 0.8)`,
    '--theme-scanline': `rgba(${theme.rgb}, 0.05)`,
  } as React.CSSProperties;

  const isUltimatrix = save?.char_omnitrix.toLowerCase().includes('ultimatrix');
  const isBiomnitrix = save?.char_omnitrix.toLowerCase().includes('biomnitrix');
  const isChaquetrix = save?.char_omnitrix.toLowerCase().includes('chaquetrix');

  const actionText = isChaquetrix ? 'Triệu hồi' : 'Biến hình';

  const playActiveSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const playDialSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const playTransformSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const handleAlienClick = (alien: string) => {
    if (fusionMode) {
      const newFusion = [...selectedFusion, alien];
      if (newFusion.length === 2) {
        playTransformSound();
        setInput(`${actionText} thành hợp thể của ${newFusion[0]} và ${newFusion[1]}`);
        setShowAliens(false);
        setFusionMode(false);
        setSelectedFusion([]);
      } else {
        playDialSound();
        setSelectedFusion(newFusion);
      }
    } else {
      playTransformSound();
      setInput(`${actionText} thành ${alien}`);
      setShowAliens(false);
    }
  };

  const generatePrologue = async (saveData: any) => {
    setProcessing(true);
    try {
      const prompt = `[HỆ THỐNG KHỞI ĐỘNG] Đây là lúc bắt đầu trò chơi. Hãy viết một đoạn văn bản mở đầu thật rõ ràng, hấp dẫn và chi tiết. 
Yêu cầu:
1. Giải thích cụ thể bối cảnh nhân vật của tôi (tên: ${saveData.char_name}, tuổi: ${saveData.char_age}) nhận được thiết bị [${saveData.char_omnitrix}] vào thời điểm nào trong dòng thời gian [${saveData.timeline}].
2. Miêu tả rõ mối quan hệ ban đầu của tôi với gia đình Ben (Ben, Gwen, ông nội Max) dựa trên thân phận [${saveData.char_identity}].
3. Đưa ra một tình huống khởi đầu để tôi bắt đầu hành động.`;

      const aiResult = await generateStoryTurn(saveData, [], prompt);
      
      const res = await fetch(`/api/saves/${saveId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: '[Bắt đầu trò chơi]', aiResult })
      });
      const data = await res.json();
      
      setLogs([
        { speaker: 'Player', content: '[Bắt đầu trò chơi]', timestamp: Date.now() - 1000 },
        { speaker: 'System', content: aiResult.story, timestamp: Date.now() }
      ]);
      if (data.energy !== undefined) {
        setSave((prev: any) => ({ ...prev, omnitrix_energy: data.energy }));
      }
    } catch (err: any) {
      console.error(err);
      setLogs([{ speaker: 'System', content: `Lỗi hệ thống: ${err.message}`, timestamp: Date.now() }]);
    }
    setProcessing(false);
  };

  const generateStoryTurn = async (saveData: any, currentLogs: any[], userAction: string) => {
    let flags: any = {};
    try { flags = JSON.parse(saveData.flags || '{}'); } catch(e) {}
    
    const maturePrompt = flags.matureMode ? "\nCHẾ ĐỘ 18+ ĐƯỢC BẬT: Cho phép miêu tả chi tiết, chân thực và trần trụi các cảnh bạo lực, máu me, thương vong (Gore/Dark Fantasy). Phản ánh đúng sự tàn khốc của chiến đấu. (Lưu ý: Các yếu tố tình dục vẫn bị cấm theo tiêu chuẩn an toàn của hệ thống AI)." : "";

    const systemPrompt = `Ngươi là Hệ Thống Omnitrix vận hành trong vũ trụ Ben 10.
Luật:
Chỉ sử dụng nhân vật, công nghệ, chủng tộc, phe phái trong Ben 10.
Không thêm sức mạnh ngoài Omnitrix.
Không phá canon trừ khi người chơi thay đổi trực tiếp.
Tạo rủi ro thật. Không cho thắng dễ.${maturePrompt}
Bối cảnh cốt lõi: Ben Tennyson trong vũ trụ này VẪN ĐANG SỞ HỮU Omnitrix của riêng mình. Người chơi đóng vai một nhân vật khác (hoặc phiên bản khác) cũng sở hữu một thiết bị biến hình.
Lưu ý về Omnitrix: Người chơi có thể sử dụng bất kỳ phiên bản Omnitrix nào (canon, alternate universe, hoặc fan-made như Carnitrix, Chaquetrix, Bloodtrix, Xenlutrix, Voidtrix, v.v.). Nếu người chơi nhập tên một thiết bị không có trong danh sách hoặc tự chế, hãy cố gắng nhận diện, phân loại và tự động tạo ra tính năng, ngoại hình, rủi ro của loại thiết bị đó dựa trên tên gọi và mô tả của người chơi.
ĐẶC BIỆT: Đối với các thiết bị bị hạn chế số lượng Alien trong phim/fanfic, HÃY CHO PHÉP người chơi sử dụng toàn bộ danh sách Alien của Omniverse. Tuy nhiên, BẮT BUỘC phải miêu tả lại ngoại hình, kỹ năng, và tác dụng phụ của các Alien đó cho phù hợp với bản chất của thiết bị mà người chơi đang dùng (VD: Dùng Carnitrix biến thành Feedback thì Feedback phải trông kinh dị, khát máu và gây đau đớn).
VĂN PHONG & CẢM XÚC: Hãy kể chuyện một cách CÓ CẢM XÚC, sâu sắc và mang tính điện ảnh. Sử dụng kỹ thuật "Tả thay vì Kể" (Show, don't tell). Miêu tả chi tiết cảm giác khi biến hình (sự biến đổi da thịt, xương cốt, nhiệt độ, sự đau đớn hay quyền năng tràn ngập). Khắc họa rõ nét tâm lý nhân vật, sự sợ hãi, tuyệt vọng hay phấn khích tột độ của những người xung quanh khi chứng kiến.
QUAN TRỌNG: BẮT BUỘC miêu tả ĐÚNG màu sắc của thiết bị, màu mắt, và màu năng lượng phát ra từ thiết bị (cả khi ở dạng người lẫn khi biến hình thành Alien) dựa trên loại thiết bị người chơi đang sử dụng. Miêu tả rõ ràng, chi tiết các pha hành động, chiêu thức trong cuộc chiến.
Mỗi phản hồi gồm:
A) Phần truyện (kịch tính, phong cách hành động, miêu tả cảm xúc sâu sắc). 
B) JSON cập nhật:
{ characterUpdates: {}, storyStateUpdates: {}, unlockAlien: null, unlockUltimate: null, reputationChange: { plumbers: 0, civilians: 0 }, relationshipChanges: {}, tensionChange: 0, energyChange: 0, death: false }`;

    const prompt = `
Trạng thái hiện tại:
${JSON.stringify(saveData)}

Lịch sử gần đây:
${currentLogs.slice(-20).map(l => `${l.speaker}: ${l.content}`).join('\n')}

Hành động của người chơi: ${userAction}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING, description: "Phần truyện kịch tính, phong cách hành động" },
            characterUpdates: { type: Type.OBJECT },
            storyStateUpdates: { type: Type.OBJECT },
            unlockAlien: { type: Type.STRING, nullable: true },
            unlockUltimate: { type: Type.STRING, nullable: true },
            reputationChange: {
              type: Type.OBJECT,
              properties: { plumbers: { type: Type.INTEGER }, civilians: { type: Type.INTEGER } }
            },
            relationshipChanges: {
              type: Type.OBJECT,
              properties: { ben: { type: Type.INTEGER }, gwen: { type: Type.INTEGER }, kevin: { type: Type.INTEGER } }
            },
            tensionChange: { type: Type.INTEGER },
            energyChange: { type: Type.INTEGER },
            death: { type: Type.BOOLEAN }
          },
          required: ["story", "death"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  };

  const handleAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || processing) return;

    const userAction = input;
    setInput('');
    setProcessing(true);

    // Optimistic update
    setLogs(prev => [...prev, { speaker: 'Player', content: userAction, timestamp: Date.now() }]);

    try {
      // Generate AI response directly from frontend
      const aiResult = await generateStoryTurn(save, logs, userAction);
      
      // Save to backend
      const res = await fetch(`/api/saves/${saveId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: userAction, aiResult })
      });
      const data = await res.json();
      
      if (data.deleted) {
        alert("BẠN ĐÃ CHẾT TRONG HARDCORE MODE. DỮ LIỆU ĐÃ BỊ XÓA.");
        onExit();
        return;
      }

      setLogs(prev => [...prev, { speaker: 'System', content: aiResult.story, timestamp: Date.now() }]);
      if (data.energy !== undefined) {
        setSave((prev: any) => ({ ...prev, omnitrix_energy: data.energy }));
      }
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, { speaker: 'System', content: `Lỗi hệ thống: ${err.message}`, timestamp: Date.now() }]);
    }
    setProcessing(false);
  };

  const handleCommand = (cmd: string) => {
    setInput(cmd);
  };

  if (loading || !save) return <div className="h-screen flex items-center justify-center bg-ben-black text-ben-green font-mono">Đang tải dữ liệu Plumber OS...</div>;

  return (
    <div className="h-screen flex flex-col bg-ben-black text-ben-green font-mono overflow-hidden scanline" style={themeStyles}>
      {/* HEADER */}
      <header className="bg-ben-gray border-b border-ben-green/30 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full border-2 border-ben-green flex items-center justify-center relative omnitrix-glow">
            <div className="w-8 h-8 bg-ben-green rounded-full"></div>
            <div className="absolute inset-0 border-t-2 border-black rounded-full rotate-45"></div>
            <div className="absolute inset-0 border-t-2 border-black rounded-full -rotate-45"></div>
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl tracking-widest">{save.char_name}</h1>
            <div className="text-xs opacity-70 uppercase tracking-widest">{save.timeline} | {save.char_omnitrix}</div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full border-2 border-ben-gray bg-black flex items-center justify-center overflow-hidden">
              {/* Background energy fill */}
              <div 
                className="absolute bottom-0 w-full bg-ben-green/30 transition-all duration-500"
                style={{ height: `${save.omnitrix_energy}%` }}
              ></div>
              
              {/* Omnitrix Core */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center relative ${save.omnitrix_energy > 20 ? 'bg-ben-green' : 'bg-red-500 animate-pulse'}`}>
                <div className="absolute inset-0 border-t-2 border-black rounded-full rotate-45"></div>
                <div className="absolute inset-0 border-t-2 border-black rounded-full -rotate-45"></div>
              </div>
              
              {/* Circular Progress Border */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-ben-gray"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="138.2"
                  strokeDashoffset={138.2 - (138.2 * save.omnitrix_energy) / 100}
                  className={`${save.omnitrix_energy > 20 ? 'text-ben-green' : 'text-red-500'} transition-all duration-500`}
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-orbitron text-[10px] opacity-70 uppercase tracking-widest">Năng lượng</span>
              <span className={`font-orbitron font-bold ${save.omnitrix_energy > 20 ? 'text-ben-green' : 'text-red-500'}`}>
                {save.omnitrix_energy}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <span className="font-orbitron text-sm text-blue-400">REP: {save.rep_plumbers || 0}</span>
          </div>
        </div>
      </header>

      {/* STORY PANEL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/50">
        <div className="max-w-4xl mx-auto space-y-6">
          {logs.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex ${log.speaker === 'Player' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-xl ${
                log.speaker === 'Player' 
                  ? 'bg-ben-green/10 border border-ben-green/30 text-ben-green' 
                  : 'bg-ben-gray border border-white/10 text-white/90'
              }`}>
                <div className="font-orbitron text-xs opacity-50 mb-2 uppercase tracking-wider">
                  {log.speaker === 'Player' ? 'USER_INPUT' : 'SYSTEM_RESPONSE'}
                </div>
                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black prose-pre:border prose-pre:border-ben-green/30 max-w-none text-lg">
                  <ReactMarkdown>{log.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {processing && (
            <div className="flex justify-start">
              <div className="bg-ben-gray border border-white/10 p-4 rounded-xl flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-ben-green border-t-transparent rounded-full animate-spin"></div>
                <span className="opacity-70 text-sm uppercase tracking-widest">Hệ thống đang xử lý...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT PANEL & BUTTONS */}
      <footer className="bg-ben-gray border-t border-ben-green/30 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => { playActiveSound(); setShowAliens(!showAliens); setFusionMode(false); setSelectedFusion([]); }} className={`flex items-center space-x-2 px-4 py-2 border rounded text-sm transition-colors whitespace-nowrap ${showAliens ? 'bg-ben-green text-black border-ben-green' : 'bg-black border-ben-green/30 hover:bg-ben-green/20'}`}>
              <Disc className="w-4 h-4" /> <span>[{actionText}]</span>
            </button>
            
            {isUltimatrix && (
              <button onClick={() => { playTransformSound(); handleCommand('Tiến hóa thành dạng Ultimate'); }} className="flex items-center space-x-2 px-4 py-2 bg-black border border-ben-green/30 rounded text-sm hover:bg-ben-green/20 transition-colors whitespace-nowrap">
                <Zap className="w-4 h-4" /> <span>[Ultimate]</span>
              </button>
            )}

            {isBiomnitrix && (
              <button onClick={() => { playActiveSound(); setShowAliens(true); setFusionMode(!fusionMode); setSelectedFusion([]); }} className={`flex items-center space-x-2 px-4 py-2 border rounded text-sm transition-colors whitespace-nowrap ${fusionMode ? 'bg-ben-green text-black border-ben-green' : 'bg-black border-ben-green/30 hover:bg-ben-green/20'}`}>
                <Layers className="w-4 h-4" /> <span>[Hợp thể]</span>
              </button>
            )}

            <button onClick={() => setShowInfo(true)} className="flex items-center space-x-2 px-4 py-2 bg-black border border-ben-green/30 rounded text-sm hover:bg-ben-green/20 transition-colors whitespace-nowrap">
              <User className="w-4 h-4" /> <span>[Thông tin]</span>
            </button>
            <button onClick={() => handleCommand('[Tóm tắt]')} className="flex items-center space-x-2 px-4 py-2 bg-black border border-ben-green/30 rounded text-sm hover:bg-ben-green/20 transition-colors whitespace-nowrap">
              <FileText className="w-4 h-4" /> <span>[Tóm tắt]</span>
            </button>
            <button onClick={handleSaveClick} className="flex items-center space-x-2 px-4 py-2 bg-black border border-ben-green/30 rounded text-sm hover:bg-ben-green/20 transition-colors whitespace-nowrap">
              <Save className="w-4 h-4" /> <span>[Lưu trữ]</span>
            </button>
            <button onClick={onExit} className="flex items-center space-x-2 px-4 py-2 bg-black border border-red-500/30 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors whitespace-nowrap ml-auto">
              <LogOut className="w-4 h-4" /> <span>[Thoát]</span>
            </button>
          </div>

          {showSaveModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-ben-gray border border-ben-green rounded-xl p-6 max-w-lg w-full relative">
                <button onClick={() => setShowSaveModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">X</button>
                <h2 className="text-xl font-bold text-ben-green mb-4 border-b border-ben-green/30 pb-2">Mã Lưu Trữ</h2>
                <div className="bg-black p-4 rounded border border-ben-green/30 mb-4 whitespace-pre-wrap font-mono text-sm text-gray-300 max-h-64 overflow-y-auto">
                  {saveCode}
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={copySaveCode} className="px-4 py-2 bg-ben-green text-black font-bold rounded hover:bg-ben-green/80 transition-colors">
                    Sao chép mã
                  </button>
                </div>
              </div>
            </div>
          )}

          {showInfo && save && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-ben-gray border border-ben-green rounded-xl p-6 max-w-md w-full relative">
                <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">X</button>
                <h2 className="text-xl font-bold text-ben-green mb-4 border-b border-ben-green/30 pb-2">Trạng Thái Nhân Vật</h2>
                <div className="space-y-3 text-sm">
                  <p><span className="text-gray-400">Tên:</span> {save.char_name}</p>
                  <p><span className="text-gray-400">Tuổi:</span> {save.char_age}</p>
                  <p><span className="text-gray-400">Thiết bị:</span> <span className="text-ben-green font-bold">{save.char_omnitrix}</span></p>
                  <p><span className="text-gray-400">Thân phận:</span> {save.char_identity}</p>
                  
                  <div className="mt-4 pt-4 border-t border-ben-green/30">
                    <h3 className="text-ben-green font-bold mb-2">Quan hệ</h3>
                    <p><span className="text-gray-400">Ben Tennyson:</span> {save.rel_ben}</p>
                    <p><span className="text-gray-400">Gwen Tennyson:</span> {save.rel_gwen}</p>
                    <p><span className="text-gray-400">Kevin Levin:</span> {save.rel_kevin}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-ben-green/30">
                    <h3 className="text-ben-green font-bold mb-2">Sự kiện hiện tại</h3>
                    <p><span className="text-gray-400">Arc:</span> {save.current_arc}</p>
                    <p><span className="text-gray-400">Địa điểm:</span> {save.current_location}</p>
                    <p><span className="text-gray-400">Mục tiêu:</span> {save.main_objective}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAliens && (
            <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-4xl bg-ben-gray/80 border-2 border-ben-green rounded-3xl p-6 relative shadow-[0_0_50px_var(--theme-glow)]"
              >
                <button onClick={() => setShowAliens(false)} className="absolute top-6 right-6 text-ben-green hover:text-white">X</button>
                
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-ben-green flex items-center justify-center relative omnitrix-glow mb-4 animate-pulse">
                    <div className="w-12 h-12 bg-ben-green rounded-full"></div>
                    <div className="absolute inset-0 border-t-4 border-black rounded-full rotate-45"></div>
                    <div className="absolute inset-0 border-t-4 border-black rounded-full -rotate-45"></div>
                  </div>
                  <h2 className="text-2xl font-orbitron font-bold text-ben-green tracking-widest uppercase">
                    {fusionMode ? 'CHỌN ALIEN HỢP THỂ' : 'CHỌN ALIEN BIẾN HÌNH'}
                  </h2>
                  {fusionMode && (
                    <div className="text-sm text-ben-green mt-2 font-bold animate-pulse">
                      Đã chọn ({selectedFusion.length}/2): {selectedFusion.join(' + ')}
                    </div>
                  )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {ALIEN_CATEGORIES.map(category => (
                    <div key={category.name} className="mb-6">
                      <h3 className="text-ben-green font-bold text-sm uppercase tracking-widest mb-3 border-b border-ben-green/30 pb-2 flex items-center">
                        <span className="w-2 h-2 bg-ben-green rounded-full mr-2"></span>
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {category.aliens.map(alien => {
                          const isSelected = selectedFusion.includes(alien);
                          return (
                            <button 
                              key={alien}
                              onClick={() => handleAlienClick(alien)}
                              className={`relative overflow-hidden group px-2 py-3 border-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-ben-green text-black border-ben-green shadow-[0_0_15px_var(--theme-glow)] scale-105' 
                                  : 'bg-black/50 border-ben-green/30 text-ben-green hover:bg-ben-green/20 hover:border-ben-green hover:shadow-[0_0_10px_var(--theme-glow)]'
                              }`}
                            >
                              <div className="absolute inset-0 bg-ben-green/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                              <span className="relative z-10">{alien}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          <form onSubmit={handleAction} className="relative omnitrix-glow rounded-lg">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ben-green font-bold">&gt;</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={processing}
              placeholder="Nhập hành động hoặc lệnh..."
              className="w-full bg-black border border-ben-green/50 rounded-lg py-4 pl-10 pr-16 text-ben-green focus:outline-none focus:border-ben-green font-mono text-lg"
              autoFocus
            />
            <button 
              type="submit"
              disabled={processing || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-ben-green text-black rounded-md flex items-center justify-center hover:bg-ben-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
