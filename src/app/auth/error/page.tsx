import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold">Enlace no válido</h1>
      <p>El enlace de confirmación no es válido o ya expiró.</p>
      <Link href="/login" className="font-medium underline">
        Volver a iniciar sesión
      </Link>
    </main>
  );
}
