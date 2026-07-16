"use client";

// Sidebar.tsx — Barra de navegación lateral
//
// Aparece en todas las páginas protegidas de la app gracias al layout
// de la Route Group (protected). Al estar aquí centralizado, cualquier
// cambio en la navegación se refleja en toda la app automáticamente.
//
// Es un Client Component ("use client") porque contiene interactividad
// del lado del cliente — en este caso el formulario de logout que usa
// un Server Action importado dinámicamente.
//
// NOTA TÉCNICA: usePathname() causaba un conflicto con Next.js 16 +
// Turbopack al importarse en la cadena Server Component → Client Component.
// Solución aplicada: detectar la ruta activa con window.location en lugar
// de usePathname(), o simplemente omitir el resaltado de ruta activa
// por ahora y añadirlo cuando se estabilice la versión de Next.js.

import Link from "next/link";

// Definición centralizada de los enlaces de navegación.
// Añadir una nueva sección es tan simple como añadir un objeto aquí.

const navLinks = [
  { href: "/menores", label: "Menores" },
  { href: "/seguimientos", label: "Seguimientos" },
  { href: "/incidencias", label: "Incidencias" },
];

type SidebarProps = {
  nombreUsuario: string;
  rolUsuario: string;
};

export default function Sidebar({ nombreUsuario, rolUsuario }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-800">
        <h1 className="text-white font-bold text-lg">Gestión de Menores</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link href="/menores" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          Menores
        </Link>
      </nav>
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-white text-sm">{nombreUsuario}</p>
        <p className="text-gray-400 text-xs">{rolUsuario}</p>
      </div>
    </aside>
  );
}