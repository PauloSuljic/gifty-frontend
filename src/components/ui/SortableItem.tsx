import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableItemProps = {
  id: string;
  children: React.ReactNode;
};

export const SortableItem = ({ id, children }: SortableItemProps) => {
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
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",              // ✅ Prevent zooming/panning while dragging
    cursor: isDragging ? "grabbing" : "grab" // ✅ Visual feedback
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative select-none" // ✅ Prevent text selection during drag
      {...attributes}
      {...listeners}
    >

      <div>
        {children}
      </div>
    </div>
  );
};
