import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import Logo from "../assets/logo.svg";

const HeaderBar = () => {
  const [isLoading, setIsLoading] = useState(false); // Estado para o feedback de loading
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("token"); // Recupera o token do localStorage

    if (!token) {
      navigate("/"); // Redireciona para o login se não houver token
      return;
    }

    setIsLoading(true); // Ativa o estado de loading

    try {
      // Chama a rota de logout
      const response = await fetch("http://localhost:3000/usuarios/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho Authorization
        },
      });

      if (response.ok) {
        localStorage.removeItem("token"); // Remove o token do localStorage
        navigate("/"); // Redireciona para a página de login
      } else {
        console.error("Erro ao realizar logout");
        // Lógica adicional para exibir mensagens de erro (opcional)
      }
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      // Lógica adicional para tratar erros de conexão (opcional)
    } finally {
      setIsLoading(false); // Desativa o estado de loading
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src={Logo} alt="JusCash" className="h-6 w-auto" />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading} // Desativa o botão enquanto está carregando
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-700 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C3.58 0 0 5.58 0 12h4z"
                  ></path>
                </svg>
                <span className="hidden sm:inline">Saindo...</span>
              </div>
            ) : (
              <>
                <FiLogOut className="mr-1" size={18} />
                <span className="hidden sm:inline">Sair</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
