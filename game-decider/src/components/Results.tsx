import Button from "./Button";

export default function Results({ results }: { results: string[] }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-16 px-6 text-center">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white italic uppercase">
          Final Standings
        </h1>
      </div>
      {/* Leaderboard */}
      <div className="w-full max-w-md space-y-4 mb-16">
        {results?.map((game, index) => {
          const isWinner = index === 0;

          return (
            <div
              key={index}
              className={`relative flex items-center p-6 rounded-2xl border transition-all duration-500
                ${
                  isWinner
                    ? "bg-linear-to-r from-yellow-500/20 to-amber-600/20 border-yellow-500 shadow-2xl shadow-yellow-500/20 scale-105"
                    : "bg-slate-900 border-slate-800"
                }`}
            >
              {/* Medal/Rank */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-xl mr-4
                ${
                  isWinner
                    ? "bg-yellow-500 text-black"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {index === 0 ? "1" : index + 1}
              </div>

              {/* Game Name */}
              <div className="flex flex-col text-left">
                <span
                  className={`font-black uppercase tracking-tight ${
                    isWinner ? "text-yellow-500 text-2xl" : "text-white text-xl"
                  }`}
                >
                  {game}
                </span>
                {isWinner && (
                  <span className="text-yellow-500/60 text-xs font-bold tracking-widest uppercase">
                    Most Popular Choice
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Action Button */}
      <div className="w-full max-w-70">
        <Button content="PLAY AGAIN" onClick={() => window.location.reload()} />
      </div>
    </div>
  );
}
