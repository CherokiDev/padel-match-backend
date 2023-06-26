import { Router } from 'express';
import { getPlayers, getPlayersWithSchedules, getPlayerById, createPlayer, loginPlayer, assignSchedule, deletePlayer } from '../controllers/players.controller.js';
import authTokenRouter from '../middleware/auth.js';

const router = Router();

router.get('/players', getPlayers)
router.get('/players/schedules', getPlayersWithSchedules)
router.get('/player/:id', getPlayerById)
router.post('/players', createPlayer)
router.post('/login', authTokenRouter)
router.get('/profile', authTokenRouter)
router.post('/player/:id/schedules', assignSchedule)
router.put('/player/:id', deletePlayer)

export default router;
