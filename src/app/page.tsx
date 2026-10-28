import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold">Cuentas de Entretenimiento</h1>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-foreground px-4 py-2 font-medium text-background"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium dark:border-zinc-700"
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
