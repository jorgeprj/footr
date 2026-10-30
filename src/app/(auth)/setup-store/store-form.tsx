
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import {
    createInitialStoreAction,
    type StoreActionState,
} from "@/app/actions/store";

const initialState: StoreActionState = {};

export function StoreForm() {
    const [state, formAction, pending] = useActionState(
        createInitialStoreAction,
        initialState,
    );

    const router = useRouter();

    const audioContextRef = useRef<AudioContext | null>(null);
    const hasPlayedSound = useRef(false);

    function unlockAudio() {
        if (typeof window === "undefined") return;

        if (!audioContextRef.current) {
            const AudioContextClass =
                window.AudioContext ||
                (window as typeof window & {
                    webkitAudioContext?: typeof AudioContext;
                }).webkitAudioContext;

            if (!AudioContextClass) return;

            audioContextRef.current = new AudioContextClass();
        }

        if (audioContextRef.current.state === "suspended") {
            void audioContextRef.current.resume();
        }
    }

    function playCheckSound() {
        const context = audioContextRef.current;

        if (!context || context.state !== "running") return;

        const now = context.currentTime;

        const notes = [
            { frequency: 880, start: 0, duration: 0.12 },
            { frequency: 1174.66, start: 0.09, duration: 0.18 },
        ];

        notes.forEach(({ frequency, start, duration }) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(
                frequency,
                now + start,
            );

            gain.gain.setValueAtTime(0.0001, now + start);
            gain.gain.exponentialRampToValueAtTime(
                0.85,
                now + start + 0.015,
            );
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + start + duration,
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start(now + start);
            oscillator.stop(now + start + duration);
        });
    }

    useEffect(() => {
        if (state.success !== true || hasPlayedSound.current) return;

        hasPlayedSound.current = true;
        playCheckSound();
    }, [state.success]);

    useEffect(() => {
        if (state.success !== true) return;

        const timeout = window.setTimeout(() => {
            router.replace("/dashboard");
        }, 5000);

        return () => window.clearTimeout(timeout);
    }, [state.success, router]);

    if (state.success) {
        return (
            <div className="success-screen fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white px-6 py-12">
                <div className="success-panel w-full max-w-100 text-center">
                    <div className="success-mark mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                        <HugeiconsIcon
                            icon={Tick02Icon}
                            size={30}
                            className="text-zinc-950"
                            strokeWidth={2}
                        />
                    </div>

                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        Configuração concluída
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
                        Sua loja está pronta.
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-zinc-500">
                        Tudo certo! Sua loja já está pronta para começar a
                        organizar suas camisas e gerenciar suas vendas.
                    </p>

                    <p className="mt-8 text-xs text-zinc-400">
                        Você será redirecionado para o painel em alguns segundos.
                    </p>

                    <button
                        type="button"
                        onClick={() => router.replace("/dashboard")}
                        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-8 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                        Ir para o painel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form
            action={formAction}
            onSubmit={unlockAudio}
            className="space-y-6"
        >
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-zinc-800"
                >
                    Nome da loja
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    minLength={2}
                    maxLength={100}
                    required
                    autoFocus
                    placeholder="Ex.: Camisas do João"
                    className="h-12 w-full rounded-lg bg-zinc-100 px-4 text-sm text-zinc-950 outline-none transition-all placeholder:text-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />

                <p className="text-xs leading-5 text-zinc-500">
                    Escolha o nome pelo qual seus clientes conhecem sua loja.
                </p>
            </div>

            {state.error && (
                <p
                    role="alert"
                    className="rounded-lg bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? "Criando loja..." : "Criar minha loja"}
            </button>
        </form>
    );
}
