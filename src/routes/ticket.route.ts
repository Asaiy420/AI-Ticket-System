import {Router} from "express";
import {createTicket} from "../controllers/ticket.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();


router.post("/create",authenticate,createTicket);


export default router;