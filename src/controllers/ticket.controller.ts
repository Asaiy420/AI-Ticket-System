import { inngest } from "../inngest/client";
import Ticket, { ITicket } from "../models/ticket.model";
import { Request, Response } from "express";
import User from "../models/user.model";

export const createTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      res.status(400).json({ message: "Please provide title and description" });
      return;
    }

    if (typeof req.user === "string" || !req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const newTicket: ITicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,
    });

    await inngest.send({
      name: "ticket/create",
      data: {
        ticketId: newTicket.toObject()._id.toString(),
        title: newTicket.title,
        description: newTicket.description,
        createdBy: newTicket.createdBy?.toString(),
      },
    });
    res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
    return;
  } catch (error) {
    console.error("Error when creating ticket", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllTickets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let tickets: ITicket[] = [];

    if (
      req.user &&
      typeof req.user !== "string" &&
      (req.user.role === "admin" || req.user.role === "moderator")
    ) {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else if (req.user && typeof req.user !== "string") {
      tickets = await Ticket.find({ createdBy: req.user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      message: "Tickets fetched successfully",
      tickets,
    });
    return;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTicketById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    let ticket;

    if (req.user && typeof req.user !== "string" && req.user.role !== "user") {
      ticket = await Ticket.findById(id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else if (req.user && typeof req.user !== "string") {
      ticket = await Ticket.findOne({
        createdBy: req.user._id,
        _id: id,
      }).select("title description status createdAt");
    }

    if (!ticket) {
      res.status(404).json({ error: "Cannot find the ticket" });
      return;
    }

    res.status(200).json(ticket);
    return;
  } catch (error) {
    console.error("Error in getTicketById controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
