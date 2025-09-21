# 📊 Documentación de Base de Datos PostgreSQL

## Introducción

El sistema **CoreAppEduTech** utiliza PostgreSQL como sistema de gestión de base de datos relacional, gestionado a través de Prisma ORM para proporcionar una interfaz type-safe y facilitar las operaciones de base de datos.

## 🏗️ Estructura de la Base de Datos

### Esquema Principal

La base de datos está diseñada con las siguientes entidades principales:

```sql
-- Entidades Principales
- User (Usuarios)
- Student (Estudiantes)
- Teacher (Profesores)
- Parent (Padres)
- Admin (Administradores)
- Class (Clases)
- Subject (Materias)
- Lesson (Lecciones)
- Exam (Exámenes)
- Assignment (Tareas)
- Result (Resultados)
- Attendance (Asistencia)
- Event (Eventos)
- Announcement (Anuncios)
```

### Relaciones Clave

```mermaid
erDiagram
    User ||--o{ Student : "puede ser"
    User ||--o{ Teacher : "puede ser"
    User ||--o{ Parent : "puede ser"
    Student }o--|| Class : "pertenece a"
    Teacher ||--o{ Subject : "enseña"
    Class ||--o{ Student : "contiene"
    Subject ||--o{ Lesson : "tiene"
    Exam }o--|| Subject : "pertenece a"
```

## 🔧 Configuración de PostgreSQL

### Variables de Entorno Requeridas

```env
# Configuración de Base de Datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/edutech_db"

# Para desarrollo local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edutech_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

### Configuración Local

1. **Instalar PostgreSQL**
   ```bash
   # Windows (usando Chocolatey)
   choco install postgresql

   # macOS (usando Homebrew)
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Crear Base de Datos**
   ```sql
   -- Conectar a PostgreSQL
   psql -U postgres

   -- Crear base de datos
   CREATE DATABASE edutech_db;

   -- Crear usuario
   CREATE USER edutech_user WITH PASSWORD 'tu_contraseña';

   -- Otorgar privilegios
   GRANT ALL PRIVILEGES ON DATABASE edutech_db TO edutech_user;
   ```

3. **Configurar Prisma**
   ```bash
   # Generar cliente de Prisma
   npx prisma generate

   # Ejecutar migraciones
   npx prisma migrate dev --name init

   # Sembrar datos de prueba
   npx prisma db seed
   ```

## 📋 Comandos de Prisma Útiles

### Gestión de Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (desarrollo)
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status
```

### Herramientas de Desarrollo

```bash
# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Generar cliente después de cambios en schema
npx prisma generate

# Formatear archivo schema.prisma
npx prisma format

# Validar schema
npx prisma validate
```

## 🗂️ Modelos de Datos Principales

### Usuario Base
```prisma
model User {
  id       String   @id @default(cuid())
  username String   @unique
  email    String   @unique
  password String
  name     String
  surname  String
  phone    String?
  address  String?
  img      String?
  bloodType String?
  sex      UserSex
  birthday DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Estudiante
```prisma
model Student {
  id       String @id @default(cuid())
  username String @unique
  name     String
  surname  String
  email    String? @unique
  phone    String?
  address  String
  img      String?
  bloodType String
  sex      UserSex
  birthday DateTime
  
  // Relaciones
  class    Class @relation(fields: [classId], references: [id])
  classId  Int
  parent   Parent @relation(fields: [parentId], references: [id])
  parentId String
  
  // Registros académicos
  attendances Attendance[]
  results     Result[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Clase
```prisma
model Class {
  id       Int     @id @default(autoincrement())
  name     String  @unique
  capacity Int
  
  // Relaciones
  students Student[]
  lessons  Lesson[]
  events   Event[]
  
  // Supervisor
  supervisor   Teacher @relation(fields: [supervisorId], references: [id])
  supervisorId String
  
  // Grado
  grade   Grade @relation(fields: [gradeId], references: [id])
  gradeId Int
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔍 Consultas Comunes

### Estudiantes por Clase
```sql
SELECT s.name, s.surname, c.name as class_name
FROM Student s
JOIN Class c ON s.classId = c.id
WHERE c.name = 'Clase A';
```

### Asistencia por Estudiante
```sql
SELECT s.name, s.surname, 
       COUNT(a.id) as total_days,
       SUM(CASE WHEN a.present = true THEN 1 ELSE 0 END) as present_days
FROM Student s
LEFT JOIN Attendance a ON s.id = a.studentId
GROUP BY s.id, s.name, s.surname;
```

### Profesores y sus Materias
```sql
SELECT t.name, t.surname, s.name as subject_name
FROM Teacher t
JOIN Subject s ON t.id = s.teacherId
ORDER BY t.surname;
```

## 🛡️ Seguridad y Mejores Prácticas

### Conexiones Seguras
```env
# Usar SSL en producción
DATABASE_URL="postgresql://usuario:contraseña@host:5432/db?sslmode=require"
```

### Respaldos Automáticos
```bash
# Crear respaldo
pg_dump -h localhost -U usuario -d edutech_db > backup_$(date +%Y%m%d).sql

# Restaurar respaldo
psql -h localhost -U usuario -d edutech_db < backup_20240920.sql
```

### Índices para Rendimiento
```sql
-- Índices recomendados
CREATE INDEX idx_student_class ON Student(classId);
CREATE INDEX idx_attendance_student ON Attendance(studentId);
CREATE INDEX idx_result_student ON Result(studentId);
CREATE INDEX idx_lesson_subject ON Lesson(subjectId);
```

## 📊 Monitoreo y Mantenimiento

### Consultas de Rendimiento
```sql
-- Ver consultas más lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Ver tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Limpieza de Datos
```sql
-- Eliminar registros antiguos (ejemplo: asistencias de más de 2 años)
DELETE FROM Attendance 
WHERE date < NOW() - INTERVAL '2 years';

-- Vacuuming para optimizar
VACUUM ANALYZE;
```

## 🚨 Solución de Problemas Comunes

### Error de Conexión
```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Reiniciar servicio
sudo systemctl restart postgresql
```

### Problemas de Migración
```bash
# Marcar migración como aplicada
npx prisma migrate resolve --applied "20240920_nombre_migracion"

# Forzar reset (solo desarrollo)
npx prisma migrate reset --force
```

### Conflictos de Schema
```bash
# Regenerar cliente Prisma
npx prisma generate --force

# Verificar diferencias
npx prisma db pull
npx prisma migrate diff
```

Esta documentación proporciona una base sólida para entender y trabajar con la base de datos PostgreSQL en el proyecto CoreAppEduTech.