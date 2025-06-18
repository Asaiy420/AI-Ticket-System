import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { inngest } from "../inngest/client";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const SignUp = async (req: Request, res: Response): Promise<void> => {
  const { email, password, skills = [] } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ message: "Both email and password are required" });
      return;
    }

    // check if email already exists

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      skills,
    });

    // fire inngest events

    await inngest.send({
      name: "user/signUp",
      data: {
        email,
      },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "SignUp Successful!",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        skills: user.skills,
      },
    });
  } catch (error) {
    console.error("Error in SignUp controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ messaeg: "Both email and password are required" });
      return;
    }
    // check if email exists

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found please sign up first" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({ error: "Invalid Credentials" });
      return;
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login Successful!",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        skills: user.skills,
      },
    });
  } catch (error) {
    console.log("Error in Login controller:", error);
    res.status(200).json({ error: "Invalid Credentials" });
  }
};

export const Logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      res.json({ message: "Logout successful" });
    });
  } catch (error) {}
};
