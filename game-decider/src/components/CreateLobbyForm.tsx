import { useState } from "react";
import Button from "./Button";

interface CreateLobbyFormProps {
  onCreate: (title: string, games: string[]) => void;
  onBack: () => void;
}

export default function CreateLobbyForm({
  onCreate,
  onBack,
}: CreateLobbyFormProps) {
  const [games, setGames] = useState<string[]>([""]);
  const [title, setTitle] = useState("");

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
    onCreate(title, cleanGames);
  };

  return (
    <div>
      <h3>Lobby Title</h3>
      <input
        placeholder="e.g. Friday Night Gaming"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <h3>Games to Voit On</h3>
      {games.map((game, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <input
            value={game}
            onChange={(e) => handleGameChange(index, e.target.value)}
            placeholder={`Game Option ${index + 1}`}
          />
          {games.length > 1 && (
            <button
              onClick={() => handleRemoveField(index)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              X
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
  );
}
