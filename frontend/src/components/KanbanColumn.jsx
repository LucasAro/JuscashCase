import React from "react";
import { Droppable } from "react-beautiful-dnd";
import KanbanCard from "./KanbanCard";

const KanbanColumn = ({ columnId, items, total, setSelectedCard, isUpdating }) => {
  const columnTitles = {
    nova: "Nova Publicação",
    lida: "Publicação Lida",
    processada: "Enviar para o Advogado Responsável",
    concluída: "Concluído",
  };

  const publicacoes = items?.publicacoes || []; // Garante que seja um array

  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex flex-col bg-grayDefault rounded-lg shadow p-4 min-h-[400px] min-w-[295px] w-full"
        >
          <div className="flex items-center mb-4">
            <h2
              className={`text-base font-medium ${
                columnId === "concluída" ? "text-green-600" : "text-blueDefault"
              }`}
            >
              {columnTitles[columnId]}
            </h2>
            {/* Exibindo o total ao invés do length */}
            <span className="ml-3 text-gray-500 font-semibold">{total}</span>
          </div>
          <div className="border-b border-gray-300 mb-4"></div>
          {publicacoes.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Nenhum card encontrado</div>
          ) : (
            publicacoes.map((item, index) => (
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
