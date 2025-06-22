import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/DB.js";
import ticketRoutes from "./routes/ticket.route.js";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { onSignUp } from "./inngest/functions/on-signUp.js";
import { onTicketCreate } from "./inngest/functions/on-ticket-create.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/ticket", ticketRoutes);
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onSignUp, onTicketCreate],
  })
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
