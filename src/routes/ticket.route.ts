import {Router} from "express";
import {createTicket, getAllTickets} from "../controllers/ticket.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/all", authenticate, getAllTickets);
router.post("/create",authenticate,createTicket);


export default router;