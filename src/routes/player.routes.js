import { Router } from 'express';
import { getPlayers, createPlayer, assignSchedule } from '../controllers/players.controller.js';

const router = Router();

router.get('/players', getPlayers)
router.post('/players', createPlayer)
router.post('/player/:id/schedules', assignSchedule)
router.put('/player/:id')
router.delete('/player/:id')
router.get('/player/:id')

export default router;