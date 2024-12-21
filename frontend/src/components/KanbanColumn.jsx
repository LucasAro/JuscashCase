import React from "react";
import { Droppable } from "react-beautiful-dnd";
import KanbanCard from "./KanbanCard";

const KanbanColumn = ( { columnId, items, setSelectedCard, isUpdating } ) =>
{

  console.log("columnId", items);
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
          className="flex flex-col bg-gray-100 rounded-lg shadow p-4 min-h-[400px] min-w-[295px] w-full"
        >
          <div className="flex items-center mb-4">
            <h2
              className={`text-base font-bold ${
                columnId === "concluída" ? "text-green-600" : "text-blue-950"
              }`}
            >
              {columnTitles[columnId]}
            </h2>
            <span className="ml-3 text-gray-500 font-semibold">{items.length}</span>
          </div>
          <div className="border-b border-gray-300 mb-4"></div>
          {items.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Nenhum card encontrado</div>
          ) : (
            items.map((item, index) => (
              <KanbanCard
                key={item.id}
                item={item}
                index={index}
                setSelectedCard={setSelectedCard}
                isUpdating={isUpdating}
              />
            ))
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default KanbanColumn;
