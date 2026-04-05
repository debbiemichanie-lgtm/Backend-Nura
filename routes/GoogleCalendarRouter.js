import { Router } from "express";
import {
  connectGoogle,
  googleCallback,
} from "../controllers/googleCalendarController.js";

const router = Router();

router.get("/connect/:id", connectGoogle);
router.get("/callback", googleCallback);

export default router;