import { requireAuthentication } from '../middleware/patientAccess.js';
import express from 'express';
import { getPatientDashboard, createPatient, getAllPatients } from '../controllers/patientController.js';

const router = express.Router();
router.use(requireAuthentication);

router.get('/', getAllPatients);
router.get('/:patientId/dashboard', getPatientDashboard);
router.post('/register', createPatient);

export default router;
