"use client";

import { useState } from "react";
import { login } from "../contexts/user/user.actions";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    whatsapp: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await login(formData);

      if (!response) {
        setError("WhatsApp ou senha inválidos");
        return;
      }

      // Salvar o token e dados do usuário nos cookies
      setCookie("token", response.token, {
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      setCookie("user", JSON.stringify(response.user), {
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Redirecionar para a página de administração
      router.push("/admin");
    } catch (err: unknown) {
      console.error("Erro ao fazer login:", err);
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (name === "whatsapp") {
      // Formatar o WhatsApp enquanto digita
      const formatted = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2")
        .slice(0, 16);

      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 py-8 rounded-xl bg-white/10 items-center justify-center border border-white/10 shadow-lg text-white">
      <div>
        <h2 className="text-center text-3xl font-extrabold">
          Faça seu login
        </h2>
      </div>

      <form className="space-y-6 w-full pt-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="whatsapp" className="text-sm font-medium text-white">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-white/50 placeholder-white/50 text-white focus:outline-none focus:ring-white focus:border-white focus:z-10 sm:text-sm"
              placeholder="Digite seu WhatsApp"
              value={formData.whatsapp}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-white">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-white/50 placeholder-white/50 text-white focus:outline-none focus:ring-white focus:border-white focus:z-10 sm:text-sm"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={handleInputChange}
              minLength={8}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              isLoading
                ? "bg-foreground/50 cursor-not-allowed"
                : "bg-foreground hover:bg-foreground/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
