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

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      {...attributes}
      {...listeners}
      /* isDragging ? logic makes the card look like it's "lifting" off the screen */
      className={`flex items-center p-4 mb-3 bg-slate-900 border rounded-2xl cursor-grab active:cursor-grabbing transition-colors ${
        isDragging
          ? "border-blue-500 z-50 shadow-2xl shadow-blue-500/20 opacity-50"
          : "border-slate-800"
      }`}
    >
      <div className="mr-4 text-slate-600 font-bold">☰</div>
      <span className="font-semibold text-slate-200">{name}</span>
    </div>
  );
}
