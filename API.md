# Documentación de la API - Gestión de Clínicas Jurídicas

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Formato de Respuestas](#formato-de-respuestas)
4. [Códigos de Estado HTTP](#códigos-de-estado-http)
5. [Endpoints](#endpoints)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Manejo de Errores](#manejo-de-errores)

---

## 🎯 Introducción

Esta API REST proporciona acceso a los recursos del sistema de gestión de clínicas jurídicas. Todos los endpoints retornan respuestas en formato JSON.

**Base URL**: `http://localhost:3000/api` (desarrollo)

---

## 🔐 Autenticación

### Método

La autenticación se realiza mediante **JWT tokens** (a implementar) enviados en el header `Authorization`.

### Header Requerido

```
Authorization: Bearer <token>
```

### Ejemplo

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/casos
```

---

## 📤 Formato de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    // Datos del recurso
  }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE",
    "fields": {  // Solo en errores de validación
      "campo": ["error1", "error2"]
    }
  }
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Request exitoso |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o mal formados |
| 401 | Unauthorized | No autenticado o token inválido |
| 403 | Forbidden | Sin permisos para la acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto con el estado actual |
| 500 | Internal Server Error | Error interno del servidor |

---

## 🛣 Endpoints

### Estructura General

```
GET    /api/[recurso]           # Listar todos
POST   /api/[recurso]           # Crear nuevo
GET    /api/[recurso]/[id]      # Obtener por ID
PUT    /api/[recurso]/[id]      # Actualizar
DELETE /api/[recurso]/[id]      # Eliminar
GET    /api/[recurso]/search    # Buscar
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Obtener Todos los Casos

**Request**:
```http
GET /api/casos
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_caso": 1,
      "fecha_inicio_caso": "2024-01-15",
      "tramite": "Asesoría",
      "estatus": "En proceso",
      "cedula_cliente": "12345678",
      "nombres_cliente": "Juan",
      "apellidos_cliente": "Pérez"
    }
  ]
}
```

### Ejemplo 2: Crear un Caso

**Request**:
```http
POST /api/casos
Content-Type: application/json
Authorization: Bearer <token>

{
  "tramite": "Asesoría",
  "estatus": "En proceso",
  "observaciones": "Caso de familia",
  "cedula_cliente": "12345678"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id_caso": 1,
    "fecha_inicio_caso": "2024-12-01",
    "tramite": "Asesoría",
    "estatus": "En proceso",
    "observaciones": "Caso de familia",
    "cedula_cliente": "12345678"
  }
}
```

### Ejemplo 3: Obtener un Caso por ID

**Request**:
```http
GET /api/casos/1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id_caso": 1,
    "fecha_inicio_caso": "2024-01-15",
    "fecha_fin_caso": null,
    "tramite": "Asesoría",
    "estatus": "En proceso",
    "observaciones": "Caso de familia",
    "id_nucleo": 1,
    "id_ambito_legal": 2,
    "id_expediente": null,
    "cedula_cliente": "12345678"
  }
}
```

### Ejemplo 4: Actualizar un Caso

**Request**:
```http
PUT /api/casos/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "estatus": "Archivado",
  "fecha_fin_caso": "2024-12-01"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id_caso": 1,
    "estatus": "Archivado",
    "fecha_fin_caso": "2024-12-01",
    // ... otros campos
  }
}
```

### Ejemplo 5: Eliminar un Caso

**Request**:
```http
DELETE /api/casos/1
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Caso eliminado exitosamente"
  }
}
```

### Ejemplo 6: Buscar Casos

**Request**:
```http
GET /api/casos/search?q=Juan
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_caso": 1,
      "nombres_cliente": "Juan",
      "apellidos_cliente": "Pérez",
      // ... otros campos
    }
  ]
}
```

### Ejemplo 7: Filtrar Casos

**Request**:
```http
GET /api/casos?estatus=En proceso&tramite=Asesoría
```

**Response**:
```json
{
  "success": true,
  "data": [
    // Casos filtrados
  ]
}
```

---

## ⚠️ Manejo de Errores

### Error de Validación (400)

**Request**:
```http
POST /api/casos
Content-Type: application/json

{
  "tramite": "Trámite Inválido",
  "cedula_cliente": ""
}
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Error de validación",
    "code": "VALIDATION_ERROR",
    "fields": {
      "tramite": ["Valor inválido. Debe ser uno de: Asesoría, Conciliación y Mediación..."],
      "cedula_cliente": ["Cédula requerida"]
    }
  }
}
```

### Error de Autenticación (401)

**Request**:
```http
POST /api/casos
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Token de autenticación requerido",
    "code": "UNAUTHORIZED"
  }
}
```

### Error de Recurso No Encontrado (404)

**Request**:
```http
GET /api/casos/999
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Caso con ID 999 no encontrado",
    "code": "NOT_FOUND"
  }
}
```

### Error de Permisos (403)

**Request**:
```http
DELETE /api/casos/1
Authorization: Bearer <token_estudiante>
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "No tienes permisos para esta acción",
    "code": "FORBIDDEN"
  }
}
```

---

## 🔧 Uso con cURL

### Obtener todos los casos

```bash
curl http://localhost:3000/api/casos
```

### Crear un caso

```bash
curl -X POST http://localhost:3000/api/casos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tramite": "Asesoría",
    "estatus": "En proceso",
    "cedula_cliente": "12345678"
  }'
```

### Actualizar un caso

```bash
curl -X PUT http://localhost:3000/api/casos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "estatus": "Archivado"
  }'
```

### Eliminar un caso

```bash
curl -X DELETE http://localhost:3000/api/casos/1 \
  -H "Authorization: Bearer <token>"
```

---

## 📚 Notas Adicionales

### Paginación

Para endpoints que retornan listas grandes, se implementará paginación:

```
GET /api/casos?page=1&limit=20
```

### Ordenamiento

Algunos endpoints soportan ordenamiento:

```
GET /api/casos?sortBy=fecha_inicio_caso&sortOrder=desc
```

### Filtros

Los filtros se pasan como query parameters:

```
GET /api/casos?estatus=En proceso&id_nucleo=1
```

---

## 🚀 Próximos Pasos

1. Implementar autenticación JWT
2. Documentar todos los endpoints disponibles
3. Agregar ejemplos de uso para cada recurso
4. Implementar paginación y filtros avanzados
5. Agregar documentación OpenAPI/Swagger

---

**Última actualización**: Diciembre 2024

