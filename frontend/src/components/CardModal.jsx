import React from "react";

const CardModal = ({ card, onClose }) => {
  // Função para retornar "N/A" caso o campo esteja nulo
  const getField = (value) => (value ? value : "N/A");

  const handleOverlayClick = (e) => {
    if (e.target.id === "modalOverlay") {
      onClose(); // Fecha o modal ao clicar fora
    }
  };

  return (
    <div
      id="modalOverlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative sm:w-5/6">
        {/* Botão Fechar (X) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-3xl"
        >
          &times;
        </button>

        {/* Título */}
        <h2 className="text-lg font-bold text-blue-900 mb-3">
          Publicação - {getField(card.processo)}
        </h2>

        {/* Data de Publicação */}
        <p className="text-sm text-gray-700 mb-2">
          <strong>Data de publicação no DJE:</strong> {getField(card.data_disponibilizacao.split('-').reverse().join('/'))}
        </p>

        <hr className="my-2 border-gray-300" />

        {/* Autores */}
        <p className="text-sm text-gray-700 mt-3">
          <strong>Autor(es):</strong>
        </p>
        <ul className="list-disc pl-5 text-gray-600 text-sm">
          <li>{getField(card.autores)}</li>
        </ul>

        {/* Réu */}
        <p className="text-sm text-gray-700 mt-3">
          <strong>Réu:</strong>
        </p>
        <ul className="list-disc pl-5 text-gray-600 text-sm">
          <li>{getField(card.reu)}</li>
        </ul>

        {/* Advogados */}
        <p className="text-sm text-gray-700 mt-3">
          <strong>Advogado(os):</strong>
        </p>
        <ul className="list-disc pl-5 text-gray-600 text-sm">
          <li>{getField(card.advogados)}</li>
        </ul>

        <hr className="my-2 border-gray-300" />

        {/* Valores */}
        <p className="text-sm text-gray-700 mt-3">
          <strong>Valor principal bruto/liquido:</strong> R$ {getField(card.valor_principal_bruto_liquido)}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Valor dos juros moratórios:</strong> R$ {getField(card.valor_juros_moratorios)}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Valor dos honorários advocatícios:</strong> R$ {getField(card.valor_honorarios_advocaticios)}
        </p>

        <hr className="my-2 border-gray-300" />

        {/* Conteúdo da Publicação */}
        <p className="text-sm text-gray-700 mt-3">
          <strong>Conteúdo da Publicação:</strong>
        </p>
        <div className="bg-gray-100 p-2 rounded-md max-h-60 overflow-y-auto text-gray-600 text-sm">
          {getField(card.paragrafo)}
        </div>
      </div>
    </div>
  );
};

export default CardModal;
