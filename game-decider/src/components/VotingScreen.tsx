import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Button from "./Button";
import { SortableGameCard } from "./SortableGameCard";
import type { LobbyData } from "../types";

interface VotingScreenProps {
  lobbyCode: string;
  userName: string;
  onVoteSubmitted: () => void;
}

export default function VotingScreen({
  lobbyCode,
  userName,
  onVoteSubmitted,
}: VotingScreenProps) {
  // 1. DATABASE STATE: Holds the raw data from Supabase
  const [lobby, setLobby] = useState<LobbyData | null>(null);

  // 2. UI STATE: Holds the draggable order (initialized from lobby or empty)
  const [items, setItems] = useState<string[]>(lobby?.game_list ?? []);

  // 3. FETCH & SUBSCRIBE: Sync with the cloud
  useEffect(() => {
    const fetchLobbyData = async () => {
      const { data, error } = await supabase
        .from("lobbies")
        .select("*")
        .eq("code", lobbyCode)
        .single();

      if (error) {
        console.error("Fetch error:", error.message);
      } else if (data) {
        setLobby(data as LobbyData);
        setItems((data as LobbyData).game_list ?? []);
      }
    };

    fetchLobbyData();

    const channel = supabase
      .channel(`lobby-voting-${lobbyCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `code=eq.${lobbyCode}`,
        },
        (payload) => {
          setLobby(payload.new as LobbyData);
          setItems((payload.new as LobbyData).game_list ?? []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyCode]);

  // 4. DND SENSORS: Defined at the top level to avoid Hook errors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const submitVote = async () => {
    if (!lobbyCode || !userName || items.length === 0) {
      alert("Missing info or list not loaded.");
      return;
    }

    const { error } = await supabase.from("votes").insert([
      {
        lobby_code: lobbyCode,
        user_name: userName,
        ranked_ids: items,
      },
    ]);

    if (error) {
      alert("Submission failed: " + error.message);
    } else {
      onVoteSubmitted();
    }
  };

  // 6. RENDER GUARD: Prevents dnd-kit from initializing with null/empty data
  if (!lobby || items.length === 0) {
    return (
      <div className="container">
        <p>Loading your lobby's games...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h2>Rank Your Choices</h2>
      <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: "1.5rem" }}>
        Drag the best games to the top!
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {items.map((game) => (
              <SortableGameCard key={game} id={game} name={game} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div style={{ marginTop: "2.5rem" }}>
        <Button content="Submit My Ballot" onClick={submitVote} />
      </div>
    </div>
  );
}
