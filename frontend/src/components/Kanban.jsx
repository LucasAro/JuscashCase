import React, { useEffect, useState, useRef } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanColumn from "./KanbanColumn";
import CardModal from "./CardModal";
import { fetchData, updateStatus, isValidMove } from "./kanbanUtils";

const Kanban = () => {
  const [columns, setColumns] = useState({
    nova: [],
    lida: [],
    processada: [],
    concluída: [],
  });
  const [hasMore, setHasMore] = useState({
    nova: true,
    lida: true,
    processada: true,
    concluída: true,
  });
  const [selectedCard, setSelectedCard] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 30;
  const loaderRef = useRef(null);

  const loadColumnsData = async () => {
    await fetchData(
      offset,
      limit,
      columns,
      setColumns,
      setHasMore,
      setOffset,
      setIsLoading,
      hasMore
    );
  };

  useEffect(() => {
    loadColumnsData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && Object.values(hasMore).some((value) => value)) {
          loadColumnsData();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef.current, hasMore]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    if (!isValidMove(source.droppableId, destination.droppableId)) {
      setError("Movimentação não permitida!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const sourceColumn = Array.from(columns[source.droppableId]);
    const destColumn = Array.from(columns[destination.droppableId]);
    const [movedItem] = sourceColumn.splice(source.index, 1);

    setIsUpdating(true);
    const updatedItem = await updateStatus(movedItem.id, destination.droppableId);

    if (updatedItem) {
      destColumn.splice(destination.index, 0, updatedItem);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });
    } else {
      sourceColumn.splice(source.index, 0, movedItem);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });
    }

    setIsUpdating(false);
  };

  return (
    <div>
      {error && <div className="bg-red-500 text-white text-center py-2 mb-4 rounded">{error}</div>}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
          <div className="flex gap-6 p-8 bg-white-100 min-h-screen min-w-max">
            {Object.entries(columns).map(([columnId, items]) => (
              <KanbanColumn
                key={columnId}
                columnId={columnId}
                items={items}
                setSelectedCard={setSelectedCard}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
      <div ref={loaderRef} className="text-center py-4">
        {isLoading && <span>Carregando...</span>}
      </div>
      {selectedCard && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  );
};

export default Kanban;
