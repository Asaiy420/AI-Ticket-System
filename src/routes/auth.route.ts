import {Router} from "express";
import {SignUp, Login, Logout} from "../controllers/auth.controller.js";

const router = Router();


router.post("/signUp", SignUp)
router.post("/login", Login)
router.post("/logout", Logout)

export default router;