import {Router} from "express";
import {SignUp, Login, Logout, updateUser} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();


router.post("/signUp", SignUp)
router.post("/login", Login)
router.post("/logout", Logout)
router.put("/update-user", authenticate, updateUser);

export default router;  