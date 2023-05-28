import { Router } from 'express';
import { getSchedules, createSchedule } from '../controllers/schedule.controller.js';

const router = Router();

router.get('/schedules', getSchedules)
router.post('/schedules', createSchedule)
router.put('/schedule/:id')
router.delete('/schedule/:id')
router.get('/schedule/:id')

export default router;