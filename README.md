# Padel Match App — Backend

API REST + WebSocket para una app de reservas de pádel con chat en tiempo real entre jugadores.

## Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 4
- **Base de datos**: PostgreSQL + Sequelize 6
- **Auth**: JWT (`jsonwebtoken` para firmar, `jose` para verificar en REST)
- **Real-time**: Socket.IO 4
- **Email**: Nodemailer (Gmail)
- **Cron**: node-cron (mantenimiento diario de horarios)
- **Logging**: Winston
- **Process manager (prod)**: PM2 (`ecosystem.config.cjs`)
- **Secrets (prod)**: Doppler

## Arrancar en desarrollo

```bash
npm run dev
# o con doppler:
doppler run -- npm run dev
```

## Variables de entorno

```
PORT
POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB / POSTGRES_HOST / POSTGRES_PORT / POSTGRES_SCHEMA
JWT_PRIVATE_KEY
FRONTEND_HOST / FRONTEND_HOST_WWW / FRONTEND_HOST_PROD
EMAIL_USER / EMAIL_PASS
NODE_ENV
```

## Estructura del proyecto

```
src/
  app.js              # Express + CORS + rutas REST
  index.js            # Arranque: DB, HTTP server, Socket.IO, listen
  socket.js           # Lógica completa de Socket.IO
  config/
    db.js
  models/
    Player.js
    Schedule.js
    PlayerSchedules.js  # Pivot player↔schedule, campo payer (boolean)
    Message.js          # Chat: senderId, receiverId, scheduleId, isRead
    associations.js     # Todas las relaciones Sequelize
  controllers/
    players/
      auth.controller.js      # login, registro
      profile.controller.js   # getProfile, getPlayers
      schedule.controller.js  # assignSchedule, removeSchedule, getPlayersInSameSchedule
      email.controller.js     # forgotPassword, resetPassword, sendRegistrationDetailsEmail
      index.js
    players.controller.js     # re-exporta players/index.js
    schedule.controller.js    # CRUD schedules + cron diario a las 2:00 AM
  middleware/
    tokenValidationMiddleware.js  # JWT auth REST (jose)
    roleValidationMiddleware.js   # Comprueba rol ("admin")
    socketAuth.js                 # JWT auth Socket.IO (jsonwebtoken)
  routes/
    player.routes.js
    schedule.routes.js
    messages.routes.js
  utils/
    constants.js / emailUtils.js / logger.js
```

## API REST

### Jugadores

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /players | — | Registro |
| POST | /players/login | — | Login → `{ id, email, token, role }` |
| GET | /players | JWT + admin | Listar jugadores activos |
| GET | /players/profile | JWT | Perfil propio con schedules |
| GET | /verify-token | JWT | Validar token |
| POST | /players/:id/schedules | JWT | Apuntarse a un horario (`{ scheduleId, payer }`) |
| DELETE | /players/:id/schedules | JWT | Salir de un horario |
| GET | /players/same-schedule/:id | JWT | Compañeros en horarios compartidos |
| POST | /players/forgot | — | Solicitar reset de contraseña |
| POST | /players/reset/:token | — | Resetear contraseña |
| POST | /send-registration-details-email | — | Reenviar email de bienvenida |

### Horarios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /schedules | — | Todos los horarios |
| GET | /schedulesAvailables | — | Horarios sin payer |
| POST | /schedules | — | Generar semana inicial (solo si BD está vacía) |

### Mensajes / Chat

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /messages/with/:userId | JWT | Historial de chat con un usuario (`?scheduleId=X`) |
| GET | /messages/conversations | JWT | Lista de conversaciones activas con último mensaje y no leídos |
| GET | /messages/admitted-schedules | JWT | scheduleIds donde el payer ya ha contactado al usuario |

## WebSocket (Socket.IO)

Auth: enviar JWT en `socket.handshake.auth.token`.  
Cada usuario se une a la room `user:{id}` al conectarse.

| Evento cliente→servidor | Payload | Descripción |
|------------------------|---------|-------------|
| `message:send` | `{ toUserId, content, scheduleId }` | Enviar mensaje |
| `message:markRead` | `{ fromUserId }` | Marcar mensajes como leídos |

| Evento servidor→cliente | Payload | Descripción |
|------------------------|---------|-------------|
| `message:new` | objeto Message | Nuevo mensaje (se emite al sender y receiver) |

## Dominio clave

- **Schedule**: franja horaria en una pista (2 pistas × 7 franjas/día). Ventana rolling de 7 días; el cron de las 2:00 AM elimina el día anterior y añade el día +7.
- **PlayerSchedules** (pivot): `payer: boolean` indica quién paga la pista. Solo puede haber un payer por schedule.
- **Chat privacy**: el payer inicia la conversación. El no-payer no puede ver ni contactar al payer hasta que este le haya enviado al menos un mensaje.
- **getPlayersInSameSchedule**: devuelve TODOS los compañeros del usuario en cualquiera de sus horarios, incluyendo al propio usuario (el frontend filtra).
