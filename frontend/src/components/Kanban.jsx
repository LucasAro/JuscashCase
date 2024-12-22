import React, { useEffect, useState, useRef } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanColumn from "./KanbanColumn";
import CardModal from "./CardModal";
import { fetchData, updateStatus, isValidMove } from "./kanbanUtils";
import SearchBar from "./SearchBar";

const Kanban = () => {
  const [columns, setColumns] = useState({
    nova: { publicacoes: [], total: 0 },
    lida: { publicacoes: [], total: 0 },
    processada: { publicacoes: [], total: 0 },
    concluída: { publicacoes: [], total: 0 },
  });

  const [hasMore, setHasMore] = useState({
    nova: true,
    lida: true,
    processada: true,
    concluída: true,
  });
  const [hasFetchedData, setHasFetchedData] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({});
  const limit = 30;
  const loaderRef = useRef(null);

  const loadColumnsData = async (reset = false, filtersOverride = null) => {
    if (!hasFetchedData) {
      console.warn("Requisição bloqueada: Nenhuma publicação encontrada anteriormente.");
      return;
    }

    if (reset) {
      setColumns({ nova: [], lida: [], processada: [], concluída: [] });
      setOffset(0);
    }

    await fetchData(
      reset ? 0 : offset,
      limit,
      columns,
      setColumns,
      setHasMore,
      setOffset,
      setIsLoading,
      hasMore,
      setHasFetchedData,
      filtersOverride || filters,
      reset
    );
  };

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    loadColumnsData(true, newFilters); // Atualiza dinamicamente
  };

  useEffect(() => {
    loadColumnsData();
  }, []);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasFetchedData && Object.values(hasMore).some((value) => value)) {
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
  }, [loaderRef.current, hasMore, hasFetchedData]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    // Verifica se o destino é válido
    if (!destination) return;

    // Se for na mesma coluna, apenas reordene os cards
    if (source.droppableId === destination.droppableId) {
      const column = Array.from(columns[source.droppableId].publicacoes);
      const [movedItem] = column.splice(source.index, 1);
      column.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...columns[source.droppableId],
          publicacoes: column,
        },
      });

      return; // Não chama o updateStatus
    }

    // Verifica se o movimento é permitido entre colunas
    if (!isValidMove(source.droppableId, destination.droppableId)) {
      setError("Movimentação não permitida!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Acessa as colunas corretamente
    const sourceColumn = Array.from(columns[source.droppableId].publicacoes);
    const destColumn = Array.from(columns[destination.droppableId].publicacoes);

    // Remove o item da coluna de origem
    const [movedItem] = sourceColumn.splice(source.index, 1);

    // Atualiza o status do item via API
    setIsUpdating(true);
    try {
      const updatedItem = await updateStatus(movedItem.id, destination.droppableId);

      if (updatedItem) {
        // Adiciona o item atualizado à coluna de destino
        destColumn.splice(destination.index, 0, updatedItem);

        setColumns({
          ...columns,
          [source.droppableId]: {
            ...columns[source.droppableId],
            publicacoes: sourceColumn,
            total: columns[source.droppableId].total - 1,
          },
          [destination.droppableId]: {
            ...columns[destination.droppableId],
            publicacoes: destColumn,
            total: columns[destination.droppableId].total + 1,
          },
        });
      } else {
        throw new Error("Erro ao atualizar o status do item.");
      }
    } catch (error) {
      console.error("Erro ao mover item:", error);

      // Reverte a alteração em caso de erro
      sourceColumn.splice(source.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...columns[source.droppableId],
          publicacoes: sourceColumn,
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {error && <div className="bg-red-500 text-white text-center py-2 mb-4 rounded">{error}</div>}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
          <div className="flex gap-6 p-8 bg-white-100 min-h-screen min-w-max">
          {Object.entries(columns).map(([columnId, columnData]) => (
            <KanbanColumn
              key={columnId}
              columnId={columnId}
              items={columnData} // Passa o objeto inteiro, incluindo publicacoes e total
              total={columnData.total || 0} // Passa o total
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
