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
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h3>Username</h3>
      <input
        placeholder="username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <input
        placeholder="enter 6-letter code"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
      />

      <Button
        content="Enter Lobby"
        onClick={() => onJoin(lobbyCode, userName)}
        disabled={lobbyCode.length === 0}
      />
      <Button content="Back" onClick={onBack} />
    </div>
  );
}
