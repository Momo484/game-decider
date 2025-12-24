import { useState } from "react";
import "./App.css";
import Button from "./components/Button";
import CreateLobbyForm from "./components/CreateLobbyForm";
import JoinLobby from "./components/JoinLobby";

type Screen = "HOME" | "CREATE" | "JOIN" | "LOBBY";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("HOME");

  const [activeLobbyCode, setActiveLobbyCode] = useState<string | null>(null);

  const handleCreateSubmit = (title: string, games: string[]) => {
    console.log("TODO: Send this to supabase ->", { title, games });
    // SetActiveLobbyCode("NEW-CODE");
    // SetCurrentScreen("LOBBY");
  };

  const handleJoinSubmit = (code: string) => {
    console.log("TODO: Check Supabase for code ->", code);
    setActiveLobbyCode(code);
    setCurrentScreen("LOBBY");
  };

  if (currentScreen === "LOBBY") {
    return (
      <div>
        <h1>Lobby: {activeLobbyCode}</h1>
        <p>Waiting for players... </p>
        <Button
          content={"Leave Lobby"}
          onClick={() => setCurrentScreen("HOME")}
        />
      </div>
    );
  }

  if (currentScreen === "CREATE") {
    return (
      <>
        <h1>Setup your vote</h1>
        <CreateLobbyForm
          onCreate={handleCreateSubmit}
          onBack={() => setCurrentScreen("HOME")}
        />
      </>
    );
  }

  if (currentScreen === "JOIN") {
    return (
      <>
        <h1>Join A Group</h1>
        <JoinLobby
          onJoin={handleJoinSubmit}
          onBack={() => setCurrentScreen("HOME")}
        />
      </>
    );
  }

  // Default: HOME
  return (
    <>
      <div>
        <h1>Game Decider</h1>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button
            content="Create Lobby"
            onClick={() => setCurrentScreen("CREATE")}
          />
          <Button
            content="Join Lobby"
            onClick={() => setCurrentScreen("JOIN")}
          />
        </div>
      </div>
    </>
  );
}

export default App;
