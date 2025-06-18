import {Router} from "express";
import {SignUp, Login, Logout, updateUser, getUsers} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();


router.get("/user",authenticate,getUsers)
router.post("/signUp", SignUp)
router.post("/login", Login)
router.post("/logout", Logout)
router.put("/update-user", authenticate, updateUser);

export default router;      