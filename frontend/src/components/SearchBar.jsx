import React, { useState, useEffect } from "react";
import { FaSearch, FaBalanceScale } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const triggerSearch = () => {
    onSearch({
      searchQuery,
      startDate,
      endDate,
    });
  };

  useEffect(() => {
    // Timeout para debounce
    const debounceTimeout = setTimeout(triggerSearch, 500);

    // Cleanup para evitar múltiplas execuções
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, startDate, endDate]); // Somente quando esses valores mudam

  return (
    <div className="bg-white shadow-sm py-3">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 llg:space-y-0">
          <div className="flex items-center space-x-2">
            <FaBalanceScale className="text-blue-950" size={35} />
            <h1 className="text-3xl font-medium text-gray-800">Publicações</h1>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 w-full lg:w-2/3">
            <div className="flex-grow">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Pesquisar
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Digite o número do processo ou nome das partes envolvidas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
              <div className="flex flex-col flex-grow lg:flex-grow-0 w-full lg:w-auto">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Data do diário
                </label>
                <div className="flex items-center space-x-2 w-full">
                   <span className="text-sm text-blue-950">De:</span>
                  <input
                    type="date"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-sm text-gray-950">Até:</span>
                  <input
                    type="date"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    onClick={triggerSearch} // Chama a busca diretamente
                    className="px-3 py-2 bg-green-500 text-white rounded-md flex items-center justify-center"
                  >
                    <FaSearch size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
