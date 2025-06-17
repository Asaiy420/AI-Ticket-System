import {Request, Response} from "express";

export const SignUp = async (req:Request, res:Response):Promise<void> => {
    
}

export const Login = async (req:Request, res:Response):Promise<void> => {
    res.send("Login");
}

export const Logout = async (req:Request, res:Response):Promise<void> => {
    res.send("Logout");
}

