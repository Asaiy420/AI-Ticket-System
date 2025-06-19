import mongoose from "mongoose";

interface ITicket extends mongoose.Document {
  title: string;
  description: string;
  status: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  priority: string;
  deadline: Date;
  helpfulNotes: string;
  realtedSkills: string[];
}

const ticketSchema = new mongoose.Schema<ITicket>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "WAITING",
      enum: ["WAITING", "IN_PROGRESS", "COMPLETED"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    priority: String,
    deadline: Date,
    helpfulNotes: String,
    realtedSkills: [String],
  },
  { timestamps: true }
);

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
