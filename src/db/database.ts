import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'ben10_rpg_v2.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    hardcoreMode INTEGER DEFAULT 0,
    rep_plumbers INTEGER DEFAULT 0,
    rep_civilians INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS saves (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    timeline TEXT,
    char_name TEXT,
    char_age INTEGER,
    char_personality TEXT,
    char_identity TEXT,
    char_omnitrix TEXT,
    unlocked_aliens TEXT,
    omnitrix_energy INTEGER DEFAULT 100,
    ultimate_unlocked TEXT,
    deaths INTEGER DEFAULT 0,
    rel_ben INTEGER DEFAULT 0,
    rel_gwen INTEGER DEFAULT 0,
    rel_kevin INTEGER DEFAULT 0,
    current_arc TEXT,
    current_location TEXT,
    main_objective TEXT,
    tension_level INTEGER DEFAULT 0,
    flags TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS story_logs (
    id TEXT PRIMARY KEY,
    save_id TEXT,
    timestamp INTEGER,
    speaker TEXT,
    content TEXT,
    FOREIGN KEY(save_id) REFERENCES saves(id)
  );
`);

export default db;
