import { v2 as cloudinary } from "cloudinary";
import { Client, handle_file } from "@gradio/client";
import fs from "fs";

// HuggingFace Space: Kwai-Kolors/Kolors-Virtual-Try-On
const HF_SPACE   = "Kwai-Kolors/Kolors-Virtual-Try-On";
// Optional: HuggingFace token to help avoid rate limits
const HF_TOKEN   = process.env.HF_TOKEN || undefined;

/**
 * Determine the cloth type from the store's `subCategory`.
 * Mapping:
 * - Topwear/Winterwear -> "upper_body"
 * - Bottomwear         -> "lower_body"
 * - Dresses            -> "dresses"
 */
const detectClothType = (subCategory = "") => {
  const sub = subCategory.trim().toLowerCase();
  if (sub === "bottomwear") return "lower_body";
  if (sub === "dresses")    return "dresses";
  return "upper_body"; // Topwear + Winterwear + fallback
};

/**
 * POST /api/tryon
 * multipart/form-data:
 *   personImage     – file   (user's photo)
 *   garmentImageUrl – string (product image URL from Cloudinary)
 *   subCategory     – string (used to detect cloth type)
 *   category        – string (Men | Women | Kids — not used for detection)
 */
const tryOn = async (req, res) => {
  try {
    // 1. Validate input
    if (!req.file) {
      return res.json({ success: false, message: "Please upload your photo." });
    }

    const { garmentImageUrl, category = "", subCategory = "" } = req.body;

    if (!garmentImageUrl) {
      return res.json({ success: false, message: "Garment image URL is required." });
    }

    // 2. Upload the user's photo to Cloudinary to obtain a public URL
    let personImageUrl;
    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "tryon_temp",
        resource_type: "image",
      });
      personImageUrl = uploadResult.secure_url;
    } catch (err) {
      console.error("[TryOn] Cloudinary upload error:", err);
      return res.json({ success: false, message: "Failed to upload your photo. Please try again." });
    } finally {
      // Xóa file tạm trên disk sau khi upload xong (tránh tốn dung lượng server)
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.warn("[TryOn] Could not delete temp file:", req.file.path);
        });
      }
    }

    // 3. Detect cloth type
    const clothType = detectClothType(subCategory);
    console.log(`[TryOn] Cloth type: ${clothType} (category: ${category}, sub: ${subCategory})`);

    // 4. Call the HuggingFace Space via the Gradio client
    let resultImageUrl;
    try {
      console.log("[TryOn] Connecting to HuggingFace Space...");
      const client = await Client.connect(HF_SPACE, {
        hf_token: HF_TOKEN,
      });

      console.log("[TryOn] Submitting job...");
      const result = await client.predict(2, [
        handle_file(personImageUrl),
        handle_file(garmentImageUrl),
        0,    // Seed
        true, // Random seed (uses random seed for variety)
      ]);

      // Kolors returns an image object with a URL
      const output = result?.data?.[0];
      if (output?.url) {
        resultImageUrl = output.url;
      } else if (typeof output === "string") {
        resultImageUrl = output;
      } else {
        throw new Error("Unexpected response format from HuggingFace Space");
      }

      console.log("[TryOn] Result URL:", resultImageUrl);

      // 4.5 Fetch the AI result using authenticated `client.fetch`, then upload
      //     the image to Cloudinary as a Base64 data URL
      try {
        console.log("[TryOn] Fetching AI result via authenticated client.fetch...");
        const response = await client.fetch(resultImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;

        console.log("[TryOn] Uploading Base64 image to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
          folder: "tryon_results",
          resource_type: "image",
        });
        resultImageUrl = uploadResult.secure_url;
        console.log("[TryOn] Cloudinary Result URL:", resultImageUrl);
      } catch (uploadErr) {
        console.error("[TryOn] Cloudinary upload error for AI result, falling back to HF URL:", uploadErr);
      }
    } catch (err) {
      console.error("[TryOn] HuggingFace Space error:", err?.message ?? err);

      // Prepare a user-friendly error message
      let message = "Virtual try-on processing failed. Please try again.";
      if (err?.message?.includes("rate limit") || err?.message?.includes("too many")) {
        message = "Service is busy right now. Please wait a moment and try again.";
      } else if (err?.message?.includes("timeout") || err?.message?.includes("timed out")) {
        message = "Request timed out. The AI is currently overloaded. Please try again later.";
      }

      return res.json({ success: false, message });
    }

    // 5. Return the resulting image URL to the frontend
    return res.json({
      success: true,
      resultImageUrl,
      clothType,
      message: "Virtual try-on generated successfully!",
    });

  } catch (error) {
    console.error("[TryOn] Unexpected error:", error);
    res.json({ success: false, message: "Something went wrong. Please try again." });
  }
};

export { tryOn };
