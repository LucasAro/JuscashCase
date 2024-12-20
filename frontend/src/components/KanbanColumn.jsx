import React from "react";
import { Droppable } from "react-beautiful-dnd";
import KanbanCard from "./KanbanCard";

const KanbanColumn = ({ columnId, items, setSelectedCard, isUpdating }) => {
  const columnTitles = {
    nova: "Nova Publicação",
    lida: "Publicação Lida",
    processada: "Enviar para o Advogado Responsável",
    concluída: "Concluído",
  };

  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-50 rounded-lg shadow p-4 min-h-[400px]"
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-lg font-bold ${
                columnId === "concluída" ? "text-green-600" : "text-blue-800"
              }`}
            >
              {columnTitles[columnId]}
            </h2>
            <span className="text-gray-500 font-semibold">{items.length}</span>
          </div>
          {items.map((item, index) => (
            <KanbanCard
              key={item.id}
              item={item}
              index={index}
              setSelectedCard={setSelectedCard}
              isUpdating={isUpdating}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default KanbanColumn;
