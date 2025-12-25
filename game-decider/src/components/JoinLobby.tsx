import { useState } from "react";
import Button from "./Button";

interface JoinLobbyProps {
  onJoin: (code: string) => void;
  onBack: () => void;
}

export default function JoinLobby({ onJoin, onBack }: JoinLobbyProps) {
  const [lobbyCode, setLobbyCode] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <input
        placeholder="enter 6-letter code"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
      />

      <Button
        content="Enter Lobby"
        onClick={() => onJoin(lobbyCode)}
        disabled={lobbyCode.length === 0}
      />
      <Button content="Back" onClick={onBack} />
    </div>
  );
}
