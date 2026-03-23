import Button from "./Button";

export default function ResultsWaiting({
  isHost,
  onFinishVoting,
  numVotes,
}: {
  isHost: boolean;
  onFinishVoting: () => void;
  numVotes: number;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
        Ballot Locked
      </h1>
      <div className="mt-4 px-4 py-1 bg-slate-900 border border-slate-800 rounded-full inline-flex items-center gap-2">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          {numVotes} {numVotes === 1 ? "Vote" : "Votes"} Cast
        </span>
      </div>
      <div className="mt-10 w-full max-w-sm">
        {isHost ? (
          <div className="space-y-6">
            <p className="text-slate-400 text-sm font-medium">
              You are the Host. Once everyone is ready, reveal the winner to the
              group.
            </p>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-75">
                <Button content="REVEAL WINNER" onClick={onFinishVoting} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-500 text-sm italic">
              Waiting for the host to finalize the results...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
