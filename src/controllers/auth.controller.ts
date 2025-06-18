import {Request, Response} from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { inngest } from "../inngest/client";
import jwt from "jsonwebtoken";

export const SignUp = async (req:Request, res:Response):Promise<void> => {
    const {email, password, skills = []} = req.body;

   try {
     if (!email || !password){
         res.status(400).json({message: "Both email and password are required"});
         return;
     }
 
     // check if email already exists
 
     const existingUser = await User.findOne({email});
 
     if (existingUser){
         res.status(400).json({message: "Email already exists"});
         return;
     }

     const hashedPassword = await bcrypt.hash(password, 10);

     const user = await User.create({
        email,
        password: hashedPassword,
        skills,
     })

     // fire inngest events

     await inngest.send({
        name: "user/signUp",
        data: {
            email,
        }
     })

     



   } catch (error) {
    
   }

}

export const Login = async (req:Request, res:Response):Promise<void> => {
    res.send("Login");
}

export const Logout = async (req:Request, res:Response):Promise<void> => {
    res.send("Logout");
}

