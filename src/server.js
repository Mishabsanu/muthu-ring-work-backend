import http from "http";
import app from "./app.js";
import { connectDB } from "./db/mongoose.js";
import { config } from "./config/index.js";
import Admin from "./models/Admin.js";

const server = http.createServer(app);

server.timeout = 300000;

const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "admin@gmail.com" });
    if (!adminExists) {
      await Admin.create({
        email: "admin@gmail.com",
        password: "Admin@123"
      });
    }
  } catch (error) {
    console.error("Error seeding default admin:", error);
  }
};

const startServer = async () => {
  await connectDB();
  await seedAdmin(); // Seed initial user automatically
  server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
};

startServer();
