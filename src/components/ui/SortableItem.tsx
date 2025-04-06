import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical } from "react-icons/fa";

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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      {/* 🔧 Drag Handle Icon */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab z-10"
      >
        <FaGripVertical className="text-white opacity-60 hover:opacity-100" />
      </div>

      {/* 🧾 Actual Card Content */}
      <div className="pl-8">
        {children}
      </div>
    </div>
  );
};
