import { useEffect, useState } from "react";
import type { LobbyData } from "../types";
import { supabase } from "../lib/supabase";

export default function LobbyView({ lobbyCode }: { lobbyCode: string | null }) {
  const [lobby, setLobby] = useState<LobbyData | null>(null);

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

  if (!lobby) return <div> Loading Lobby... </div>;

  return (
    <div className="lobby-container">
      <h1>{lobby.title}</h1>
      <p>
        Invite friends with code: <strong>{lobby.code}</strong>
      </p>

      <h3>Games in this session:</h3>
      <ul>
        {lobby.game_list.map((game, index) => (
          <li key={index}>{game}</li>
        ))}
      </ul>
    </div>
  );
}
