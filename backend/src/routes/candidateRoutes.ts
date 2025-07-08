import { Router } from 'express';
import { addCandidateController } from '../presentation/controllers/candidateController';

const router = Router();

router.post('/', addCandidateController);

export default router;
