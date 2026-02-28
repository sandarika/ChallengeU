import { Router } from 'express';
import WorkoutsController from '../controllers/workouts.controller';

const router = Router();

// Public endpoints - no auth required
router.options('/', (req, res) => res.sendStatus(200)); // Handle CORS preflight
router.post('/', (req, res) => WorkoutsController.createWorkout(req, res));
router.get('/', (req, res) => WorkoutsController.getAllWorkouts(req, res));
router.get('/:id', (req, res) => WorkoutsController.getWorkoutById(req, res));
router.post('/:id/celebrate', (req, res) => WorkoutsController.celebrateWorkout(req, res));
router.post('/:id/uncelebrate', (req, res) => WorkoutsController.uncelebrateWorkout(req, res));

export default router;
