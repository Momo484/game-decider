import { useEffect, useState } from "react";
import type { LobbyData } from "../types";
import { supabase } from "../lib/supabase";
import Button from "./Button";

export default function LobbyView({
  lobbyCode,
  isHost,
  onStartVoting,
}: {
  lobbyCode: string | null;
  isHost: boolean;
  onStartVoting: () => void;
}) {
  const [lobby, setLobby] = useState<LobbyData | null>(null);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const fullUrl = `${lobby?.code}`;
    navigator.clipboard.writeText(fullUrl);

    setCopied(true);
    // Hide the "Copied!" message after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // 2. Function to fetch the initial data
    const fetchLobbyData = async () => {
      const { data, error } = await supabase
        .from("lobbies")
        .select("*")
        .eq("code", lobbyCode)
        .single();
      if (error) {
        alert("Error creating lobby: " + error.message);
      } else if (data) {
        setLobby(data);
      }
    };

    fetchLobbyData();

    // 3. Set up the Real-time subscription to update the object
    const channel = supabase
      .channel(`lobby-${lobbyCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${lobbyCode}`,
        },
        (payload) => {
          // This updates your 'lobby' object instantly when the database changes!
          setLobby(payload.new as LobbyData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyCode]);

  if (!lobby)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start py-12 px-6 text-white">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white">
            Loading...
          </h1>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start py-12 px-6 text-white">
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white">
          {lobby.title}
        </h1>
      </div>

      <div className="relative group py-2">
        {/* The main button containing the code */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-3 px-5 py-3 bg-slate-900 border border-slate-800 rounded-xl 
               hover:bg-slate-800 hover:border-blue-500/50 transition-all active:scale-95 group"
        >
          <div className="text-left">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Click to Copy Link
            </p>
            <p className="text-blue-400 font-mono text-2xl font-black tracking-[0.2em]">
              {lobby.code}
            </p>
          </div>

          {/* Subtle Copy Icon that appears on hover */}
          <svg
            className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        </button>

        {/* "Copied!" Tooltip that pops up above the code */}
        {copied && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-md animate-bounce">
            COPIED!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 py-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-4 ml01">
          Games in Session
        </h3>
        <div className="grid gap-3">
          {lobby.game_list.map((game, index) => (
            <div
              key={index}
              className="px-5 py-4 bg-slate-900/50 border border-slate-850 rounded-2xl flex items-center justify-between"
            >
              <span className="font-semibold text-slate-200">{game}</span>
              <span className="text-slate-600 font-mono text-xs">
                #{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* interaction */}
      <div className="space-y-4 py-5">
        {isHost ? (
          <Button content="Start Voting" onClick={onStartVoting} />
        ) : (
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-4 ml01">
            Waiting for the host to start...
          </h2>
        )}
      </div>

      {/* Participants */}
      <div className="mt-12 w-full max-w-md">
        <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-4 ml-1">
          Players Ready
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lobby.participants.map((player, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3 bg-slate-900/30 border border-slate-800/50 rounded-xl"
            >
              {/* Simple Avatar Circle */}
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {player[0].toUpperCase()}
              </div>

              <span className="text-slate-300 font-medium truncate">
                {player}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
