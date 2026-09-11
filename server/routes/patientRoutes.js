import express from 'express';
import { getPatientDashboard, createPatient, getAllPatients } from '../controllers/patientController.js';

const router = express.Router();

router.get('/', getAllPatients);
router.get('/:patientId/dashboard', getPatientDashboard);
router.post('/register', createPatient);

export default router;
