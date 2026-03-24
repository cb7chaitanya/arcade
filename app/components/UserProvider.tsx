"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface UserContextValue {
  username: string | null;
  setUsername: (name: string) => void;
}

const UserContext = createContext<UserContextValue>({
  username: null,
  setUsername: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

const STORAGE_KEY = "arcade-username";

export default function UserProvider({ children }: { children: React.ReactNode }) {
  // undefined = not yet loaded from localStorage
  // null      = loaded, no saved username
  // string    = loaded, has username
  const [username, setUsernameState] = useState<string | null | undefined>(undefined);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setUsernameState(saved);
  }, []);

  function setUsername(name: string) {
    const trimmed = name.trim().slice(0, 16);
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setUsernameState(trimmed);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setUsername(input);
  }

  // Derive modal visibility — show only after load, if no username
  const showPrompt = username === null;

  return (
    <UserContext.Provider value={{ username: username ?? null, setUsername }}>
      {children}

      {/* Username prompt modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-arcade-card border border-arcade-purple/40 rounded-xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(168,85,247,0.15)]">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🕹️</div>
              <h2 className="text-xl font-bold uppercase tracking-wider neon-glow mb-2">
                Welcome to Arcade
              </h2>
              <p className="text-arcade-muted text-sm">
                Choose a name to get started
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your name"
                maxLength={16}
                autoFocus
                className="w-full px-4 py-3 bg-arcade-darker border border-arcade-purple/30 focus:border-arcade-purple/60 rounded-lg text-sm text-white placeholder:text-arcade-muted outline-none focus:ring-1 focus:ring-arcade-purple/40 transition-colors mb-4"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-full py-3 bg-arcade-purple/20 border border-arcade-purple/40 rounded-lg text-arcade-purple text-xs uppercase tracking-widest font-bold hover:bg-arcade-purple/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start Playing
              </button>
            </form>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}
