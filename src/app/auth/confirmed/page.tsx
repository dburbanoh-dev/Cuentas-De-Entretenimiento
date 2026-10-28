import Link from "next/link";

export default function EmailConfirmedPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold">Email confirmado</h1>
      <p>
        Tu email ya está confirmado. Inicia sesión con tu email y contraseña
        para continuar.
      </p>
      <Link href="/login" className="font-medium underline">
        Iniciar sesión
      </Link>
    </main>
  );
}
