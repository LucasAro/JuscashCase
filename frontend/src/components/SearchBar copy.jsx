import React, { useState } from "react";
import { FaSearch, FaBalanceScale } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    onSearch({
      searchQuery,
      startDate,
      endDate,
    });
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 py-3">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <FaBalanceScale className="text-blue-950" size={35} />
            <h1 className="text-3xl font-medium text-gray-800">Publicações</h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full sm:w-2/3">
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

            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <div className="flex flex-col flex-grow sm:flex-grow-0 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Data do diário
                </label>
                <div className="flex items-center space-x-2 w-full">
                  <input
                    type="date"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    onClick={handleSearch}
                    className="px-3 py-2 bg-green-500 text-white rounded-md flex items-center justify-center"
                  >
                    <FaSearch size={16} />
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
