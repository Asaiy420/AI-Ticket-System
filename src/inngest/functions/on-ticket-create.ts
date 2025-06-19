import { NonRetriableError } from "inngest";
import Ticket from "../../models/ticket.model.js";
import { inngest } from "../client.js";
import analyzeTicket from "../../utils/ai.js";
import User from "../../models/user.model.js";

export const onTicketCreate = inngest.createFunction(
  { id: "on-ticket-create", retries: 2 },
  { event: "ticket/create" },

  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      const ticket = await step.run<any>("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      await step.run<any>("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "WAITING" });
      });

      const aiResponse = await analyzeTicket(ticket);

      const getSkills = await step.run<any>("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["Low", "Medium", "High"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            realtedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        }
        return skills;
      });

      const moderator = await step.run<any>("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: getSkills.join("|"), // finds the skills that match any of the skills in the array
              $options: "i", // case insensitive
            },
          },
        });

        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id,
        });
        return user;
      });
    } catch (error) {}
  }
);
