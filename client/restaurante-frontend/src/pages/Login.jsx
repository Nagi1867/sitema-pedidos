import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, UtensilsCrossed } from "lucide-react";

function Login() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();

        setErro("");
        setCarregando(true);

        try {
            const resposta = await fetch("/api/login", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usuario,
                    senha,
                }),
            });

            if (!resposta.ok) {
                const resultado = await resposta.json().catch(() => ({}));
                setErro(resultado.mensagem || "Usuário ou senha inválidos.");
                return;
            }

            localStorage.setItem("adminAutenticado", "true");
            navigate("/", { replace: true });
        } catch {
            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <UtensilsCrossed size={28} />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Acesso administrativo
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Entre com suas credenciais para acessar o sistema.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="usuario"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Usuário
                        </label>

                        <input
                            id="usuario"
                            type="text"
                            autoComplete="username"
                            value={usuario}
                            onChange={(event) => setUsuario(event.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Digite seu usuário"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="senha"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Senha
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="senha"
                                type="password"
                                autoComplete="current-password"
                                value={senha}
                                onChange={(event) => setSenha(event.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="Digite sua senha"
                            />
                        </div>
                    </div>

                    {erro && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;