import { useEffect, useState } from "react";
import "./App.css";
import Button from "./components/Button";
import CreateLobbyForm from "./components/CreateLobbyForm";
import JoinLobby from "./components/JoinLobby";
import { supabase } from "./lib/supabase";
import LobbyView from "./components/LobbyView";
import VotingScreen from "./components/VotingScreen";
import type { LobbyData } from "./types";
import { calculateResults } from "./lib/CalculateResults";

type Screen =
  | "HOME"
  | "CREATE"
  | "JOIN"
  | "LOBBY"
  | "VOTING"
  | "RESULTS WAITING"
  | "RESULTS";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("HOME");

  const [activeLobbyCode, setActiveLobbyCode] = useState<string | null>(null);

  const [isHost, setIsHost] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>("Player");

  const [lobby, setLobby] = useState<LobbyData | null>(null);

  const handleCreateSubmit = async (
    title: string,
    games: string[],
    userName: string
  ) => {
    // we gotta create a database entry for the lobby, set the lobbyCode as generated
    // then change the screen to a lobby vote screen, and allow for voting
    // Also then we use the database as the source of truth for voting and result
    // diplaying

    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    // await: tells javascript to wait for confirmation before proceeding running code.
    // .from: targets the "lobbies" table in our supabase database.
    // .insert: inserts the information we wish to insert into our supabase database
    // it is in an array format as supabase allows us to insert multiple rows at once.
    // .select: instead of receiving a confirmation of success from .insert, this returns
    // the data from the row we have added, giving us the generated id and stuff in form.
    const { data, error } = await supabase
      .from("lobbies")
      .insert([{ code: roomCode, title: title, game_list: games }])
      .select();

    // Here we  check that we don't have an error, and if not set our react state variables
    // to have the current correct information.
    if (error) {
      alert("Error creating lobby: " + error.message);
    } else if (data) {
      setActiveLobbyCode(roomCode);
      setCurrentScreen("LOBBY");
      setIsHost(true);
      setLobby(data[0] as LobbyData);
    }

    setUserName(userName);

    // SetActiveLobbyCode("NEW-CODE");
    // SetCurrentScreen("LOBBY");
  };

  const handleJoinSubmit = async (code: string, userName: string) => {
    // .from: targets our lobbies database
    // .select: retreives every column
    // .eq: Filters our rows by the code that has been passed in.
    // .single: as opposed to .select, this returns only a single object.
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

    setUserName(userName);
  };

  const handleStartVoting = async () => {
    const { data, error } = await supabase
      .from("lobbies")
      .update({ is_voting_open: true }) // The column: the new value
      .eq("code", activeLobbyCode) // The filter: find the row with this code
      .select(); // Optional: get the updated row back

    if (error) {
      console.error("Failed to start voting:", error.message);
      alert("Could not start voting. Try again!");
    } else {
      console.log("Voting has officially started!", data);
    }
  };

  const handleFinishVoting = async () => {
    const { data: ballots, error: fetchError } = await supabase
      .from("votes")
      .select("ranked_ids")
      .eq("lobby_code", activeLobbyCode);

    if (fetchError || !ballots) return;

    // We extract just the arrays: [['Halo', 'Chess'], ['Chess', 'Halo']]
    const formattedBallots = ballots.map((v) => v.ranked_ids);
    const results = calculateResults(formattedBallots, lobby?.game_list);

    const { error } = await supabase
      .from("lobbies")
      .update({
        is_voting_open: false,
        voting_finished: true,
        results: results,
      })
      .eq("code", activeLobbyCode);

    if (error) {
      alert("Error closing voting: " + error.message);
    }
  };

  // useEffect is a hook used to listen to supabase.
  useEffect(() => {
    if (!activeLobbyCode) return;

    // Subscribe to changes in the 'lobbies' table for our specific code
    // .channel: We name the dedicated line to supabase.
    // .on: Tells us to notify the react application whenever a change
    // occurs "on" a channel that fits the criteria (an update occurs, on a public
    // table named lobbies with the code matching the activeLobby code (for performance)).
    // payload: is the packet of information sent from supabase, with the updated row info.
    // .subscribe: Turns on the listener and starts the stream.
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
          if (payload.new.is_voting_open) {
            setCurrentScreen("VOTING");
          }
          if (payload.new.voting_finished) {
            setCurrentScreen("RESULTS");
            setLobby(payload.new as LobbyData);
          }
        }
      )
      .subscribe();

    // Tells the app to stop listening.
    return () => {
      supabase.removeChannel(channel);
    };
    // [activeLobbyCode] is our dependency array, this function runs when active lobby
    // code changes.
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

  if (currentScreen === "VOTING") {
    return (
      <div className="container">
        <h1>Voting Room</h1>
        <VotingScreen
          lobbyCode={activeLobbyCode!}
          userName={userName} // You'll need a state for this!
          onVoteSubmitted={() => {
            setCurrentScreen("RESULTS WAITING");
          }}
        />

        <Button
          content="Exit to Home"
          onClick={() => setCurrentScreen("HOME")}
        />
      </div>
    );
  }

  if (currentScreen === "RESULTS WAITING") {
    return (
      <div className="container">
        <h1>Ballot Submitted!</h1>
        <p>Your rankings are locked in.</p>

        {/* Real-time feedback makes the system feel alive */}
        <div className="status-box">
          {isHost ? (
            <>
              <p>
                Once everyone has finished, click below to calculate the winner.
              </p>
              <Button
                content="Finish Voting & Reveal Winner"
                onClick={handleFinishVoting}
              />
            </>
          ) : (
            <div className="loader">
              <p>Waiting for the host to finalize the results...</p>
              {/* You could add a count here later: "5 votes collected" */}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === "RESULTS") {
    return (
      <div className="container results-screen">
        <h1>The Results are In!</h1>

        <div className="podium">
          {lobby?.results?.map((game, index) => (
            <div key={game} className={`rank-card rank-${index + 1}`}>
              <span className="medal">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : `#${index + 1}`}
              </span>
              <span className="game-name">{game}</span>
            </div>
          ))}
        </div>

        <Button content="New Game" onClick={() => window.location.reload()} />
      </div>
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
