import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG, StorageFolder } from "@/config/storage.config";

/**
 * Uploads a file to Supabase Storage in the centralized bucket.
 * Returns the public URL of the uploaded file.
 * Handles validation and user-friendly error translations.
 */
export async function uploadImage(file: File, folder: StorageFolder = STORAGE_CONFIG.FOLDERS.MISC): Promise<string> {
  // 1. Validate File Existence
  if (!file) {
    throw new Error("कोई फ़ाइल नहीं चुनी गई। (No file selected.)");
  }

  // 2. Validate Size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(`फ़ाइल का आकार ${STORAGE_CONFIG.MAX_FILE_SIZE_MB}MB से अधिक नहीं होना चाहिए। (File size exceeds limit)`);
  }
  
  // 3. Validate Type
  if (!(STORAGE_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("अमान्य फ़ाइल प्रकार। कृपया JPG, PNG, WEBP, या GIF अपलोड करें। (Invalid file type)");
  }

  // 4. Sanitize and prepare filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const fileName = `${uniqueId}_${sanitizedName}`;
  const filePath = `${folder}/${fileName}`;

  try {
    // 5. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    // 6. Handle Storage API Errors
    if (uploadError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Storage Upload Error]", {
          bucket: STORAGE_CONFIG.BUCKET_NAME,
          folder,
          filename: fileName,
          error: uploadError,
        });
      }

      // Translate common Supabase errors
      if (uploadError.message.includes("Bucket not found")) {
        throw new Error("सर्वर पर मीडिया स्टोरेज कॉन्फ़िगर नहीं है। कृपया व्यवस्थापक से संपर्क करें। (Storage bucket missing)");
      }
      if (uploadError.message.includes("new row violates row-level security policy")) {
        throw new Error("फ़ाइल अपलोड करने की अनुमति नहीं है। कृपया लॉगिन करें। (Unauthorized or Policy Violation)");
      }
      if (uploadError.message.toLowerCase().includes("network")) {
        throw new Error("नेटवर्क त्रुटि। कृपया अपने इंटरनेट कनेक्शन की जांच करें। (Network error)");
      }

      throw new Error("फ़ाइल अपलोड करने में विफल। कृपया पुनः प्रयास करें। (Upload failed)");
    }

    // 7. Get Public URL
    const { data } = supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).getPublicUrl(filePath);
    
    if (!data || !data.publicUrl) {
      throw new Error("अपलोड की गई छवि के लिए सार्वजनिक लिंक प्राप्त करने में विफल। (Failed to get public URL)");
    }
    
    return data.publicUrl;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Storage Exception]", error);
    }
    // Re-throw standardized error
    throw error instanceof Error ? error : new Error("एक अज्ञात त्रुटि हुई। (An unknown error occurred)");
  }
}
