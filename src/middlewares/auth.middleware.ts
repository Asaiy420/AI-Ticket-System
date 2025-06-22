import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access Denied, No token found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // Type guard to ensure decoded is an object with _id and role
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "_id" in decoded &&
      "role" in decoded
    ) {
      req.user = decoded as jwt.JwtPayload & { _id: string; role: string };
      next();
    } else {
      res.status(401).json({ error: "Invalid token structure" });
    }
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
