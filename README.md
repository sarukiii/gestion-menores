# 📋 Gestión de Menores — Sistema de gestión para medidas judiciales

> Aplicación web full-stack para la gestión integral de menores que cumplen medidas judiciales en centros de educación social. Desarrollada desde cero como proyecto real con requisitos legales complejos.

---

## 🧭 Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Contexto y motivación](#contexto-y-motivación)
3. [Stack tecnológico](#stack-tecnológico)
4. [Arquitectura](#arquitectura)
5. [Base de datos](#base-de-datos)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Instalación y configuración](#instalación-y-configuración)
8. [Estado del desarrollo](#estado-del-desarrollo)
9. [Roadmap](#roadmap)
10. [Consideraciones legales](#consideraciones-legales)

---

## Descripción del proyecto

Sistema web de gestión de información diseñado para equipos de educación social que trabajan con menores en cumplimiento de medidas judiciales. Permite centralizar, organizar y consultar toda la información relevante de cada menor de forma segura, con control de acceso por roles profesionales.

### Problema que resuelve

Los equipos de educación social en centros de menores gestionan información muy sensible — datos personales, historiales judiciales, informes psicológicos, situaciones familiares — dispersa en documentos físicos, hojas de cálculo y correos. Esto dificulta el seguimiento, la trazabilidad y la coordinación entre profesionales.

Esta aplicación centraliza toda esa información en una plataforma segura, con acceso controlado por rol y registro de autoría en cada documento.

---

## Contexto y motivación

Este proyecto nace de la experiencia directa trabajando como educador/a social en grupos de adolescentes con medidas judiciales. El conocimiento del contexto real ha permitido diseñar una herramienta ajustada a las necesidades reales del equipo, con los campos correctos, los flujos adecuados y los requisitos legales presentes desde el diseño.

Es además el proyecto principal de portfolio en la transición profesional del sector de educación social al desarrollo web.

---

## Stack tecnológico

| Capa | Tecnología | Por qué |
|------|------------|---------|
| Framework | Next.js 14+ (App Router) | Full-stack en un solo proyecto, SSR, rutas API integradas |
| Lenguaje | TypeScript | Tipado estático, mayor seguridad en datos sensibles |
| Estilos | Tailwind CSS | Desarrollo rápido, diseño consistente |
| ORM | Prisma 7 | Tipado end-to-end con la base de datos, migraciones automáticas |
| Base de datos | PostgreSQL | Relacional, robusto, ideal para datos estructurados complejos |
| Autenticación | NextAuth.js (Auth.js) | Sesiones, JWT, control de acceso por rol |
| Adaptador BD | @prisma/adapter-pg | Conexión nativa con PostgreSQL en Prisma 7 |
| Despliegue | Servidor on-premise de la entidad | Requisito legal — datos sensibles de menores |
| Editor | VS Code | Estándar de la industria |
| Control de versiones | Git + GitHub | Historial, colaboración, portfolio |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                    CAPA CLIENTE                      │
│  PC del centro (IP autorizada)  │  Móvil/PC externo  │
│                                 │  (con permiso)     │
└─────────────────┬───────────────┴────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              CAPA SERVIDOR — Next.js + TypeScript   │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Auth.js    │  │  API Routes │  │  Middleware │  │
│  │  Sesiones   │  │  REST/CRUD  │  │  Whitelist  │  │
│  │  JWT, Roles │  │  Informes   │  │  IP         │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                     │
│  ┌──────────────────────┐  ┌────────────────────┐   │
│  │  Frontend React      │  │  Prisma ORM        │   │
│  │  Tailwind CSS        │  │  Modelos, queries  │   │
│  │  Fichas, búsqueda    │  │  Migraciones       │   │
│  └──────────────────────┘  └────────────────────┘   │
│                                                     │
│  [ Contenedor Docker — Servidor on-premise ]        │
└─────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              CAPA DATOS — PostgreSQL                │
│  Menores │ Usuarios │ Informes │ Incidencias        │
└─────────────────────────────────────────────────────┘
```

### Control de acceso por roles

| Rol | Acceso |
|-----|--------|
| MONITOR | Lectura básica, registro de incidencias |
| ATE | Lectura básica |
| EDUCADOR | Fichas, seguimientos, informes educativos |
| TRABAJADOR_SOCIAL | Área social y familiar |
| PSICOLOGO | Área psicológica y salud mental |
| COORDINACION | Acceso completo, validación de informes |
| DIRECCION | Acceso completo + administración |

---

## Base de datos

### Modelos principales

#### `Menor`
Ficha completa de cada menor. Incluye:
- Datos personales (nombre, DNI, fecha de nacimiento, contacto)
- Medida judicial (expediente, tipo de medida, estado, fechas, juzgado)
- Situación familiar (tutor, relación, situación familiar)
- Situación educativa (centro, curso, situación escolar)
- Salud física (médico, centro de salud)
- Salud mental (psicólogo, diagnóstico, medicación)
- Servicios sociales (trabajador social asignado)
- Perfil psicológico
- Objetivos generales y específicos del plan de intervención

#### `Usuario`
Profesionales del equipo con rol asignado. Los roles determinan qué información pueden ver y editar.

#### `InformeInicial`
Se genera al ingreso del menor. Recoge la situación en todas las áreas al inicio, incluyendo consumo de tóxicos, riesgos detectados y plan de intervención inicial.

#### `InformeSeguimiento`
Informe trimestral. Recoge la evolución en todas las áreas de intervención (educativa, familiar, salud, salud mental, servicios sociales, conducta, consumo) y la revisión de objetivos.

#### `InformeExtraordinario`
Se genera ante situaciones relevantes que pueden afectar a la medida judicial. Tipos: salud mental, cambio familiar, embarazo, nuevo delito, adicción, otros.

#### `InformeFinal`
Informe de cierre al finalizar la medida. Recoge el balance de la intervención, la situación en todas las áreas al cierre y las derivaciones a recursos externos.

#### `Incidencia`
Registro de incidentes durante la estancia. Clasificados por gravedad (leve, moderada, grave) con estado de resolución.

### Diagrama de relaciones

```
Usuario ──────────────────────────────────────────┐
   │                                              │
   │ (autor)                                      │
   ▼                                              │
InformeInicial ──────┐                            │
InformeSeguimiento ──┤── menorId ──► Menor ◄──────┘
InformeExtraordinario┤
InformeFinal ────────┘
Incidencia ──────────┘
```

---

## Autenticación

El sistema de login está construido con **NextAuth.js (Auth.js)** usando el proveedor `Credentials` (email + contraseña propios, sin login social).

### Flujo de autenticación

1. El usuario introduce email y contraseña en `/` (pantalla de login)
2. La función `authorize` en `src/lib/auth.ts` busca el usuario en PostgreSQL vía Prisma
3. La contraseña se compara con el hash guardado usando **bcrypt** — nunca se almacena en texto plano
4. Si es correcta, se genera un **token JWT** con el id y el rol del usuario
5. El **middleware** (`src/middleware.ts`) protege todas las rutas excepto el login: si no hay sesión válida, redirige a `/`

### Componentes del sistema

| Archivo | Función |
|---------|---------|
| `src/lib/auth.ts` | Configuración central: proveedor, callbacks JWT/session |
| `src/types/next-auth.d.ts` | Extiende los tipos de NextAuth para incluir el campo `rol` |
| `src/app/api/auth/[...nextauth]/route.ts` | Endpoint API que procesa las peticiones de login/logout |
| `src/middleware.ts` | Protege rutas privadas y redirige según estado de sesión |
| `src/app/page.tsx` | Formulario de login conectado a `signIn()` de NextAuth |

### Seguridad implementada

- Contraseñas cifradas con `bcryptjs` (hash, nunca texto plano)
- Sesión en JWT firmado, sin tabla de sesiones en BD
- Verificación de usuario activo (`activo: false` deshabilita sin borrar)
- Rutas protegidas a nivel de middleware, antes de renderizar cualquier página

---

## Estructura del proyecto

```
gestion-menores/
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   └── migrations/            # Historial de migraciones SQL
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout global
│   │   ├── page.tsx           # Pantalla de login
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Panel principal
│   │   ├── menores/
│   │   │   ├── page.tsx       # Listado de menores
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx   # Ficha individual
│   │   │   └── nuevo/
│   │   │       └── page.tsx   # Crear menor
│   │   ├── seguimientos/
│   │   │   └── page.tsx       # Seguimientos
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts   # Endpoint de NextAuth (GET/POST)
│   │       ├── menores/       # CRUD menores
│   │       └── seguimientos/  # CRUD seguimientos
│   ├── components/
│   │   ├── ui/                # Componentes reutilizables
│   │   ├── menores/           # Componentes de fichas
│   │   └── layout/            # Sidebar y cabecera
│   ├── generated/
│   │   └── prisma/            # Cliente generado por Prisma (no editar)
│   ├── lib/
│   │   ├── prisma.ts          # Cliente singleton de Prisma
│   │   └── auth.ts            # Configuración de NextAuth (login, JWT, roles)
│   ├── types/
│   │   ├── index.ts           # Tipos TypeScript globales
│   │   └── next-auth.d.ts     # Extensión de tipos de NextAuth (campo rol)
│   └── middleware.ts          # Protección de rutas — redirige si no hay sesión
├── .env                       # Variables de entorno (no en Git)
├── prisma.config.ts           # Configuración de Prisma 7
├── next.config.ts
└── package.json
```

---

## Instalación y configuración

### Requisitos previos

- Node.js 18+
- PostgreSQL 15+
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/sarukiii/gestion-menores.git
cd gestion-menores

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env con:
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/gestion_menores?schema=public"
NEXTAUTH_SECRET="clave-secreta-larga"
NEXTAUTH_URL="http://localhost:3000"

# 4. Crear la base de datos en PostgreSQL
# (desde pgAdmin o psql)
CREATE DATABASE gestion_menores;

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Generar el cliente de Prisma
npx prisma generate

# 7. Arrancar el servidor de desarrollo
npm run dev
```

### Dependencias clave instaladas

```bash
npm install prisma @prisma/client          # ORM
npm install @prisma/adapter-pg pg          # Adaptador PostgreSQL (Prisma 7)
npm install next-auth@beta                 # Autenticación
npm install bcryptjs                       # Cifrado de contraseñas
npm install dotenv                         # Variables de entorno en Prisma config
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Estado del desarrollo

### ✅ Completado
- Configuración del proyecto (Next.js, TypeScript, Tailwind)
- Diseño completo de la base de datos (7 modelos, relaciones, enums)
- Migraciones y tablas creadas en PostgreSQL
- Cliente de Prisma configurado con adaptador pg
- Repositorio en GitHub
- **Sistema de autenticación completo (NextAuth + JWT + bcrypt)**
- **Middleware de protección de rutas**
- **Formulario de login funcional conectado al backend**

### 🔄 En progreso
- Dashboard principal
- CRUD de menores

### 📋 Pendiente
- Formularios de informes por tipo y sección de rol
- Control de acceso por rol en la UI (mostrar/ocultar según permisos)
- Búsqueda y filtrado de menores
- Exportación de informes a PDF
- Restricción de acceso por IP (whitelist de dispositivos del centro)
- Docker para despliegue en servidor on-premise
- Seed de usuarios de prueba para testing

---

## Roadmap

| Fase | Contenido | Estado |
|------|-----------|--------|
| 1 | Setup, base de datos, login (interfaz) | ✅ Completada |
| 2 | Autenticación real, middleware, sesiones | ✅ Completada |
| 3 | Dashboard, CRUD menores | 🔄 En curso |
| 4 | Informes, seguimientos, incidencias | 📋 Pendiente |
| 5 | Roles en UI, restricción IP, exportación PDF | 📋 Pendiente |
| 6 | Docker, despliegue en servidor | 📋 Pendiente |

---

## Consideraciones legales

Este proyecto maneja datos especialmente sensibles de menores:

- **RGPD** — Reglamento General de Protección de Datos
- **Ley Orgánica 1/1996** — Protección jurídica del menor
- **Ley Orgánica 5/2000** — Responsabilidad penal de menores
- Los datos se almacenan en servidor on-premise de la entidad responsable
- Acceso restringido por IP y por rol profesional
- Trazabilidad completa: cada registro tiene autor y fecha
- El archivo `.env` con credenciales nunca se sube al repositorio

---

## Autor

**Sara** — Educadora social en transición al desarrollo web  
DAM (Desarrollo de Aplicaciones Multiplataforma)  
Stack: TypeScript · Next.js · PostgreSQL · Prisma · React  

[GitHub](https://github.com/sarukiii) · [LinkedIn](#)

---

> Este proyecto es privado. El repositorio público del portfolio muestra la arquitectura y el código sin datos reales.