// page.tsx — Página de login (ruta raíz "/")
//
// Esta es la primera pantalla que ve el usuario al entrar a la app.
// Contiene el formulario de login que conecta con NextAuth.
//
// "use client" es necesario porque usamos eventos del navegador
// (onClick, onChange) que no funcionan en el servidor.
// En Next.js los componentes son de servidor por defecto —
// solo añadimos "use client" cuando necesitamos interactividad.

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // Estado del formulario — guardamos lo que escribe el usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado de la UI — para mostrar errores y el estado de carga
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Router de Next.js — para redirigir al dashboard tras el login
  const router = useRouter();

  // FUNCIÓN DE LOGIN
  // Se ejecuta cuando el usuario pulsa "Iniciar sesión"
  const handleLogin = async () => {
    // Limpiamos errores anteriores y activamos el estado de carga
    setError("");
    setLoading(true);

    // signIn de NextAuth envía las credenciales a /api/auth/[...nextauth]
    // "redirect: false" evita que NextAuth redirija automáticamente
    // así podemos gestionar nosotros la redirección y los errores
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    // Si hay error en el login mostramos el mensaje
    if (result?.error) {
      setError("Email o contraseña incorrectos");
      return;
    }

    // Si el login fue correcto redirigimos al dashboard
    router.push("/dashboard");
  };

  return (
    // Contenedor que ocupa toda la pantalla y centra el contenido
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      {/* Tarjeta del formulario */}
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Título */}
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          Gestión de Menores
        </h1>

        {/* Subtítulo */}
        <p className="text-gray-400 text-center mb-8 text-sm">
          Sistema de gestión para medidas judiciales
        </p>

        {/* Mensaje de error — solo se muestra si hay error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Campo email */}
          <div>
            <label className="text-gray-300 text-sm block mb-1">
              Correo electrónico
            </label>
            {/* onChange actualiza el estado "email" con cada tecla */}
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Campo contraseña */}
          <div>
            <label className="text-gray-300 text-sm block mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // onKeyDown permite hacer login pulsando Enter
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botón de login */}
          {/* disabled evita múltiples clics mientras carga */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {/* Mostramos texto diferente según el estado de carga */}
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </main>
  );
}