import { NonRetriableError } from "inngest";
import User from "../../models/user.model.js";
import { inngest } from "../client.js";
import { sendMail } from "../../utils/mailer";

export const onSignUp = inngest.createFunction(
  { id: "on-user-signUp", retries: 2 },
  { event: "user/signUp" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run<any>("get-user-email", async () => {
        const userObject = await User.findOne({ email });

        if (!userObject) {
          throw new NonRetriableError("User not found");
        }

        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the AI Ticketing System`;
        const message = `Hello ${user.email}, thanks for signing up! We're very excited to have you on board. Please let us know if you have any questions or need any assistance.`;

        await sendMail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("Error in onSignUp function:", error);
      throw error;
    }
  }
);
