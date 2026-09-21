import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: { absolute: "Ingresar — Admin Don Vega" },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-ink px-4 py-12 font-sans">
      <div className="w-full max-w-sm border border-input bg-card p-8">
        <p className="text-xs font-semibold tracking-wide text-gold uppercase">
          Don Vega
        </p>
        <h1 className="mt-1 mb-6 font-sans text-xl font-semibold text-cream">
          Panel de administración
        </h1>
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </div>
  );
}
