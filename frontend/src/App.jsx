import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Logo from "./assets/logo.svg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [isLoading, setIsLoading] = useState(false); // Estado para controle do feedback de "Aguarde..."
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndValidateToken = async () => {
      const token = localStorage.getItem("token");

      // Se o token não existe
      if (!token) {
        console.warn("Token não encontrado.");
        return;
      }

      try {
        // Faz a validação do token
        const response = await fetch(`${apiUrl}/usuarios/validate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: "",
        });

        if (response.ok) {
          // Token válido, redireciona para o dashboard
          navigate("/dashboard");
        } else {
          // Token inválido, remove e fica na página atual ou redireciona
          console.warn("Token inválido.");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Erro ao validar o token:", error);
        localStorage.removeItem("token");
      }
    };

    checkAndValidateToken();
  }, [navigate, apiUrl]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });
    setIsLoading(true); // Ativar o estado de carregamento

    // Validação de e-mail no frontend
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Formato de e-mail inválido." }));
      setIsLoading(false); // Desativar o estado de carregamento
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      if (response.status === 401) {
        setErrors((prev) => ({
          ...prev,
          general: "Credenciais inválidas. Verifique o e-mail e a senha e tente novamente.",
        }));
        setIsLoading(false); // Desativar o estado de carregamento
        return;
      }

      if (!response.ok) {
        throw new Error("Ocorreu um problema. Tente novamente mais tarde.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // Salva o token no localStorage
      navigate("/dashboard"); // Redireciona para o dashboard
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.message }));
    } finally {
      setIsLoading(false); // Desativar o estado de carregamento
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-grayDefault">
      <div className="w-full max-w-lg p-8  h-full flex items-center bg-white  shadow-lg border border-gray-300">
      <div className="w-full max-w-lg  bg-white ">
        <img src={Logo} alt="JusCash" className="w-60 mx-auto mb-8" />
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-blueDefault font-medium text-lg">
              E-mail:
            </label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 border border-blueDefault rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-blueDefault font-medium text-lg">
              Senhas:
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-gray-400"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-[70%] right-3 transform -translate-y-1/2 text-gray-600"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-greenDefault w-[40%] text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading} // Desativar o botão enquanto está carregando
            >
              {isLoading ? "Aguarde..." : "Login"} {/* Mostrar "Aguarde..." enquanto carrega */}
            </button>
          </div>
        </form>
        <p className="mt-6 font-medium underline text-sm text-center text-blueDefault">
          <a
            href="/register"
            className="hover: text-blue-950"
          >
            Não possui uma conta?{" "} Cadastra-se
          </a>
        </p>
        </div>
        </div>
    </div>
  );
};

export default Login;
