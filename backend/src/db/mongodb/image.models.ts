import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  _id: String, // publicId
  userId: String,
  cloudinaryUrl: String,
  clerkUserId: String,
  publicId: String,
  uploadedAt: { type: Date, default: Date.now },
  title: String,
  description: String,
});

export default mongoose.model("Image", imageSchema);