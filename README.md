# Sistema de Gestión de Clínicas Jurídicas

Sistema web para la gestión integral de clínicas jurídicas universitarias. Permite administrar casos legales, solicitantes, citas, usuarios (estudiantes, profesores y coordinadores), y generar reportes estadísticos.

## Descripción

Este proyecto fue desarrollado como proyecto académico para la materia de Base de Datos. El sistema está diseñado para digitalizar y optimizar los procesos de las clínicas jurídicas universitarias, facilitando:

- Registro y seguimiento de casos legales
- Gestión de solicitantes y sus datos socioeconómicos
- Programación y seguimiento de citas
- Asignación de equipos de trabajo (estudiantes y profesores)
- Generación de reportes y estadísticas
- Auditoría completa de todas las operaciones

## Tecnologías Utilizadas

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca de interfaces de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconografía

### Backend
- **Next.js Server Actions** - Lógica del servidor
- **PostgreSQL** - Base de datos relacional
- **Neon** - Hosting de base de datos PostgreSQL
- **Zod** - Validación de esquemas
- **JWT** - Autenticación basada en tokens
- **Nodemailer** - Envío de correos electrónicos

### Generación de Documentos
- **@react-pdf/renderer** - Generación de PDFs
- **ExcelJS** - Generación de hojas de cálculo
- **docx** - Generación de documentos Word
- **JSZip** - Compresión de archivos

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Base de datos PostgreSQL (recomendado: Neon)

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ByteWizzardd/Gestion-de-clinicas-juridicas.git
   cd Gestion-de-clinicas-juridicas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copiar el archivo de ejemplo y completar los valores:
   ```bash
   cp .env.example .env
   ```
   
   Variables requeridas:
   ```env
   # Base de datos PostgreSQL
   DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_bd
   
   # Autenticación JWT
   JWT_SECRET=tu-secreto-super-seguro
   JWT_EXPIRES_IN=30d
   
   # Correo electrónico (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-contraseña-de-aplicacion
   SMTP_FROM=tu-email@gmail.com
   ```

4. **Inicializar la base de datos**
   
   Ejecutar los scripts SQL en orden:
   ```sql
   -- 1. Esquema principal
   database/schemas/schema.sql
   
   -- 2. Vistas
   database/schemas/views.sql
   
   -- 3. Triggers
   database/schemas/triggers.sql
   
   -- 4. Datos iniciales (seeds)
   database/seeds/
   ```

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta el linter (ESLint) |
| `npm run cleanup:notificaciones` | Limpia notificaciones antiguas |
| `npm run reminders:citas` | Envía recordatorios de citas próximas |

## Estructura del Proyecto

```
├── app/                    # Páginas y rutas (Next.js App Router)
│   ├── actions/            # Server Actions (lógica del servidor)
│   ├── auth/               # Páginas de autenticación
│   └── dashboard/          # Panel principal
│       ├── administration/ # Administración de catálogos
│       ├── applicants/     # Gestión de solicitantes
│       ├── appointments/   # Gestión de citas
│       ├── audit/          # Auditoría del sistema
│       ├── cases/          # Gestión de casos
│       ├── reports/        # Reportes y estadísticas
│       ├── teams/          # Equipos de trabajo
│       └── users/          # Gestión de usuarios
│
├── components/             # Componentes React reutilizables
│   ├── cases/              # Componentes de casos
│   ├── forms/              # Formularios
│   ├── layout/             # Layout y navegación
│   ├── reports/            # Componentes de reportes
│   └── ui/                 # Componentes UI genéricos
│
├── lib/                    # Lógica de negocio y utilidades
│   ├── db/                 # Conexión y queries de base de datos
│   │   ├── pool.ts         # Pool de conexiones PostgreSQL
│   │   ├── queries/        # Helpers para ejecutar SQL
│   │   └── sql-loader.ts   # Cargador de archivos .sql
│   ├── services/           # Servicios de lógica de negocio
│   ├── validations/        # Esquemas de validación (Zod)
│   ├── types/              # Tipos TypeScript
│   └── utils/              # Utilidades generales
│
├── database/               # Base de datos
│   ├── schemas/            # Definición de tablas (DDL)
│   ├── queries/            # Consultas SQL (DML)
│   ├── seeds/              # Datos iniciales
│   └── migrations/         # Migraciones
│
└── public/                 # Archivos estáticos
```

## Módulos del Sistema

### 1. Gestión de Casos
- Crear, editar y eliminar casos legales
- Asignar solicitantes y ámbitos legales
- Registrar acciones realizadas
- Subir documentos de soporte
- Cambiar estatus del caso
- Asignar equipos de trabajo

### 2. Gestión de Solicitantes
- Registro completo de datos personales
- Información socioeconómica (vivienda, familia, ingresos)
- Historial de casos asociados

### 3. Gestión de Citas
- Programación de citas
- Registro de orientaciones
- Recordatorios automáticos por correo

### 4. Gestión de Usuarios
- Roles: Estudiante, Profesor, Coordinador
- Inscripción por semestre académico
- Control de acceso por rol

### 5. Administración de Catálogos
- Estados, municipios y parroquias
- Materias, categorías, subcategorías y ámbitos legales
- Núcleos de atención
- Niveles educativos
- Condiciones de trabajo y actividad

### 6. Reportes y Estadísticas
- Distribución de casos por núcleo
- Distribución por estatus
- Tendencia de carga de casos
- Distribución por trámite
- Generación de informes PDF
- Exportación a Excel
- Historial de casos por solicitante (ZIP)

### 7. Auditoría
- Registro de inserciones, actualizaciones y eliminaciones
- Trazabilidad completa de todas las operaciones
- Filtros por fecha, usuario y tipo de operación

## Base de Datos

El sistema utiliza PostgreSQL con las siguientes características:

- **34 tablas principales** para datos operativos
- **Vistas** para atributos derivados (edad, estatus actual, etc.)
- **Triggers** para auditoría automática
- **Constraints** para integridad referencial
- **Índices** para optimización de consultas

### Diagrama Simplificado de Entidades Principales

```
                    ┌──────────────┐
                    │   USUARIOS   │
                    │  (cedula PK) │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────┴────┐      ┌─────┴─────┐     ┌─────┴─────┐
    │ESTUDIANTES│    │ PROFESORES │    │COORDINADORES│
    └────┬────┘      └─────┬─────┘     └───────────┘
         │                 │
         └────────┬────────┘
                  │
           ┌──────┴──────┐
           │    CASOS    │
           │ (id_caso PK)│
           └──────┬──────┘
                  │
    ┌─────────────┼─────────────┬──────────────┐
    │             │             │              │
┌───┴───┐   ┌─────┴─────┐  ┌────┴────┐   ┌─────┴─────┐
│ CITAS │   │ ACCIONES  │  │BENEFICIARIOS│ │ SOPORTES │
└───────┘   └───────────┘  └─────────┘   └───────────┘
```

## Roles y Permisos

| Funcionalidad | Estudiante | Profesor | Coordinador |
|---------------|:----------:|:--------:|:-----------:|
| Ver casos asignados | ✅ | ✅ | ✅ |
| Crear casos | ✅ | ✅ | ✅ |
| Editar casos | ✅ | ✅ | ✅ |
| Eliminar casos | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Administrar catálogos | ❌ | ❌ | ✅ |
| Ver reportes | ✅ | ✅ | ✅ |
| Ver auditoría | ❌ | ❌ | ✅ |

## Autores

Proyecto desarrollado por el equipo **ByteWizzards** para la Universidad Católica Andrés Bello (UCAB).

## Licencia

Este proyecto es de uso académico. Todos los derechos reservados.
