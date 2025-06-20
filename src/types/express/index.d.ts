import { Jwt, JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: (JwtPayload & { _id: string; role: string }) | string;
    }
  }
}
