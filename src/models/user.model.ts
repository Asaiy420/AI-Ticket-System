import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  email: string;
  password: string;
  role: string;
  skills: string[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "moderator", "admin"],
      skills: [String],
    },

    password: {
      type: String,
      required: true,
      minLength: 6,
    },

    skills: [String],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
