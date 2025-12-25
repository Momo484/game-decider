import { useEffect, useState } from "react";
import "./App.css";
import Button from "./components/Button";
import CreateLobbyForm from "./components/CreateLobbyForm";
import JoinLobby from "./components/JoinLobby";
import { supabase } from "./lib/supabase";
import LobbyView from "./components/LobbyView";

type Screen = "HOME" | "CREATE" | "JOIN" | "LOBBY" | "VOTING" | "RESULTS";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("HOME");

  const [activeLobbyCode, setActiveLobbyCode] = useState<string | null>(null);

  const [isHost, setIsHost] = useState<boolean>(false);

  const handleCreateSubmit = async (title: string, games: string[]) => {
    console.log("TODO: Send this to supabase ->", { title, games });

    // we gotta create a database entry for the lobby, set the lobbyCode as generated
    // then change the screen to a lobby vote screen, and allow for voting
    // Also then we use the database as the source of truth for voting and result
    // diplaying

    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    const { data, error } = await supabase
      .from("lobbies")
      .insert([{ code: roomCode, title: title, game_list: games }])
      .select();

    if (error) {
      alert("Error creating lobby: " + error.message);
    } else if (data) {
      setActiveLobbyCode(roomCode);
      setCurrentScreen("LOBBY");
      setIsHost(true);
    }

    // SetActiveLobbyCode("NEW-CODE");
    // SetCurrentScreen("LOBBY");
  };

  const handleJoinSubmit = async (code: string) => {
    console.log("TODO: Check Supabase for code ->", code);

    const { data, error } = await supabase
      .from("lobbies")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !data) {
      alert("Lobby not found! Check the code and try again.");
    } else {
      setActiveLobbyCode(code);
      setCurrentScreen("LOBBY");
    }
  };

  const handleStartVoting = () => {};

  useEffect(() => {
    if (!activeLobbyCode) return;

    // Subscribe to changes in the 'lobbies' table for our specific code
    const channel = supabase
      .channel("lobby-room")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${activeLobbyCode}`,
        },
        (payload) => {
          console.log("Lobby updated live!", payload.new);
          // Here you can check if payload.new.is_voting_open is true
          // and switch everyone's screen automatically!
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeLobbyCode]);

  // #######################################
  if (currentScreen === "LOBBY") {
    return (
      <div>
        <LobbyView lobbyCode={activeLobbyCode} />
        {isHost ? (
          <Button content="Start Voting" onClick={handleStartVoting} />
        ) : (
          "Waiting for the host to start..."
        )}
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
