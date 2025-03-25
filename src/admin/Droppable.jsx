import { useDroppable } from "@dnd-kit/core";

const Droppable = ({ id, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`p-4 min-h-[200px] border-2 ${isOver ? "border-blue-500 bg-blue-100" : "border-gray-300"}`}
        >
            {children}
        </div>
    );
};

export default Droppable;
