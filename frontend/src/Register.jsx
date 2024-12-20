import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Logo from "./assets/logo.svg";

const Register = () => {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Controle de visibilidade de senha
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Controle de visibilidade de confirmação

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Limpa o erro ao digitar
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validação no Frontend
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = "Este campo é obrigatório.";
    if (!form.email.trim()) newErrors.email = "Este campo é obrigatório.";
    if (!form.senha.trim()) newErrors.senha = "Este campo é obrigatório.";
    if (!form.confirmarSenha.trim())
      newErrors.confirmarSenha = "Este campo é obrigatório.";

    if (form.senha && form.senha !== form.confirmarSenha) {
      newErrors.confirmarSenha = "A confirmação de senha não corresponde.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/usuarios/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
        }),
      });

      const result = await response.json();

      if (response.status === 400) {
        setErrors((prev) => ({
          ...prev,
          senha: result.detalhes
            ? result.detalhes.join(" ")
            : "A senha não atende aos requisitos.",
        }));
      } else if (response.status === 500) {
        setErrors({ general: result.error || "Erro ao registrar usuário." });
      } else if (response.ok) {
        //alert("Cadastro realizado com sucesso!");
        window.location.href = "/"; // Redireciona para login
      }
    } catch (error) {
      setErrors({ general: "Ocorreu um problema. Tente novamente mais tarde." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg border border-gray-300">
        <img src={Logo} alt="JusCash" className="w-60 mx-auto mb-8" />
        <form onSubmit={handleRegister}>
          {/* Nome Completo */}
          <div className="mb-4">
            <label className="block text-blue-950 font-semibold">
              Seu nome completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-gray-400"
            />
            {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
          </div>

          {/* E-mail */}
          <div className="mb-4">
            <label className="block text-blue-950 font-semibold">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-gray-400"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Senha */}
          <div className="mb-4 relative">
            <label className="block text-blue-950 font-semibold">
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="senha"
              placeholder="Sua senha"
              value={form.senha}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-gray-400"
            />
            <span
              className="absolute right-3 top-12 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
            {errors.senha && <p className="text-red-500 text-sm">{errors.senha}</p>}
          </div>

          {/* Confirme sua senha */}
          <div className="mb-4 relative">
            <label className="block text-blue-950 font-semibold">
              Confirme sua senha <span className="text-red-500">*</span>
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmarSenha"
              placeholder="Confirme sua senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-gray-400"
            />
            <span
              className="absolute right-3 top-12 cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
            {errors.confirmarSenha && (
              <p className="text-red-500 text-sm">{errors.confirmarSenha}</p>
            )}
          </div>

          {/* Mensagem de Erro Geral */}
          {errors.general && (
            <p className="text-red-500 text-center mb-4">{errors.general}</p>
          )}

          {/* Botão Criar Conta */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? "bg-green-400" : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold px-6 py-2 rounded-md transition duration-300 `}
            >
              {loading ? "Aguarde..." : "Criar conta"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm font-semibold text-end text-blue-950">
          Já possui uma conta?{" "}
          <a href="/" className="hover:underline">
            Fazer o login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
