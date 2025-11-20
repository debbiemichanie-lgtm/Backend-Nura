import { Router } from 'express';
const router = Router();
router.get('/api', (_req,res)=>res.json({ok:true,status:'up'}));
export default router;
