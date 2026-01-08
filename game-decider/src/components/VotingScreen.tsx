import { useState } from "react";

export default function VotingScreen({ game_list }: { game_list: string[] }) {
  const [rankedGames, setRankedGames] = useState<string[]>([]);
}
