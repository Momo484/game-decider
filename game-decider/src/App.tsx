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
import ResultsWaiting from "./components/ResultsWaiting";
import Results from "./components/Results";

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

  // Sends Details of a new lobby to supabase and autojoins user as host of
  // new lobby.
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
      .insert([
        {
          code: roomCode,
          title: title,
          game_list: games,
          participants: [userName],
        },
      ])
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

  // Joins lobby matching to room code if exists
  const handleJoinSubmit = async (code: string, userName: string) => {
    setUserName(userName);
    // .from: targets our lobbies database
    // .select: retreives every column
    // .eq: Filters our rows by the code that has been passed in.
    // .single: as opposed to .select, this returns only a single object.
    const lobbyCode = code.toUpperCase();
    const { data, error } = await supabase
      .from("lobbies")
      .select("*")
      .eq("code", lobbyCode)
      .single();

    if (error || !data) {
      alert("Lobby not found! Check the code and try again.");
      return;
    }

    // Don't use Array.push (returns new length); build a new array instead.
    const newParticipants = [...(data.participants ?? []), userName];
    const { data: d2, error: e2 } = await supabase
      .from("lobbies")
      .update({ participants: newParticipants })
      .eq("code", lobbyCode)
      .select();

    if (e2 || !d2) {
      alert("Error pushing username to the cloud, try again");
      return;
    }

    setActiveLobbyCode(lobbyCode);
    setCurrentScreen("LOBBY");
    setLobby(data as LobbyData);
  };

  // Sends update to supabase to begin voting for all players
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

  // Applys the preferential voting calculations and updates supabase with
  // results, ensuring all players move to results screen.
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
        <LobbyView
          lobbyCode={activeLobbyCode}
          isHost={isHost}
          onStartVoting={handleStartVoting}
        />
      </div>
    );
  }

  if (currentScreen === "CREATE") {
    return (
      <>
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
        <JoinLobby
          onJoin={handleJoinSubmit}
          onBack={() => setCurrentScreen("HOME")}
        />
      </>
    );
  }

  if (currentScreen === "VOTING") {
    return (
      <VotingScreen
        lobbyCode={activeLobbyCode!}
        userName={userName}
        onVoteSubmitted={() => {
          setCurrentScreen("RESULTS WAITING");
        }}
      />
    );
  }

  if (currentScreen === "RESULTS WAITING") {
    return (
      <ResultsWaiting isHost={isHost} onFinishVoting={handleFinishVoting} />
    );
  }

  if (currentScreen === "RESULTS") {
    return <Results results={lobby?.results as string[]} />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      {/*Title Section */}
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-center italic">
        GAME <br /> DECIDER
      </h1>
      <p className="text-slate-400 mt-4 md:text-xl font-medium tracking-wide">
        The ultimate tool for game nights.
      </p>
      {/*Buttons*/}
      <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-md">
        <Button
          content="Create Lobby"
          onClick={() => setCurrentScreen("CREATE")}
        />
        <Button content="Join Lobby" onClick={() => setCurrentScreen("JOIN")} />
      </div>
    </div>
  );
}

export default App;
