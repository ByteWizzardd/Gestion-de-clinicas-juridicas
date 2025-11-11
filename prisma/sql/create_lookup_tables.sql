/*
  Script: create_lookup_tables.sql
  Crea las tablas lookup y agrega filas iniciales (seeds).
  Diseñado para SQL Server (T-SQL). Ejecuta con sqlcmd o desde SSMS.
*/

-- Tabla Sexo
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sexo]') AND type in (N'U'))
BEGIN
  CREATE TABLE dbo.Sexo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(10) NOT NULL UNIQUE,
    label VARCHAR(50) NOT NULL
  );
END
GO

-- Tabla Nacionalidad
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Nacionalidad]') AND type in (N'U'))
BEGIN
  CREATE TABLE dbo.Nacionalidad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(10) NOT NULL UNIQUE,
    label VARCHAR(50) NOT NULL
  );
END
GO

-- Tabla EstadoCivil
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EstadoCivil]') AND type in (N'U'))
BEGIN
  CREATE TABLE dbo.EstadoCivil (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(30) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL
  );
END
GO

-- Tabla CondicionTrabajo
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CondicionTrabajo]') AND type in (N'U'))
BEGIN
  CREATE TABLE dbo.CondicionTrabajo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(30) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL
  );
END
GO

-- Tabla CondicionActividad
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CondicionActividad]') AND type in (N'U'))
BEGIN
  CREATE TABLE dbo.CondicionActividad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(30) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL
  );
END
GO

-- Seeds: insertar valores si no existen
-- Sexo
IF NOT EXISTS (SELECT 1 FROM dbo.Sexo WHERE clave = 'M')
  INSERT INTO dbo.Sexo (clave, label) VALUES ('M', 'Masculino');
IF NOT EXISTS (SELECT 1 FROM dbo.Sexo WHERE clave = 'F')
  INSERT INTO dbo.Sexo (clave, label) VALUES ('F', 'Femenino');
GO

-- Nacionalidad
IF NOT EXISTS (SELECT 1 FROM dbo.Nacionalidad WHERE clave = 'V')
  INSERT INTO dbo.Nacionalidad (clave, label) VALUES ('V', 'Venezolano');
IF NOT EXISTS (SELECT 1 FROM dbo.Nacionalidad WHERE clave = 'E')
  INSERT INTO dbo.Nacionalidad (clave, label) VALUES ('E', 'Extranjero');
GO

-- EstadoCivil
IF NOT EXISTS (SELECT 1 FROM dbo.EstadoCivil WHERE clave = 'Soltero')
  INSERT INTO dbo.EstadoCivil (clave, label) VALUES ('Soltero', 'Soltero');
IF NOT EXISTS (SELECT 1 FROM dbo.EstadoCivil WHERE clave = 'Casado')
  INSERT INTO dbo.EstadoCivil (clave, label) VALUES ('Casado', 'Casado');
IF NOT EXISTS (SELECT 1 FROM dbo.EstadoCivil WHERE clave = 'Divorciado')
  INSERT INTO dbo.EstadoCivil (clave, label) VALUES ('Divorciado', 'Divorciado');
IF NOT EXISTS (SELECT 1 FROM dbo.EstadoCivil WHERE clave = 'Viudo')
  INSERT INTO dbo.EstadoCivil (clave, label) VALUES ('Viudo', 'Viudo');
GO

-- CondicionTrabajo
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionTrabajo WHERE clave = 'Patrono')
  INSERT INTO dbo.CondicionTrabajo (clave, label) VALUES ('Patrono', 'Patrono');
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionTrabajo WHERE clave = 'Empleado')
  INSERT INTO dbo.CondicionTrabajo (clave, label) VALUES ('Empleado', 'Empleado');
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionTrabajo WHERE clave = 'Obrero')
  INSERT INTO dbo.CondicionTrabajo (clave, label) VALUES ('Obrero', 'Obrero');
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionTrabajo WHERE clave = 'Cuenta_propia')
  INSERT INTO dbo.CondicionTrabajo (clave, label) VALUES ('Cuenta_propia', 'Cuenta propia');
GO

-- CondicionActividad
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionActividad WHERE clave = 'Ama_de_Casa')
  INSERT INTO dbo.CondicionActividad (clave, label) VALUES ('Ama_de_Casa', 'Ama de Casa');
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionActividad WHERE clave = 'Estudiante')
  INSERT INTO dbo.CondicionActividad (clave, label) VALUES ('Estudiante', 'Estudiante');
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionActividad WHERE clave = 'Pensionado_Jubilado')
  INSERT INTO dbo.CondicionActividad (clave, label) VALUES ('Pensionado_Jubilado', 'Pensionado / Jubilado');
IF NOT EXISTS (SELECT 1 FROM dbo.CondicionActividad WHERE clave = 'Otra')
  INSERT INTO dbo.CondicionActividad (clave, label) VALUES ('Otra', 'Otra');
GO
