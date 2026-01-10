export function calculateResults(
  votes: string[][],
  allGames: string[] | undefined
): string[] {
  const results: string[] = [];
  let currentBallots = votes.map((v) => [...v]);
  let numGames: number = (allGames as string[]).length;

  while (numGames > 0) {
    const roundWinner = calculateSingleWinner(currentBallots);
    results.push(roundWinner);
    currentBallots = currentBallots.map((ballot) =>
      ballot.filter((g) => g !== roundWinner)
    );
    numGames--;
  }
  return results;
}

function calculateSingleWinner(votes: string[][]): string {
  if (votes.length === 0) return "no votes cast";

  let candidates = Array.from(new Set(votes.flat()));
  while (candidates.length > 1) {
    const counts: Record<string, number> = {};
    candidates.forEach((c) => (counts[c] = 0));

    votes.forEach((ballot) => {
      const topChoice = ballot.find((game) => candidates.includes(game));
      if (topChoice) {
        counts[topChoice]++;
      }
    });

    const totalVotes = votes.length;
    for (const [candidate, count] of Object.entries(counts)) {
      if (count > totalVotes / 2) return candidate;
    }

    const loser = candidates.reduce((a, b) => (counts[a] < counts[b] ? a : b));
    candidates = candidates.filter((c) => c !== loser);
  }
  return candidates[0];
}
