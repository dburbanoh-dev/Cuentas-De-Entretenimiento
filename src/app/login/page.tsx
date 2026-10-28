import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { login } from "./actions";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <AuthForm
        action={login}
        submitLabel="Entrar"
        passwordAutoComplete="current-password"
      />
      <p className="text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="font-medium underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
