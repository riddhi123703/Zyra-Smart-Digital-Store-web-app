/**
 * Seed Admin User
 * Run with:  npx ts-node src/scripts/seedAdmin.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User";

const ADMIN = {
  name: "Admin",
  email: "admin@zyra.com",
  password: "Admin@1234",
  role: "admin" as const,
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN.email });

    if (existing) {
      // Promote to admin if not already
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        console.log(`Promoted ${ADMIN.email} to admin`);
      } else {
        console.log(`${ADMIN.email} is already an admin — nothing to do`);
      }
    } else {
      await User.create(ADMIN);
      console.log(`Admin user created: ${ADMIN.email} / ${ADMIN.password}`);
    }
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
