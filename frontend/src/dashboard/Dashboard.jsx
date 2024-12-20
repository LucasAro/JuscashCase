import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Kanban from "../components/Kanban";
import HeaderBar from "../components/HeaderBar"; // Importe o componente HeaderBar

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/"); // Redireciona para o login se não houver token
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/usuarios/validate", {
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
    <div>
      <HeaderBar /> {/* Inclua o HeaderBar aqui */}
      <h1 className="text-3xl font-bold text-blue-800 text-center my-8">📚 Publicações</h1>
      <Kanban />
    </div>
  );
};

export default Dashboard;
