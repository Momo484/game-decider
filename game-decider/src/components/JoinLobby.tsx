import { useState } from "react";
import Button from "./Button";

interface JoinLobbyProps {
  onJoin: (code: string, userName: string) => void;
  onBack: () => void;
}

export default function JoinLobby({ onJoin, onBack }: JoinLobbyProps) {
  const [lobbyCode, setLobbyCode] = useState("");
  const [userName, setUserName] = useState<string>("Player");

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      {/*Title*/}
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic mb-8">
        JOIN LOBBY
      </h1>
      {/*Forms */}
      <div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
            Your Name
          </label>
          <input
            placeholder="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus-ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
            Lobby Code
          </label>
          <input
            placeholder="enter 6-letter code"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus-ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <Button
          content="Enter Lobby"
          onClick={() => onJoin(lobbyCode, userName)}
          disabled={lobbyCode.length === 0}
        />
        <Button content="Cancel" onClick={onBack} />
      </div>
    </div>
  );
}
