import { useState } from 'react';
import Login from './components/Login';
import MainMenu from './components/MainMenu';
import CharacterCreation from './components/CharacterCreation';
import GameInterface from './components/GameInterface';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'menu' | 'create' | 'game'>('menu');
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (view === 'menu') {
    return (
      <MainMenu 
        user={user} 
        onNewGame={() => setView('create')} 
        onContinue={(saveId) => {
          setActiveSaveId(saveId);
          setView('game');
        }} 
      />
    );
  }

  if (view === 'create') {
    return (
      <CharacterCreation 
        user={user} 
        onComplete={(saveId) => {
          setActiveSaveId(saveId);
          setView('game');
        }} 
      />
    );
  }

  if (view === 'game' && activeSaveId) {
    return (
      <GameInterface 
        saveId={activeSaveId} 
        onExit={() => {
          setActiveSaveId(null);
          setView('menu');
        }} 
      />
    );
  }

  return null;
}

