import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { timeFromNow } from "./kanbanUtils";

const KanbanCard = ({ item, index, setSelectedCard, isUpdating }) => (
  <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={isUpdating}>
    {(provided) => (
      <div
        className={`bg-white shadow-md rounded p-4 mb-4 cursor-pointer hover:shadow-lg transition ${
          isUpdating ? "cursor-not-allowed opacity-50" : ""
        }`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onClick={() => setSelectedCard(item)}
      >
        <h3 className="text-gray-700 font-semibold mb-2">{item.processo}</h3>
        <div className="flex items-center text-gray-500 text-sm gap-4">
          <span className="flex items-center">⏱ {timeFromNow(item.updatedAt)}</span>
          <span className="flex items-center">📅 {new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    )}
  </Draggable>
);

export default KanbanCard;
