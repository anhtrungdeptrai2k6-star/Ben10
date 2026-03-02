import { Router } from 'express';
import db from '../db/database';
import crypto from 'crypto';

export const apiRouter = Router();

apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').run(id, username, password);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  } else if (user.password !== password) {
    return res.status(401).json({ error: 'Sai mật khẩu' });
  }
  res.json({ user });
});

apiRouter.get('/users/:id/saves', (req, res) => {
  const saves = db.prepare('SELECT * FROM saves WHERE user_id = ?').all(req.params.id);
  res.json({ saves });
});

apiRouter.post('/saves', (req, res) => {
  const { userId, character, hardcoreMode, matureMode } = req.body;
  const saveId = crypto.randomUUID();
  
  db.prepare('UPDATE users SET hardcoreMode = ? WHERE id = ?').run(hardcoreMode ? 1 : 0, userId);

  db.prepare(`
    INSERT INTO saves (
      id, user_id, title, timeline, char_name, char_age, char_personality, char_identity, char_omnitrix,
      unlocked_aliens, current_arc, current_location, main_objective, flags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    saveId, userId, `Save - ${character.name}`, character.timeline, character.name, character.age,
    character.personality, `${character.identityRole} | Tiểu sử: ${character.background}`, character.omnitrixType,
    JSON.stringify(['Heatblast', 'Four Arms', 'XLR8']), 'Khởi đầu', 'Bellwood', 'Khám phá sức mạnh Omnitrix',
    JSON.stringify({ matureMode: !!matureMode })
  );

  res.json({ saveId });
});

apiRouter.get('/saves/:id', (req, res) => {
  const save = db.prepare('SELECT * FROM saves WHERE id = ?').get(req.params.id) as any;
  if (!save) return res.status(404).json({ error: 'Not found' });
  
  const logs = db.prepare('SELECT * FROM story_logs WHERE save_id = ? ORDER BY timestamp ASC').all(req.params.id);
  res.json({ save, logs });
});

apiRouter.post('/saves/:id/action', (req, res) => {
  const saveId = req.params.id;
  const { action, aiResult } = req.body;

  const save = db.prepare('SELECT * FROM saves WHERE id = ?').get(saveId) as any;
  if (!save) return res.status(404).json({ error: 'Save not found' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(save.user_id) as any;

  try {
    // Transaction-like behavior
    const userLogId = crypto.randomUUID();
    db.prepare('INSERT INTO story_logs (id, save_id, timestamp, speaker, content) VALUES (?, ?, ?, ?, ?)')
      .run(userLogId, saveId, Date.now(), 'Player', action);

    if (aiResult.death && user.hardcoreMode) {
      db.prepare('DELETE FROM story_logs WHERE save_id = ?').run(saveId);
      db.prepare('DELETE FROM saves WHERE id = ?').run(saveId);
      return res.json({ deleted: true });
    }

    const newEnergy = Math.max(0, Math.min(100, save.omnitrix_energy + (aiResult.energyChange || 0)));
    const newTension = Math.max(0, save.tension_level + (aiResult.tensionChange || 0));
    
    db.prepare('UPDATE saves SET omnitrix_energy = ?, tension_level = ?, deaths = deaths + ? WHERE id = ?')
      .run(newEnergy, newTension, aiResult.death ? 1 : 0, saveId);

    if (aiResult.reputationChange) {
      db.prepare('UPDATE users SET rep_plumbers = rep_plumbers + ?, rep_civilians = rep_civilians + ? WHERE id = ?')
        .run(aiResult.reputationChange.plumbers || 0, aiResult.reputationChange.civilians || 0, save.user_id);
    }

    const sysLogId = crypto.randomUUID();
    db.prepare('INSERT INTO story_logs (id, save_id, timestamp, speaker, content) VALUES (?, ?, ?, ?, ?)')
      .run(sysLogId, saveId, Date.now(), 'System', aiResult.story);

    res.json({ success: true, energy: newEnergy });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/saves/:id', (req, res) => {
  const saveId = req.params.id;
  db.prepare('DELETE FROM story_logs WHERE save_id = ?').run(saveId);
  db.prepare('DELETE FROM saves WHERE id = ?').run(saveId);
  res.json({ success: true });
});
