import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Inicio" };

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Inicio</h1>
      <Suspense fallback={<p>Cargando…</p>}>
        <CurrentUserEmail />
      </Suspense>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium dark:border-zinc-700"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}

// Lee la sesión en tiempo de petición, por eso va dentro de un Suspense.
async function CurrentUserEmail() {
  const user = await getCurrentUser();
  return <p>Sesión iniciada como {user.email}</p>;
}
