import { useState } from "react";
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
  lobby: LobbyData | null;
  userName: string;
  onVoteSubmitted: () => void;
}

export default function VotingScreen({
  lobby,
  userName,
  onVoteSubmitted,
}: VotingScreenProps) {
  // 2. UI STATE: Holds the draggable order (initialized from lobby or empty)
  const [items, setItems] = useState<string[]>(lobby?.game_list ?? []);
  // 4. DND SENSORS: Defined at the top level to avoid Hook errors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
    if (!lobby || !userName || items.length === 0) {
      alert("Missing info or list not loaded.");
      return;
    }

    const { error } = await supabase.from("votes").insert([
      {
        lobby_code: lobby.code,
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
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-12 px-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-4 ml01">
          Waiting for the host to start...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-12 px-6">
      {/* header */}
      <div className="text-center max-w-md mb-10 space-y-2">
        <h1 className="text-4xl font-black tracking-tighter italic text-white">
          RANK YOUR CHOICES
        </h1>
        <p className="text-slate-500 text sm font-medium leading-relaxed uppercase">
          Drag your favorites to the top!
        </p>
      </div>
      {/* Draggable list area*/}
      <div className="w-full max-w-md">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {items.map((game, index) => (
                <div key={game} className="relative group">
                  {/* Visual Rank Number (#1, #2, etc) */}
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-slate-700 font-black italic text-xl">
                    #{index + 1}
                  </div>
                  <SortableGameCard id={game} name={game} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {/* Action Footer */}
      <div className="mt-12 w-full flex justify-center max-w-70">
        <Button content="SUBMIT MY BALLOT" onClick={submitVote} />
      </div>
    </div>
  );
}
