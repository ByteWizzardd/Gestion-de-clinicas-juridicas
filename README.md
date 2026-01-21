# Sistema de Gestión de Clínica Jurídica - UCAB Guayana

Un sistema integral basado en web desarrollado para la **Universidad Católica Andrés Bello (UCAB) - Sede Guayana**, diseñado para la gestión de su clínica jurídica universitaria. Permite el control de solicitudes, casos legales, citas, estudiantes, profesores y la generación de reportes y auditorías detalladas.

## 🚀 Tecnologías Principales

Este proyecto ha sido construido utilizando las últimas tecnologías en el desarrollo web moderno:

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
-   **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Base de Datos**: PostgreSQL
-   **Cliente DB**: `pg` (node-postgres)
-   **Autenticación**: JWT customizado & Bcrypt
-   **Gráficos**: Recharts
-   **Generación de Documentos**:
    -   PDF: `@react-pdf/renderer`
    -   Word: `docx`
    -   Excel: `exceljs`
-   **Validaciones**: Zod

## ✨ Características y Módulos

### 🛡️ Autenticación y Perfil
-   Inicio de sesión seguro.
-   Recuperación de contraseña vía correo electrónico (SMTP).
-   Gestión de perfil de usuario (foto, contraseña).

### 📊 Dashboard
-   Vista general con estadísticas en tiempo real.
-   Gráficos de distribución de casos y métricas clave.

### ⚖️ Gestión de Casos
-   Creación y seguimiento detallado de casos legales.
-   Asignación de estatus (Abierto, En Proceso, Cerrado, etc.).
-   Registro de **Acciones** y actuaciones dentro del caso.
-   Gestión de **Beneficiarios** y **Soportes** (documentos).

### 👥 Gestión de Solicitantes
-   Registro detallado de solicitantes.
-   Información socioeconómica (Vivienda, Familia, Ingresos).
-   Historial de solicitudes.

### 📅 Citas y Consultas
-   Programación de citas para solicitantes y casos.
-   Vista de calendario y lista.
-   Recordatorios automáticos (vía script).

### 🎓 Gestión Académica
-   **Usuarios**: Administra Coordinadores, Profesores y Estudiantes.
-   **Equipos**: Asignación de estudiantes a profesores supervisores.
-   **Estudiantes**: Seguimiento académico dentro de la clínica.

### 📑 Reportes y Auditoría
-   **Reportes**: Generación de informes en PDF, Word y Excel (Estadísticos, Resumen de casos, etc.).
-   **Auditoría**: Registro inmutable de acciones críticas (Creación, Edición, Eliminación) accesible para coordinadores.

### ⚙️ Administración (Catálogos)
Control total sobre los datos maestros del sistema:
-   **Geografía**: Estados, Municipios, Parroquias.
-   **Académico**: Materias, Semestres, Núcleos, Niveles Educativos.
-   **Legal**: Ámbitos legales, Categorías y Subcategorías de casos.
-   **Socioeconómico**: Características de vivienda, condiciones de trabajo, etc.

## 🛠️ Instalación y Configuración

### 1. Prerrequisitos
-   Node.js 18+ instalado.
-   PostgreSQL instalado y corriendo.

### 2. Clonar el repositorio
```bash
git clone <url-del-repo>
cd Gestion-de-clinicas-juridicas
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
# BASE DE DATOS
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_bd

# AUTENTICACIÓN
JWT_SECRET=tu-secreto-super-seguro
JWT_EXPIRES_IN=30d

# CORREO (Para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-aplicacion
SMTP_FROM=tu-email@gmail.com

# OTROS
NODE_ENV=development
CITA_REMINDER_DAYS_AHEAD=1
NOTIFICATIONS_TTL_DAYS=30
```

### 5. Configurar la Base de Datos
Debes ejecutar los scripts SQL para crear la estructura de tablas y cargar los datos iniciales.
Los archivos se encuentran en la carpeta `database/`.

1.  Ejecuta `database/schemas/schema.sql` (o `schema_no_audit.sql` si prefieres sin triggers de auditoría iniciales).
2.  Ejecuta los seeds en `database/seeds/` para poblar catálogos (Estados, Municipios, Materias, etc.).

### 6. Ejecutar el proyecto
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

## 🤖 Scripts de Mantenimiento

El proyecto incluye scripts útiles para el mantenimiento del sistema:

-   **Limpiar notificaciones antiguas**:
    ```bash
    npm run cleanup:notificaciones
    ```
    Elimina notificaciones leídas/viejas según el TTL configurado.

-   **Enviar recordatorios de citas**:
    ```bash
    npm run reminders:citas
    ```
    Envía correos a los usuarios con citas programadas para el día siguiente (o según configuración).

## 📄 Estructura del Proyecto

-   `/app`: Rutas y lógica de Next.js (Pages, Layouts, APIs).
    -   `/actions`: Server Actions para lógica de negocio backend.
    -   `/dashboard`: Vistas protegidas del sistema.
-   `/components`: Componentes React reutilizables (UI, Formularios, Tablas).
-   `/database`: Scripts SQL (Schemas, Queries, Migrations, Seeds).
-   `/lib`: Utilidades, configuración de DB, servicios y tipos.
-   `/public`: Assets estáticos (imágenes, fuentes).
-   `/scripts`: Scripts de ejecución manual (Node.js).
