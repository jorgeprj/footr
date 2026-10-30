import { ConstructionIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col bg-white text-black">
            <header className="flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
                <Link
                    href="/"
                    aria-label="Footr — página inicial"
                    className="font-archivo-black text-3xl italic tracking-[-0.07em] md:text-4xl"
                >
                    Footr
                </Link>

                <span className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                    Em construção
                </span>
            </header>

            <section className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
                <HugeiconsIcon
                    icon={ConstructionIcon}
                    size={36}
                    strokeWidth={1.5}
                    className="mb-10"
                    aria-hidden="true"
                />

                <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Estamos preparando algo novo
                </p>

                <h1 className="max-w-3xl font-sans text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                    O mercado de camisas
                    <br className="hidden sm:block" /> está prestes a mudar.
                </h1>

                <p className="mt-7 max-w-md font-sans text-base leading-7 text-neutral-500 md:text-lg">
                    Uma nova forma de gerenciar, descobrir e
                    valorizar camisas de futebol. Estamos trabalhando
                    para colocar a Footr em campo.
                </p>

                <div className="mt-12 h-px w-12 bg-black" />
            </section>

            <footer className="flex flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-neutral-400 sm:flex-row md:px-12">
                <span>© 2026 Footr</span>
                <span>Feito para quem vive camisas de futebol.</span>
            </footer>
        </main>
    );
}
