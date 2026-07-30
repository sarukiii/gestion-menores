# 📋 Gestión de Menores — Sistema de gestión para medidas judiciales

> Aplicación web full-stack para la gestión integral de menores que cumplen medidas judiciales en centros de educación social. Desarrollada desde cero como proyecto real con requisitos legales complejos.

---

## 🧭 Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Contexto y motivación](#contexto-y-motivación)
3. [Stack tecnológico](#stack-tecnológico)
4. [Arquitectura](#arquitectura)
5. [Control de acceso por roles](#control-de-acceso-por-roles)
6. [Base de datos](#base-de-datos)
7. [Autenticación](#autenticación)
8. [Funcionalidades implementadas](#funcionalidades-implementadas)
9. [Estructura del proyecto](#estructura-del-proyecto)
10. [Instalación y configuración](#instalación-y-configuración)
11. [Despliegue con Docker](#despliegue-con-docker)
12. [Estado del desarrollo](#estado-del-desarrollo)
13. [Consideraciones legales](#consideraciones-legales)

---

## Descripción del proyecto

Sistema web de gestión de información diseñado para equipos de educación social que trabajan con menores en cumplimiento de medidas judiciales. Permite centralizar, organizar y consultar toda la información relevante de cada menor de forma segura, con control de acceso por roles profesionales.

### Problema que resuelve

Los equipos de educación social en centros de menores gestionan información muy sensible — datos personales, historiales judiciales, informes psicológicos, situaciones familiares — dispersa en documentos físicos, hojas de cálculo y correos. Esto dificulta el seguimiento, la trazabilidad y la coordinación entre profesionales.

Esta aplicación centraliza toda esa información en una plataforma segura, con acceso controlado por rol y registro de autoría en cada documento.

---

## Contexto y motivación

Este proyecto nace de la experiencia directa trabajando como educadora social en grupos de adolescentes con medidas judiciales. El conocimiento del contexto real ha permitido diseñar una herramienta ajustada a las necesidades reales del equipo, con los campos correctos, los flujos adecuados y los requisitos legales presentes desde el diseño.

Es además el proyecto principal de portfolio en la transición profesional del sector de educación social al desarrollo web.

---

## Stack tecnológico

| Capa | Tecnología | Por qué |
|------|------------|---------|
| Framework | Next.js 16 (App Router) | Full-stack en un solo proyecto, SSR, rutas API integradas |
| Lenguaje | TypeScript | Tipado estático, mayor seguridad en datos sensibles |
| Estilos | Tailwind CSS | Desarrollo rápido, diseño consistente |
| ORM | Prisma 7 | Tipado end-to-end con la base de datos, migraciones automáticas |
| Base de datos | PostgreSQL 18 | Relacional, robusto, ideal para datos estructurados complejos |
| Autenticación | NextAuth.js (Auth.js) | Sesiones, JWT, control de acceso por rol |
| Adaptador BD | @prisma/adapter-pg | Conexión nativa con PostgreSQL en Prisma 7 |
| Contenerización | Docker + docker-compose | Despliegue reproducible en servidor on-premise |
| Editor | VS Code | Estándar de la industria |
| Control de versiones | Git + GitHub | Historial, colaboración, portfolio |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    CAPA CLIENTE                      │
│  PC del centro (IP autorizada)  │  Móvil/PC externo  │
│                                 │  (con permiso)      │
└─────────────────┬───────────────┴────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              CAPA SERVIDOR — Next.js + TypeScript    │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Auth.js    │  │  API Routes │  │  proxy.ts   │ │
│  │  Sesiones   │  │  REST/CRUD  │  │  Protección │ │
│  │  JWT, Roles │  │  Informes   │  │  de rutas   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                      │
│  ┌──────────────────────┐  ┌────────────────────┐   │
│  │  Frontend React      │  │  Prisma ORM        │   │
│  │  Tailwind CSS        │  │  Modelos, queries  │   │
│  │  Fichas, búsqueda    │  │  Migraciones       │   │
│  └──────────────────────┘  └────────────────────┘   │
│                                                      │
│  [ Contenedor Docker — Servidor on-premise ]         │
└─────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              CAPA DATOS — PostgreSQL                 │
│  Menores │ Usuarios │ Informes │ Incidencias         │
└─────────────────────────────────────────────────────┘
```

---

## Control de acceso por roles

El sistema implementa control de acceso granular definido en `src/lib/permisos.ts`. La lógica está centralizada en un único archivo para que cualquier cambio en las reglas solo requiera modificar un sitio.

| Rol | Acceso |
|-----|--------|
| DIRECCION | Acceso completo a todos los menores y funcionalidades |
| COORDINACION | Acceso completo + asignación de tutores educativos |
| PSICOLOGO | Acceso completo a todos los menores |
| TRABAJADOR_SOCIAL | Acceso completo a todos los menores |
| EDUCADOR | Acceso completo solo a los menores que tiene asignados como tutor |
| ATE | Acceso básico: ficha general e incidencias |

### Decisión técnica: tutor educativo como clave de acceso

El modelo `Menor` tiene un campo `tutorEducativoId` que apunta al educador responsable. Este campo determina si un educador puede ver la ficha completa de un menor. Solo COORDINACION y DIRECCION pueden asignar tutores, a través de un endpoint separado (`PUT /api/menores/[id]/tutor`) por razones de seguridad y claridad de código.

---

## Base de datos

### Modelos principales

#### `Menor`
Ficha completa de cada menor con más de 30 campos organizados en áreas:
- Datos personales (nombre, DNI, fecha de nacimiento, contacto)
- Medida judicial (expediente, tipo, estado, fechas, juzgado)
- Situación familiar (tutor legal, relación, situación familiar)
- Situación educativa (centro, curso, situación escolar)
- Salud física (médico, centro de salud)
- Salud mental (psicólogo, diagnóstico, medicación)
- Servicios sociales (trabajador social asignado)
- Perfil psicológico y objetivos de intervención
- Tutor educativo asignado (determina permisos de acceso)

#### `Usuario`
Profesionales del equipo con rol asignado. Incluye campo `activo` para deshabilitar sin borrar, preservando la trazabilidad histórica de informes e incidencias.

#### `InformeInicial`
Se genera al ingreso del menor. Recoge situación en todas las áreas, incluyendo consumo de tóxicos, riesgos y plan de intervención inicial.

#### `InformeSeguimiento`
Informe trimestral. Evolución por áreas, revisión de objetivos y propuesta de continuación.

#### `InformeExtraordinario`
Ante situaciones que pueden afectar a la medida: salud mental, cambio familiar, embarazo, nuevo delito, adicción. Incluye campo `requiereModificacion` para indicar si el hecho implica cambio de medida judicial.

#### `InformeFinal`
Cierre del expediente. Balance de objetivos, situación al cierre en todas las áreas y derivaciones a recursos externos.

#### `Incidencia`
Notificaciones al juzgado de hechos puntuales. Clasificadas por gravedad (leve, moderada, grave). Accesibles para todos los roles — es la única funcionalidad disponible para ATE además de ver la ficha básica.

### Diagrama de relaciones

```
Usuario ──────────────────────────────────────────────┐
   │                                                  │
   │ (autor de informes e incidencias)                │
   ▼                                                  │
InformeInicial ──────┐                                │
InformeSeguimiento ──┤                                │
InformeExtraordinario┤── menorId ──► Menor ◄──────────┘
InformeFinal ────────┘                    ▲
Incidencia ──────────┘                   │
                                          │ tutorEducativoId
                                       Usuario (EDUCADOR)
```

---

## Autenticación

Sistema construido con **NextAuth.js (Auth.js)** usando proveedor `Credentials` (email + contraseña propios).

### Flujo completo

1. Usuario introduce credenciales en `/` (pantalla de login)
2. `authorize` en `auth.ts` busca el usuario en PostgreSQL vía Prisma
3. Contraseña comparada con hash bcrypt — nunca almacenada en texto plano
4. Si correcta, se genera **token JWT** con id, nombre y rol del usuario
5. `proxy.ts` protege todas las rutas: sin sesión válida → redirige al login

### Decisión técnica: configuración dividida para Edge Runtime

El middleware de Next.js se ejecuta en **Edge Runtime**, que no soporta módulos nativos de Node (`node:path`, `node:fs`) usados internamente por el cliente generado por Prisma 7. Importar `auth.ts` directamente desde el middleware rompía la aplicación.

**Solución aplicada:**
- `src/lib/auth.config.ts` — configuración ligera sin Prisma, importada desde el middleware
- `src/lib/auth.ts` — configuración completa con Prisma y bcrypt, usada en rutas API y Server Components

Este patrón está recomendado en la documentación oficial de NextAuth para proyectos con middleware + ORM.

### Seguridad implementada

- Contraseñas cifradas con `bcryptjs` (hash irreversible)
- `NEXTAUTH_SECRET` generado con `crypto.randomBytes(32)` — aleatoriedad criptográfica real
- Campo `activo` en Usuario — deshabilitar sin borrar preserva trazabilidad
- Rutas protegidas a nivel de middleware antes de renderizar
- Separación Edge/Node evita exponer lógica de BD en entorno menos seguro
- Autoría en API tomada siempre de la sesión, nunca del body de la petición

---

## Funcionalidades implementadas

### CRUD de menores
- Alta de menor con formulario completo por secciones colapsables
- Listado con búsqueda en tiempo real por nombre/expediente y filtro por estado
- Ficha individual con modo lectura / modo edición inline
- Control de acceso por rol aplicado en API y UI

### Sistema de informes
Cuatro tipos de informe accesibles desde la ficha del menor, con sección unificada que los lista cronológicamente:

| Tipo | Cuándo | Campos destacados |
|------|--------|-------------------|
| Inicial | Al ingreso | Situación en todas las áreas, consumo, riesgos, plan |
| Seguimiento | Trimestral | Evolución por áreas, revisión de objetivos |
| Extraordinario | Ante hechos relevantes | Tipo, descripción, impacto, comunicaciones |
| Final | Al cierre | Balance, situación al cierre, derivaciones |

### Incidencias
Registro de notificaciones al juzgado accesible para todos los roles. Selección visual de gravedad (leve, moderada, grave).

### Gestión de tutores
Coordinación y Dirección pueden asignar el educador tutor de cada menor desde la ficha. El tutor asignado determina el acceso del educador a esa ficha.

### Navegación
Sidebar global con navegación entre secciones, avatar con inicial del usuario, rol visible y logout.

---

## Estructura del proyecto

```
gestion-menores/
├── prisma/
│   ├── schema.prisma              # Modelos de base de datos
│   ├── seed.ts                    # Datos de prueba (7 usuarios, 4 menores, informes)
│   └── migrations/                # Historial de migraciones SQL
├── src/
│   ├── app/
│   │   ├── page.tsx               # Pantalla de login
│   │   ├── (protected)/           # Route Group — layout con sidebar
│   │   │   ├── layout.tsx         # Layout protegido con SessionProvider
│   │   │   ├── dashboard/
│   │   │   ├── menores/
│   │   │   │   ├── page.tsx       # Listado con búsqueda y filtros
│   │   │   │   ├── nuevo/         # Formulario de alta
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Ficha con control de acceso por rol
│   │   │   │       ├── incidencias/
│   │   │   │       └── informes/
│   │   │   │           ├── inicial/
│   │   │   │           ├── seguimiento/
│   │   │   │           ├── extraordinario/
│   │   │   │           └── final/
│   │   │   └── seguimientos/
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── menores/
│   │       │   ├── route.ts       # GET listado, POST crear
│   │       │   └── [id]/
│   │       │       ├── route.ts   # GET ficha, PUT editar
│   │       │       └── tutor/     # PUT asignar tutor
│   │       ├── informes/
│   │       │   ├── inicial/
│   │       │   ├── seguimiento/
│   │       │   ├── extraordinario/
│   │       │   └── final/
│   │       ├── incidencias/
│   │       └── usuarios/          # GET lista de educadores
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx        # Navegación global
│   ├── lib/
│   │   ├── prisma.ts              # Cliente singleton de Prisma con adaptador pg
│   │   ├── auth.ts                # Configuración completa NextAuth (con Prisma)
│   │   ├── auth.config.ts         # Configuración Edge-safe (sin Prisma)
│   │   └── permisos.ts            # Lógica centralizada de control de acceso
│   ├── types/
│   │   └── next-auth.d.ts         # Extensión de tipos NextAuth (campo rol)
│   └── proxy.ts                   # Protección de rutas (Next.js 16)
├── Dockerfile                     # Imagen multi-stage para producción
├── docker-compose.yml             # App + PostgreSQL en contenedores
├── .dockerignore
├── .env                           # Variables de entorno (no en Git)
├── prisma.config.ts               # Configuración Prisma 7
└── next.config.ts                 # output: standalone para Docker
```

---

## Instalación y configuración

### Requisitos previos

- Node.js 20+
- PostgreSQL 18
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/sarukiii/gestion-menores.git
cd gestion-menores

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno — crear archivo .env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/gestion_menores?schema=public"
NEXTAUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
NEXTAUTH_URL="http://localhost:3000"

# 4. Crear la base de datos en PostgreSQL (desde pgAdmin o psql)
# CREATE DATABASE gestion_menores;

# 5. Ejecutar migraciones y generar cliente
npx prisma migrate dev
npx prisma generate

# 6. Poblar con datos de prueba
npx prisma db seed

# 7. Arrancar el servidor de desarrollo
npm run dev
```

### Usuarios de prueba (contraseña: Test1234)

| Email | Rol |
|-------|-----|
| coordinacion@test.com | Coordinación |
| direccion@test.com | Dirección |
| educador1@test.com | Educador/a |
| educador2@test.com | Educador/a |
| psicologo@test.com | Psicólogo/a |
| trabajadorsocial@test.com | Trabajador/a Social |
| ate@test.com | ATE |

---

## Despliegue con Docker

Para desplegar en el servidor on-premise de la entidad:

```bash
# Crear archivo .env con las variables de producción
# Arrancar app + base de datos en segundo plano
docker-compose up -d

# Ejecutar migraciones en el contenedor
docker-compose exec app npx prisma migrate deploy

# Poblar con datos iniciales
docker-compose exec app npx prisma db seed
```

La imagen usa **multi-stage build** para minimizar el tamaño final — solo incluye los archivos necesarios para ejecutar la app en producción, no las devDependencies ni el código fuente.

---

## Estado del desarrollo

### ✅ Completado
- Setup completo (Next.js 16, TypeScript, Tailwind, Prisma 7, PostgreSQL)
- Sistema de autenticación end-to-end (NextAuth + JWT + bcrypt)
- Configuración dividida Edge/Node para compatibilidad con Prisma 7
- Middleware de protección de rutas (`proxy.ts`)
- CRUD completo de menores (alta, listado, ficha, edición)
- Búsqueda en tiempo real y filtrado por estado en el listado
- 4 tipos de informe con formularios completos (inicial, seguimiento, extraordinario, final)
- Módulo de incidencias accesible para todos los roles
- Control de acceso por rol en API y UI (`src/lib/permisos.ts`)
- Asignación de tutor educativo por Coordinación/Dirección
- Sidebar de navegación global con SessionProvider
- Seed con datos de prueba realistas (7 usuarios, 4 menores, informes, incidencias)
- Dockerización con multi-stage build y docker-compose
- Documentación completa

### 📋 Pendiente
- Exportación de informes a PDF
- Restricción de acceso por IP (whitelist de dispositivos del centro)
- Búsqueda global de informes
- Portfolio web personal

---

## Consideraciones legales

Este proyecto maneja datos especialmente sensibles de menores:

- **RGPD** — Reglamento General de Protección de Datos
- **Ley Orgánica 1/1996** — Protección jurídica del menor
- **Ley Orgánica 5/2000** — Responsabilidad penal de menores
- Los datos se almacenan en servidor on-premise de la entidad responsable
- Acceso restringido por rol profesional con lógica centralizada en `permisos.ts`
- Trazabilidad completa: cada informe e incidencia registra autoría y fecha
- La autoría en las API siempre se toma de la sesión, nunca del body de la petición
- El archivo `.env` con credenciales nunca se sube al repositorio

---

## Autor

**Sara** — Educadora social en transición al desarrollo web
DAM (Desarrollo de Aplicaciones Multiplataforma)
Stack: TypeScript · Next.js · PostgreSQL · Prisma · React · Docker

[GitHub](https://github.com/sarukiii) · [LinkedIn](#)

---

> Este proyecto es privado por contener lógica de negocio para uso institucional real. El repositorio muestra arquitectura, decisiones técnicas y código sin datos reales de menores.