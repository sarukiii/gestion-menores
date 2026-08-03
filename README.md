# 📋 Gestión de Menores — Sistema de gestión para medidas judiciales

> Aplicación web full-stack para la gestión integral de menores que cumplen medidas judiciales en centros de educación social. Desarrollada desde cero como proyecto real con requisitos legales complejos.

---

## 🧭 Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Contexto y motivación](#contexto-y-motivación)
3. [Capturas](#capturas)
4. [Stack tecnológico](#stack-tecnológico)
5. [Arquitectura](#arquitectura)
6. [Base de datos](#base-de-datos)
7. [Autenticación y control de acceso](#autenticación-y-control-de-acceso)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Instalación y configuración](#instalación-y-configuración)
10. [Estado del desarrollo](#estado-del-desarrollo)
11. [Roadmap](#roadmap)
12. [Consideraciones legales](#consideraciones-legales)
13. [Autor](#autor)

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

## Capturas

| Dashboard                                           | Listado de menores                                                |
|---                                                  |---                                                                |
| ![Dashboard](docs/screenshots/dashboard.png)        |       ![Listado de menores](docs/screenshots/listado-menores.png) |

| Ficha de menor                                      | Ficha de menor (detalle)                                           |
|---                                                  | ---                                                                |
| ![Ficha de menor](docs/screenshots/ficha-menor.png) | ![Ficha de menor detalle](docs/screenshots/ficha-menor2.png)       |

| Informe de seguimiento                                              | Incidencias                                        |
|---                                                                  | ---                                                |
| ![Informe de seguimiento](docs/screenshots/informe-seguimiento.png) | ![Incidencias](docs/screenshots/incidencia.png)    |

---

## Stack tecnológico

| Capa                 | Tecnología                        | Por qué                                                         |
| -------------------- | --------------------------------- | --------------------------------------------------------------- |
| Framework            | Next.js 14+ (App Router)          | Full-stack en un solo proyecto, SSR, rutas API integradas       |
| Lenguaje             | TypeScript                        | Tipado estático, mayor seguridad en datos sensibles             |
| Estilos              | Tailwind CSS                      | Desarrollo rápido, diseño consistente                           |
| ORM                  | Prisma 7                          | Tipado end-to-end con la base de datos, migraciones automáticas |
| Base de datos        | PostgreSQL                        | Relacional, robusto, ideal para datos estructurados complejos   |
| Autenticación        | NextAuth.js (Auth.js)             | Sesiones, JWT, control de acceso por rol                        |
| Adaptador BD         | @prisma/adapter-pg                | Conexión nativa con PostgreSQL en Prisma 7                      |
| Contenedores         | Docker + docker-compose           | Entorno reproducible, despliegue on-premise                     |
| Despliegue           | Servidor on-premise de la entidad | Requisito legal — datos sensibles de menores                    |
| Control de versiones | Git + GitHub                      | Historial, colaboración, portfolio                              |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    CAPA CLIENTE                     │
│  PC del centro (IP autorizada)  │  Móvil/PC externo │
│                                 │  (con permiso)    │
└─────────────────┬───────────────┴───────────────────┘
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

| Rol                | Acceso                                     |
| ------------------ | ------------------------------------------ |
| MONITOR            | Lectura básica, registro de incidencias    |
| ATE                | Lectura básica                             |
| EDUCADOR           | Fichas, seguimientos, informes educativos  |
| TRABAJADOR\_SOCIAL | Área social y familiar                     |
| PSICOLOGO          | Área psicológica y salud mental            |
| COORDINACION       | Acceso completo, validación de informes    |
| DIRECCION          | Acceso completo + administración           |

La lógica de permisos vive centralizada en `src/lib/permisos.ts`, que expone funciones como `puedeCrearInformes(rol)` para validar acceso tanto en el frontend (mostrar/ocultar UI) como en cada ruta API, evitando duplicar reglas de negocio.

---

## Base de datos

### Modelos principales

#### `Menor`

Ficha completa de cada menor. Incluye datos personales, medida judicial, situación familiar, educativa, salud física y mental, servicios sociales, perfil psicológico y objetivos del plan de intervención.

#### `Usuario`

Profesionales del equipo con rol asignado. Los roles determinan qué información pueden ver y editar.

#### `InformeInicial`

Se genera al ingreso del menor. Recoge la situación en todas las áreas al inicio, incluyendo consumo de tóxicos, riesgos detectados y plan de intervención inicial.

#### `InformeSeguimiento`

Informe trimestral. Recoge la evolución en todas las áreas de intervención y la revisión de objetivos.

#### `InformeExtraordinario`

Se genera ante situaciones relevantes que pueden afectar a la medida judicial (salud mental, cambio familiar, embarazo, nuevo delito, adicción, otros).

#### `InformeFinal`

Informe de cierre al finalizar la medida. Recoge el balance de la intervención y las derivaciones a recursos externos.

#### `Incidencia`

Registro de incidentes durante la estancia, clasificados por gravedad (leve, moderada, grave) con estado de resolución.

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

## Autenticación y control de acceso

El sistema de login está construido con **NextAuth.js (Auth.js)** usando el proveedor `Credentials` (email + contraseña propios, sin login social).

### Flujo de autenticación

1. El usuario introduce email y contraseña en `/` (pantalla de login)
2. La función `authorize` en `src/lib/auth.ts` busca el usuario en PostgreSQL vía Prisma
3. La contraseña se compara con el hash guardado usando **bcrypt** — nunca se almacena en texto plano
4. Si es correcta, se genera un **token JWT** con el id y el rol del usuario
5. El **middleware** (`src/middleware.ts`) protege todas las rutas excepto el login: si no hay sesión válida, redirige a `/`

### Decisión técnica: configuración dividida (Edge Runtime)

Durante el desarrollo surgió un problema real al integrar Prisma 7 con el middleware de Next.js: el middleware se ejecuta en **Edge Runtime**, un entorno que no soporta módulos nativos de Node (`node:path`, `node:fs`) que usa internamente el cliente generado por Prisma. Importar `auth.ts` directamente desde el middleware rompía la aplicación con errores de módulo nativo no encontrado.

**Solución aplicada** — se dividió la configuración de NextAuth en dos archivos:

- `src/lib/auth.config.ts` — configuración ligera, sin Prisma. Solo páginas y reglas de autorización. Es lo único que se importa desde el middleware.
- `src/lib/auth.ts` — configuración completa, con Prisma y bcrypt. Se usa en la ruta API y en Server Components, donde sí existe un entorno Node completo.

Este patrón está recomendado en la documentación oficial de NextAuth para proyectos con middleware + ORM.

### Corrección de seguridad: permisos en rutas API

Durante una revisión del código se detectó que las cuatro rutas API de informes (`inicial`, `seguimiento`, `extraordinario`, `final`) verificaban que existiera una sesión activa, pero no comprobaban si el rol del usuario tenía permiso para crear informes (`puedeCrearInformes`). Esto permitía que roles con permisos más bajos crearan informes directamente vía API, aunque la UI no mostrara esa opción.

**Solución aplicada** — se añadió la verificación de `puedeCrearInformes(rol)` en cada una de las cuatro rutas, antes de procesar la petición, alineando la validación del backend con las reglas de negocio ya definidas en `permisos.ts`. Este tipo de comprobación es imprescindible: la UI puede ocultar botones, pero solo la API protege realmente los datos.

### Seguridad implementada

- Contraseñas cifradas con `bcryptjs` (hash, nunca texto plano)
- Sesión en JWT firmado con clave generada mediante `crypto.randomBytes(32)`
- Verificación de usuario activo (`activo: false` deshabilita sin borrar, preservando trazabilidad histórica)
- Rutas protegidas a nivel de middleware, antes de renderizar cualquier página
- Verificación de permisos por rol también a nivel de API, no solo de UI
- Separación de configuración Edge/Node para evitar exponer lógica de base de datos en el entorno menos confiable

---

## Estructura del proyecto

```
gestion-menores/
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   ├── migrations/            # Historial de migraciones SQL
│   └── seed.ts                # Script para generar usuarios de prueba
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Pantalla de login
│   │   ├── dashboard/
│   │   ├── menores/
│   │   │   ├── page.tsx        # Listado
│   │   │   ├── [id]/page.tsx   # Ficha individual
│   │   │   └── nuevo/page.tsx  # Alta
│   │   ├── informes/            # Formularios de los 4 tipos de informe
│   │   ├── incidencias/         # Módulo de incidencias
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── menores/
│   │       ├── informes/        # inicial, seguimiento, extraordinario, final
│   │       └── incidencias/
│   ├── components/
│   │   ├── ui/
│   │   ├── menores/
│   │   └── layout/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auth.config.ts
│   │   └── permisos.ts         # Lógica centralizada de control de acceso por rol
│   ├── types/
│   └── middleware.ts
├── docker-compose.yml
├── Dockerfile
├── .env
└── package.json
```

---

## Instalación y configuración

### Requisitos previos

- Node.js 18+
- Docker y docker-compose (recomendado) o PostgreSQL 15+ local
- Git

### Opción 1 — Con Docker (recomendado)

```bash
git clone https://github.com/sarukiii/gestion-menores.git
cd gestion-menores
docker-compose up -d
```

### Opción 2 — Entorno local

```bash
# 1. Clonar el repositorio
git clone https://github.com/sarukiii/gestion-menores.git
cd gestion-menores

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (crear .env)
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/gestion_menores?schema=public"
NEXTAUTH_SECRET="clave-secreta-larga"
NEXTAUTH_URL="http://localhost:3000"

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Generar el cliente de Prisma
npx prisma generate

# 6. (Opcional) Poblar la base de datos con usuarios de prueba
npx prisma db seed

# 7. Arrancar el servidor de desarrollo
npm run dev
```

Abre <http://localhost:3000>

---

## Estado del desarrollo

### ✅ Completado

- Configuración del proyecto (Next.js, TypeScript, Tailwind)
- Diseño completo de la base de datos (7 modelos, relaciones, enums)
- Sistema de autenticación completo y verificado end-to-end (NextAuth + JWT + bcrypt)
- Middleware de protección de rutas, separado en configuración Edge-safe
- Sistema de permisos por rol centralizado (`permisos.ts`)
- CRUD completo de menores (listado, ficha, alta)
- Los 4 tipos de informes (inicial, seguimiento, extraordinario, final)
- Módulo de incidencias
- Seed script para generar usuarios de prueba de forma reproducible
- Dashboard principal con sesión real, rol visible y logout funcional
- Verificación de permisos a nivel de API (no solo de UI) en las rutas de informes
- Docker y docker-compose para entorno reproducible

### 📋 Pendiente

- Control de acceso por rol en la UI (afinar qué se muestra/oculta según permisos)
- Búsqueda y filtrado avanzado de menores
- Exportación de informes a PDF
- Restricción de acceso por IP (whitelist de dispositivos del centro)
- Migrar `middleware.ts` a la convención `proxy.ts` (deprecation aviso de Next.js 16)

---

## Roadmap

| Fase | Contenido                                             | Estado        |
| ---- | ----------------------------------------------------- | ------------  |
| 1    | Setup, base de datos, login (interfaz)                | ✅ Completada |
| 2    | Autenticación real, middleware, sesiones, dashboard   | ✅ Completada |
| 3    | CRUD menores                                          | ✅ Completada |
| 4    | Informes, seguimientos, incidencias                   | ✅ Completada |
| 5    | Roles en UI, restricción IP, exportación PDF          | 📋 Pendiente  |
| 6    | Docker, despliegue en servidor                        | ✅ Completada |

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
- El repositorio público no contiene datos reales de menores ni credenciales; los ejemplos y capturas usan datos ficticios

---

## Autor

**Sara** — Educadora social en transición al desarrollo web
DAM (Desarrollo de Aplicaciones Multiplataforma) · AWS Cloud Practitioner
Stack: TypeScript · Next.js · PostgreSQL · Prisma · React

[GitHub](https://github.com/sarukiii) · [LinkedIn]([(https://www.linkedin.com/in/sara-lopez-reina/)])