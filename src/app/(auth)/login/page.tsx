
import { LoginForm } from "./login-form";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-5 py-12">
            <div className="w-full max-w-100">
                <header className="mb-12 text-center">
                    <h1 className="font-logo text-5xl italic tracking-[-0.07em] text-zinc-950">
                        Footr
                    </h1>

                    <p className="mt-4 text-sm text-zinc-500">
                        Gestão inteligente para lojas de camisas de futebol.
                    </p>
                </header>

                <section>
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                            Bem-vindo de volta.
                        </h2>

                        <p className="mt-2 text-sm text-zinc-500">
                            Entre na sua conta para continuar.
                        </p>
                    </div>

                    <LoginForm />
                </section>

                <footer className="mt-16 text-center">
                    <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-400">
                        FOOTR · GESTÃO PARA LOJAS DE CAMISAS DE FUTEBOL
                    </p>
                </footer>
            </div>
        </main>
    );
}
