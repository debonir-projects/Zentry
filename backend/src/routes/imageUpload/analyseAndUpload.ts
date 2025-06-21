import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import prisma from "../../db/db"; // Fixed path to Prisma client
import imageModels from "../../db/mongodb/image.models";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios"; // Added for fetching image data

dotenv.config();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadMiddleware = multer({ storage }).single("image");

// Add this interface at the top of your file, after the imports
interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
    [key: string]: any; // For any other properties that might be in the auth object
  };
  file?: multer.File;
}

// Upload & Analyze Controller
export async function uploadCloudinaryAndAnalyze(req: AuthenticatedRequest, res: Response): Promise<any> {
  const { userId } = req.auth;

  try {
    if (!process.env.API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    // Validate user in Prisma (PostgreSQL)
    const userExists = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!userExists) return res.status(404).json({ error: "User not found in NeonDB" });

    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Upload to Cloudinary
    const cloudResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "Zentry" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      fs.createReadStream(file.path).pipe(stream);
    });

    fs.unlinkSync(file.path); // Clean up local file

    // FIXED: Fetch image data from Cloudinary URL instead of trying to read it as a local file
    const imageResponse = await axios.get(cloudResult.secure_url, { responseType: 'arraybuffer' });
    const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
  
    });

    const analysisResult = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: "Describe this image. If it's a receipt, extract items and prices" },
          {
            inlineData: {
              mimeType: file.mimetype, // Use the original file's mimetype
              data: imageBase64,
            },
          },
        ],
      }],
    });

    const aiText = (await analysisResult.response).text();
    const amountMatch = aiText.match(/(?:Total|Amount):?\s?\₹?(\d+(\.\d+)?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    // Store in Prisma: Transaction + Memory
    const transaction = await prisma.transaction.create({
      data: {
        text: "AI Analyzed Transaction",
        amount,
        userId: userExists.clerkUserId,
        memories: {
          create: {
            title: "AI Memory",
            description: aiText,
            imageUrl: cloudResult.secure_url,
            userId: userExists.clerkUserId,
          },
        },
      },
      select: {
        id: true,
        text: true,
        amount: true,
        userId: true,
        createdAt: true,
        memories: true,
      },
    });

    // Store in MongoDB
    const imageDoc = new imageModels({
      _id: cloudResult.public_id,
      userId: userExists.id,
      cloudinaryUrl: cloudResult.secure_url,
      clerkUserId: userExists.clerkUserId,
      publicId: cloudResult.public_id,
    });
    await imageDoc.save();

    // Response
    res.status(200).json({
      message: "Upload, analysis, and DB entry successful!",
      transaction,
      memory: transaction.memories[0], // Now this will work with the include
      mongoImage: imageDoc,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error", details: (error as Error).message });
  }
}