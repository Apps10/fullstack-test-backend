# 🧠 Prueba Técnica - Backend

Este proyecto corresponde al **backend** de una **prueba técnica** desarrollada con **NestJS**, aplicando **arquitectura hexagonal (ports & adapters)** y el paradigma **ROP (Railway Oriented Programming)**.  
El sistema utiliza **PostgreSQL** como base de datos (corriendo en Docker) y no implementa autenticación, ya que los clientes se crean automáticamente al momento de generar una tarjeta de crédito.

---

## 🚀 Tecnologías principales

- **NestJS** – Framework principal del backend.
- **Prisma ORM** – Mapeo y acceso a base de datos.
- **PostgreSQL** – Base de datos relacional.
- **Docker** – Contenedor para la base de datos.
- **Jest** – Pruebas unitarias.
- **Result Object Pattern (ROP)** – Manejo explícito de errores y resultados.
- **Arquitectura Hexagonal (Ports & Adapters)** – Separación de capas y responsabilidades.

---

## 🧩 Estructura del proyecto

```
src/
│
├── modules/
│   ├── credit-card/
│   ├── transaction/
│   └── customers/
│   └── inventory/
│   └── order/
│   └── transaction/
│
├── shared/
│   ├── dependency-injection/
│   ├── models/
│   └── utils/
│ 
└── main.ts
```

Cada módulo sigue una estructura basada en **dominio**, **infraestructura**, y **aplicación (use cases)** para mantener el desacoplamiento.

---

## 🐳 Configuración con Docker

El proyecto incluye un `docker-compose.yml` con PostgreSQL y Adminer.

```yaml
services:
  db:
    image: postgres:16.2
    restart: always
    ports:
      - 5432:5432
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=123456
      - POSTGRES_DB=mydb

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080
```

### Levantar la base de datos:
```bash
docker compose up -d
```

### Acceder a Adminer:
- URL: [http://localhost:8080](http://localhost:8080)
- Server: `db`
- User: `postgres`
- Password: `123456`
- Database: `mydb`

---

## ⚙️ Instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone git@github.com:Apps10/fullstack-test-backend.git
cd backend
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar las variables de entorno
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/mydb"
```

### 4️⃣ Generar el cliente de Prisma
```bash
npx prisma generate
```

### 5️⃣ Ejecutar las migraciones y cargar datos iniciales
```bash
npm run docker:start
```

Esto ejecutará:
- `prisma migrate dev`
- `npm run seed`
- `npm run start`

---

## 🧪 Pruebas unitarias

El proyecto incluye algunos tests unitarios con **Jest**.

Ejecutar las pruebas:
```bash
npm run test
```

Ver cobertura:
```bash
npm run test:cov
```

---

## 🧱 Principales características

- Arquitectura **hexagonal**, separando dominio, aplicación e infraestructura.
- Uso del **Railway Oriented Programming** para un flujo de errores más explícito y seguro.
- Integración con **PostgreSQL** mediante **Prisma ORM**.
- **Creación automática de clientes** al generar tarjetas de crédito.
- Pruebas unitarias básicas para casos de uso críticos.

---

## 📁 Scripts útiles

| Comando | Descripción |
|----------|--------------|
| `npm run start:dev` | Inicia el servidor en modo desarrollo |
| `npm run seed` | Ejecuta el script de seed de datos |
| `npm run docker:start` | Corre migraciones, seed y levanta el servidor |
| `npm run test` | Ejecuta los tests unitarios |
| `npm run test:cov` | Genera reporte de cobertura de tests |
| `npm run format` | Formatea el código con Prettier |
| `npm run lint` | Corrige problemas de estilo con ESLint |

---

## 🧠 Autor

Desarrollado por **Alfonso Contreras**  
Backend Developer – Prueba Técnica 2025  
