import { useDraggable } from "@dnd-kit/core";

const Draggable = ({ id, label }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
    });

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="cursor-pointer p-2 border rounded bg-gray-100"
        >
            {label}
        </div>
    );
};

export default Draggable;
