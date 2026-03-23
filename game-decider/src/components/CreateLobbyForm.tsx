import { useState } from "react";
import Button from "./Button";
import { isUsernameValid } from "../logic/Auth";

interface CreateLobbyFormProps {
  onCreate: (title: string, games: string[], userName: string) => void;
  onBack: () => void;
}

export default function CreateLobbyForm({
  onCreate,
  onBack,
}: CreateLobbyFormProps) {
  const [games, setGames] = useState<string[]>([""]);
  const [title, setTitle] = useState("");
  const [userName, setUserName] = useState<string>("Player");

  const handleGameChange = (index: number, value: string) => {
    const newGames = [...games];
    newGames[index] = value;
    setGames(newGames);
  };

  const handleAddField = () => {
    setGames([...games, ""]);
  };

  const handleRemoveField = (index: number) => {
    setGames(games.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const cleanGames = games.filter((g) => g.trim() !== "");
    if (!isUsernameValid(userName)) {
      return;
    }
    onCreate(title, cleanGames, userName);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      {/*Title*/}
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic mb-8">
        CREATE LOBBY
      </h1>
      {/*Forms */}
      <div>
        <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
          Lobby Title
        </label>
        <input
          placeholder="e.g. Friday Night Gaming"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus-ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
          Your Name
        </label>
        <input
          placeholder="username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus-ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-3 py-3">
        <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">
          Games to vote on
        </label>
        {games.map((game, index) => (
          <div key={index} className="flex gap-2 group">
            <input
              value={game}
              onChange={(e) => handleGameChange(index, e.target.value)}
              placeholder={`Game Option ${index + 1}`}
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {games.length > 1 && (
              <button
                onClick={() => handleRemoveField(index)}
                className="px-4 text-slate-500 hover:text-red-500 transition-colors font-bold"
              >
                x
              </button>
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button content={"Add Another Game"} onClick={handleAddField} />
          <Button content={"Create Lobby"} onClick={handleSubmit} />
          <Button content={"Cancel"} onClick={onBack} />
        </div>
      </div>
    </div>
  );
}
