import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ItemProps {
  id: string;
  name: string;
}

export function SortableGameCard({ id, name }: ItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
    padding: "1rem",
    margin: "0.5rem 0",
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
    cursor: "grab",
    border: "1px solid #444",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span style={{ marginRight: "10px", color: "#888" }}>☰</span>
      {name}
    </div>
  );
}
