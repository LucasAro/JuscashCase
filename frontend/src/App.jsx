import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Logo from "./assets/logo.svg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [isLoading, setIsLoading] = useState(false); // Estado para controle do feedback de "Aguarde..."

  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:3000/usuarios/login", {
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
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg border border-gray-300">
        <img src={Logo} alt="JusCash" className="w-60 mx-auto mb-8" />
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-blue-950 font-semibold text-lg">
              E-mail:
            </label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 border border-blue-950 rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-blue-950 font-semibold text-lg">
              Senha:
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
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading} // Desativar o botão enquanto está carregando
            >
              {isLoading ? "Aguarde..." : "Login"} {/* Mostrar "Aguarde..." enquanto carrega */}
            </button>
          </div>
        </form>
        <p className="mt-6 font-semibold text-sm text-center text-blue-950">
          Não possui uma conta?{" "}
          <a
            href="/register"
            className="hover:underline"
          >
            Cadastra-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;