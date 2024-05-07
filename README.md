# Padel Match App Backend

## Descripción

Backend de la aplicación Padel Match App.

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/CherokiDev/padel-match-backend.git

# Navegar al directorio del proyecto
cd padel-match-backend

# Instalar las dependencias
npm install
```

## Uso

```bash
# Iniciar el servidor
npm start
```

## API

### Players

- POST /players/signup
- POST /players/login

## Rutas

## Controladores

- player.controller.js
- schedule.controller.js

## Middlewares

## Modelos

- Player
- PlayerSchedules
- Schedule

## Base de datos

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- Bcrypt

## Variables de entorno

```bash
# Puerto del servidor
PORT=your-port

# Base de datos
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
POSTGRES_DB=your-database-name
POSTGRES_HOST=your-host-ip
POSTGRES_PORT=your-port

# JWT
JWT_PRIVATE_KEY=your-jwt-secret
```

#### PostgreSQL

Para entrar a la consola de PostgreSQL:

```bash
psql -h [your-host-ip] -U [your-username] -d [your-database-name] -W
```

Ver todas las bases de datos:

```bash
\l
```
