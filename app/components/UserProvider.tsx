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

  const showPrompt = username === null;

  return (
    <UserContext.Provider value={{ username: username ?? null, setUsername }}>
      {children}

      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="modal-enter bg-arcade-card border border-arcade-purple/40 pulse-border rounded-xl p-8 max-w-sm w-full shadow-[0_0_60px_rgba(168,85,247,0.15)]">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🕹️</div>
              <h2 className="font-pixel text-sm uppercase tracking-wider neon-glow mb-3">
                Welcome
              </h2>
              <p className="text-arcade-muted text-xs">
                Choose a name to get started
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Your name"
                maxLength={16}
                autoFocus
                className="neon-input w-full mb-4"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="neon-btn neon-btn-purple w-full"
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
