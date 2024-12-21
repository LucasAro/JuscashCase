import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar"; // Importe o componente HeaderBar
import SearchBar from "../components/SearchBar";
import Kanban from "../components/Kanban";

const Dashboard = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/"); // Redireciona para o login se não houver token
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/usuarios/validate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: "",
        });

        if (!response.ok) {
          localStorage.removeItem("token"); // Remove token inválido
          navigate("/"); // Redireciona para o login
        }
      } catch (error) {
        console.error("Erro ao validar o token:", error);
        localStorage.removeItem("token");
        navigate("/"); // Redireciona para o login
      }
    };

    validateToken();
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen">
      <HeaderBar />
      <div className="flex-grow overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <SearchBar />
        <Kanban />
      </div>
    </div>
  );



};

export default Dashboard;
