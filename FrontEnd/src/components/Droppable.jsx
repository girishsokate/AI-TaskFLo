import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

const Droppable = ({ id, children, className = "" }) => {
  const { isDropTarget, ref } = useDroppable({
    id,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <section
      ref={ref}
      className={`taskboard__column${isDropTarget ? " is-drop-target" : ""}${
        className ? ` ${className}` : ""
      }`}
      aria-labelledby={`col-${id}`}
    >
      {children}
    </section>
  );
};

export default Droppable;
