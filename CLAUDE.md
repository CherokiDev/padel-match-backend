# Padel Match Backend — Guía para Claude

## Qué es este proyecto

API REST + WebSocket para una app de reservas de pádel. Los jugadores se registran, reservan huecos en pistas (schedules), y pueden chatear en tiempo real con los compañeros que comparten ese horario.

## Stack tecnológico

- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Framework**: Express 4
- **BD**: PostgreSQL + Sequelize 6 ORM
- **Auth**: JWT — se firma con `jsonwebtoken` y se verifica con `jose` (¡inconsistencia existente, no romper!)
- **Real-time**: Socket.IO 4
- **Email**: Nodemailer (Gmail)
- **Cron**: node-cron (gestión automática de horarios)
- **Logging**: Winston
- **Process manager (prod)**: systemd (`/etc/systemd/system/padelero-backend.service`, lanza `node src/index.js` directamente)
- **Secrets (prod)**: archivo `.env` en la VPS (no Doppler en producción)
- **Secrets (dev local)**: Doppler o `.env` local

## Arrancar en desarrollo

```bash
npm run dev          # nodemon src/index.js
```

Si el puerto 3000 está ocupado por un proceso zombie:
```bash
kill $(lsof -ti :3000)
```

## Proyectos relacionados

- **Backend**: `/home/cherokidev/Documents/projects/padel-match-backend`
- **Frontend**: `/home/cherokidev/Documents/projects/padel-match-front-copilot`

## Arquitectura y estructura

```
src/
  app.js              # Express + CORS + rutas REST
  index.js            # Punto de entrada: DB auth, HTTP server, Socket.IO, listen
  socket.js           # Lógica completa de Socket.IO (rooms, eventos, persistencia)
  config/db.js
  models/
    Player.js
    Schedule.js
    PlayerSchedules.js  # Pivot, campo payer (boolean)
    Message.js          # senderId, receiverId, scheduleId, content, isRead, readAt
    associations.js     # Todas las relaciones aquí, no en los modelos
  controllers/
    players/
      auth.controller.js
      profile.controller.js
      schedule.controller.js
      email.controller.js
      index.js
    players.controller.js     # re-exporta players/index.js
    schedule.controller.js    # CRUD schedules + cron 2:00 AM
  middleware/
    tokenValidationMiddleware.js  # JWT REST (jose)
    roleValidationMiddleware.js
    socketAuth.js                 # JWT Socket.IO (jsonwebtoken)
  routes/
    player.routes.js
    schedule.routes.js
    messages.routes.js
```

## Conceptos de dominio clave

- **Schedule**: franja horaria en una pista. 2 pistas × 7 franjas/día × 7 días rolling. Cron a las 2:00 AM.
- **PlayerSchedules** (pivot): `payer: boolean`. Solo 1 payer por schedule.
- **Chat privacy**: el payer inicia siempre. El no-payer no puede ver ni escribir al payer hasta recibir el primer mensaje de este.
- **getPlayersInSameSchedule**: devuelve TODOS los compañeros incluyendo al propio usuario — el frontend filtra con `player.id !== profileData.id`.

## Endpoints REST completos

### Players
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /players | — | Registro |
| POST | /players/login | — | Login → `{ id, email, token, role }` |
| GET | /players | JWT + admin | Listar jugadores activos |
| GET | /players/profile | JWT | Perfil propio con schedules |
| GET | /verify-token | JWT | Validar token |
| POST | /players/:id/schedules | JWT | Apuntarse (`{ scheduleId, payer }`) |
| DELETE | /players/:id/schedules | JWT | Salir de un horario |
| GET | /players/same-schedule/:id | JWT | Compañeros en horarios compartidos |
| POST | /players/forgot | — | Solicitar reset |
| POST | /players/reset/:token | — | Resetear contraseña |
| POST | /send-registration-details-email | — | Reenviar email bienvenida |

### Schedules
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /schedules | Todos los horarios |
| GET | /schedulesAvailables | Sin payer |
| POST | /schedules | Generar semana inicial |

### Mensajes
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /messages/with/:userId | JWT | Historial (`?scheduleId=X`) |
| GET | /messages/conversations | JWT | Lista de conversaciones con preview y no leídos |
| GET | /messages/admitted-schedules | JWT | scheduleIds donde el payer ya contactó al usuario |

## Eventos Socket.IO

Auth: `socket.handshake.auth.token` (JWT). Room: `user:{id}`.

| Evento (cliente→servidor) | Payload |
|--------------------------|---------|
| `message:send` | `{ toUserId, content, scheduleId }` |
| `message:markRead` | `{ fromUserId }` |

| Evento (servidor→cliente) | Payload |
|--------------------------|---------|
| `message:new` | objeto Message |

## Frontend — estructura relevante

```
src/
  components/
    MatchList.jsx       # Reservas actuales + modal de jugadores (bottom-sheet)
    ChatList.jsx        # Lista de conversaciones con real-time updates
    ChatModal.jsx       # Modal de chat (burbujas, bottom-sheet, autoscroll)
    ChatModal.css       # Estilos del chat
    Profile.jsx         # Perfil: avatar con iniciales, card con iconos MUI por campo, sin funcionalidad de edición aún
    Profile.css         # Estilos del perfil
    BottomNavBar.jsx    # Nav: Inicio / Partidos / Chats (badge) / Perfil
  services/
    socket.js           # connectSocket() con auth JWT
  App.jsx               # Rutas: /home /matchlist /chats /profile /schedules
  App.css               # Estilos globales (un solo azul: #007bff)
```

## Bugs conocidos en backend (no tocar sin consultar)

1. **`deleteSchedule`** usa `res.body` en lugar de `req.body` — `schedule.controller.js:105`. Endpoint no expuesto en rutas activas.
2. **`deletePlayer`** referencia `PlayerSchedules` sin importarlo — `profile.controller.js:98`. Tampoco expuesto.
3. **Inconsistencia JWT**: firma con `jsonwebtoken`, verifica REST con `jose`, verifica socket con `jsonwebtoken`. Funciona pero es inconsistente.

## Despliegue en producción (VPS)

- **Script de deploy**: `~/proyectos/padelero/update-backend-systemd.sh` — hace `git pull` + `npm install` + `sudo systemctl restart padelero-backend`
- **Process manager**: systemd (NO PM2 — el proceso `padelero-backend` en `pm2 list` es un residuo de una versión anterior, se puede ignorar)
- **Ver estado**: `sudo systemctl status padelero-backend`
- **Ver logs**: `sudo journalctl -u padelero-backend -f`

## Estado actual

La feature `realtime-chat` está **completa, commiteada y desplegada en producción** (2026-06-01).
- Commits en ramas `develop` y `master` (backend) y `main` (frontend)
- Verificado y funcionando en producción

## Reglas de trabajo con Claude

- **Antes de modificar un archivo existente**: consultarlo con el usuario.
- **Crear archivos nuevos** (docs, componentes, utils): se puede hacer directamente.
