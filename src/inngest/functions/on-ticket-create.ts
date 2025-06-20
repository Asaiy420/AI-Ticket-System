import { NonRetriableError } from "inngest";
import Ticket from "../../models/ticket.model.js";
import { inngest } from "../client.js";
import analyzeTicket from "../../utils/ai.js";
import User from "../../models/user.model.js";
import { sendMail } from "../../utils/mailer.js";

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
      // pipeline for updating ticket status
      await step.run<any>("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "WAITING" });
      });

      const aiResponse = await analyzeTicket(ticket);

      // pipeline for updating ticket priority and related skills
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

      await step.run<any>("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket?.title}`
          );
        }
      });

      return {success: true}

    } catch (e) {
      console.error("Error when sending notification", e)
      return {success : false};
    }
  }
);
