<div align="center">

# ⚖️ Sistema de Gestión de Clínica Jurídica - UCAB Guayana

**Plataforma web integral para la administración y seguimiento de casos jurídicos,**  
**solicitantes, equipos de trabajo y documentación legal.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📋 Descripción

Sistema desarrollado como proyecto universitario para la **Universidad Católica Andrés Bello (UCAB), sede Guayana**. Permite gestionar de forma centralizada y eficiente todas las operaciones de una clínica jurídica: desde el registro de solicitantes y la apertura de casos, hasta la asignación de equipos estudiantiles, el seguimiento de citas y la generación de reportes.

---

## ✨ Funcionalidades Principales

### 📁 Gestión de Casos
- Creación, edición y eliminación de casos jurídicos
- Seguimiento del ciclo de vida completo: *En proceso → Asesoría → Entregado / Archivado*
- Historial cronológico de cambios de estatus con motivo y responsable
- Registro de acciones y observaciones por caso

### 👥 Solicitantes
- Ficha completa del solicitante: datos personales, contacto y domicilio
- Información socioeconómica, educativa y de hogar familiar
- Enlace directo entre solicitante y sus casos

### 🎓 Equipos de Trabajo
- Asignación de profesores supervisores y estudiantes a cada caso
- Control de roles: *Supervisor, Ejecutor, Asignado, Atiende*
- Gestión de términos académicos y estado de habilitación

### 📅 Citas y Orientaciones
- Programación y edición de citas con fecha, hora y lugar
- Registro de orientaciones y usuarios que atendieron
- Programación de cita siguiente automática

### 📊 Reportes y Exportación
- Descarga del historial completo de un caso en PDF + ZIP
- Registro y control en formato `.docx`
- Exportación de reportes estadísticos en Excel
- Visualización de estadísticas con gráficos interactivos (Recharts)

### 🔒 Seguridad y Auditoría
- Autenticación basada en JWT con sesiones seguras
- Sistema de roles: *Administrador, Supervisor, Estudiante*
- Registro de auditoría de todas las operaciones sensibles
- Búsqueda y filtrado avanzado en el historial de cambios

### 🔔 Notificaciones
- Recordatorios automáticos de citas por correo electrónico (SMTP/Nodemailer)
- Sistema de notificaciones internas en tiempo real
- Limpieza automática de notificaciones antiguas

### 🌗 Interfaz
- Modo oscuro / claro con persistencia de preferencia
- Diseño responsivo para escritorio, tablet y móvil
- Animaciones suaves con Framer Motion

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript 5 |
| **Base de Datos** | PostgreSQL (pg nativo) |
| **Estilos** | Tailwind CSS 4 |
| **Autenticación** | JWT (jsonwebtoken) + bcryptjs |
| **Correos** | Nodemailer (SMTP) |
| **Almacenamiento** | Vercel Blob |
| **Generación PDF** | @react-pdf/renderer |
| **Generación DOCX** | docx |
| **Generación Excel** | ExcelJS |
| **Gráficos** | Recharts |
| **Animaciones** | Motion (Framer Motion) |
| **Iconos** | Lucide React |
| **Validación** | Zod |
| **Tema** | next-themes |

---

## 🚀 Instalación y Configuración

### Requisitos previos

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- Una cuenta de correo con acceso SMTP (Gmail u otro proveedor)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Gestion-de-clinicas-juridicas.git
cd Gestion-de-clinicas-juridicas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

```env
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_bd

# Autenticación
JWT_SECRET=tu-secreto-super-seguro
JWT_EXPIRES_IN=30d

# Correo electrónico (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
SMTP_FROM=tu-email@gmail.com

# Entorno
NODE_ENV=development

# Recordatorios de citas (días de anticipación)
CITA_REMINDER_DAYS_AHEAD=1

# Retención de notificaciones (días)
NOTIFICATIONS_TTL_DAYS=30
```

### 4. Configurar la base de datos

Ejecuta los scripts SQL disponibles en la carpeta `/database` para crear las tablas y cargar datos iniciales.

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📂 Estructura del Proyecto

```
├── app/
│   ├── actions/          # Server Actions (lógica de negocio del servidor)
│   ├── auth/             # Páginas de autenticación (login)
│   └── dashboard/        # Módulos del sistema
│       ├── (overview)/   # Página principal (dashboard)
│       ├── cases/        # Gestión de casos
│       ├── applicants/   # Gestión de solicitantes
│       ├── appointments/ # Citas y orientaciones
│       ├── students/     # Gestión de estudiantes
│       ├── users/        # Gestión de usuarios
│       ├── teams/        # Equipos de trabajo
│       ├── audit/        # Historial de auditoría
│       ├── reports/      # Reportes y estadísticas
│       ├── administration/ # Configuración del sistema
│       └── profile/      # Perfil del usuario
├── components/           # Componentes React reutilizables
│   ├── cases/            # Componentes específicos de casos
│   ├── solicitantes/     # Componentes de solicitantes
│   ├── dashboard/        # Componentes del dashboard
│   ├── forms/            # Componentes de formularios
│   ├── ui/               # Componentes UI genéricos
│   └── audit/            # Componentes de auditoría
├── lib/
│   ├── db/               # Queries y conexión a la base de datos
│   ├── services/         # Capa de servicios (lógica de negocio)
│   ├── utils/            # Utilidades y helpers
│   ├── constants/        # Constantes del sistema
│   └── types/            # Tipos TypeScript compartidos
├── database/             # Scripts SQL y migraciones
├── scripts/              # Scripts de mantenimiento (recordatorios, limpieza)
└── public/               # Archivos estáticos
```

---

## ⚙️ Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Inicia la aplicación en modo producción |
| `npm run lint` | Ejecuta el linter de código |
| `npm run reminders:citas` | Envía recordatorios de citas por correo |
| `npm run cleanup:notificaciones` | Limpia notificaciones antiguas de la BD |

---

## 👤 Roles del Sistema

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso total al sistema, gestión de usuarios y configuración |
| **Supervisor** | Gestión de casos, equipos, solicitantes y reportes |
| **Estudiante** | Consulta de casos asignados, registro de citas y acciones |

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para la asignatura de **Bases de Datos** — 7mo semestre, **UCAB Guayana**.

---

<div align="center">

Desarrollado con ❤️ en **UCAB Guayana** · 2025-2026

</div>
