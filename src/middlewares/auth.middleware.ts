import  jwt  from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";

export const authenticate = async (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader){
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];


    if (!token){
        res.status(401).json({ error: "Access Denied, No token found" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();

    } catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(500).json({ error: "Internal Server Error" });
        
    }
    

    
}