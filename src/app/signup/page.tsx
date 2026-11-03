import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signup } from "./actions";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <AuthForm
        action={signup}
        submitLabel="Registrarme"
        passwordAutoComplete="new-password"
      />
      <p className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
