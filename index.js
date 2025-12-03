import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const eraPrompts = {
  "1940": "Transform this portrait into a 1940s vintage monochrome photograph with grainy old-film camera texture, soft lighting, and classic attire style.",
  "1980": "Transform this portrait into an 1980s retro neon VHS look with scanlines, analog noise, vibrant neon colors, and nostalgic synthwave atmosphere.",
  "2050": "Transform this portrait into a futuristic 2050 sci-fi style with holographic accents, sleek technology-inspired fashion, and glowing city lights.",
  "3000": "Transform this portrait into an ultra-futuristic year 3000 AI-inspired digital look, with abstract cybernetic patterns and advanced virtual aesthetics.",
  prehistoric:
    "Transform this portrait into a prehistoric cave painting style with earthy pigments, rough rock textures, and simplistic ancient illustration.",
};

app.post("/api/time-travel", upload.single("image"), async (req, res) => {
  try {
      const file = req.file;
      const era = req.body.era;
      
      if (!file) {
          return res.status(400).json({ error: "Image file is required." });
        }
        
        if (!era || !eraPrompts[era]) {
            return res.status(400).json({ error: "Valid era is required." });
        }
        
        const fileBase64 = file.buffer.toString("base64");
        
    const prompt = eraPrompts[era];

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${prompt} Preserve the person's identity and facial structure while applying the style.`,
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
    });

    const imageBase64 = result.data[0].b64_json;
    const dataUrl = `data:image/png;base64,${imageBase64}`;

    res.json({ image: dataUrl });
  } catch (error) {
    console.error("Time-travel API error:", error);
    res.status(500).json({ error: "Something went wrong while transforming the image." });
  }
});

app.listen(port, () => {
  console.log(`Time-Travel Camera server listening on port ${port}`);
});
