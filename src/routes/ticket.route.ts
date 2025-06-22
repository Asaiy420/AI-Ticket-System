import {Router} from "express";
import {createTicket, getAllTickets, getTicketById} from "../controllers/ticket.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getAllTickets);
router.get("/:id", authenticate, getTicketById);
router.post("/create",authenticate,createTicket);


export default router;