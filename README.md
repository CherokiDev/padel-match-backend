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

## Ejecución en modo desarrollo

```bash
# Iniciar el servidor
doppler run -- npm run dev
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
PORT=your-port

POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
POSTGRES_DB=your-database-name
POSTGRES_HOST=your-host-ip
POSTGRES_PORT=your-port

# JWT
JWT_PRIVATE_KEY=your-jwt-secret
```

## API

### Crear un Jugador

- **URL**: `http://localhost:3000/players`
- **Método**: `POST`
- **Descripción**: Crea un nuevo jugador.
- **Estructura JSON requerida**:
  ```json
  {
    "name": "name",
    "email": "email",
    "password": "password",
    "phone": "phone",
    "username": "username"
  }
  ```

### Iniciar sesión

- **URL**: `http://localhost:3000/players/login`
- **Método**: `POST`
- **Descripción**: Inicia sesión en la aplicación.
- **Estructura JSON requerida**:
  ```json
  {
    "identifier": "email",
    "password": "password"
  }
  ```
- **Respuesta**:

  ```json
  {
    "id": 1,
    "email": "email",
    "token": "token",
    "role": "role"
  }
  ```

  > **Nota**: El identificador puede ser el email o el nombre de usuario.

### Obtener perfil de jugador

- **URL**: `http://localhost:3000/players/profile`
- **Método**: `GET`
- **Descripción**: Obtiene el perfil del jugador.
- **Cabecera**: `Authorization token`
- **Respuesta**:

  ```json
  {
    "dataValues": {
      "id": 1,
      "email": "email",
      "name": "name",
      "phone": "phone",
      "username": "username",
      "isActive": "boolean",
      "role": "role",
      "resetPasswordToken": null,
      "resetPasswordExpires": null,
      "createdAt": "date",
      "updatedAt": "date",
      "schedules": []
    }
  }
  ```

  > **Nota**: El array de schedules contendrá los horarios asignados al jugador.

### Asignar horario a jugador

- **URL**: `http://localhost:3000/players/:id/schedules`
- **Método**: `POST`
- **Descripción**: Asigna un horario a un jugador.
- **Cabecera** : `Authorization token`
- **Estructura JSON requerida**:
  ```json
  {
    "scheduleId": 1,
    "payer": "boolean"
  }
  ```
