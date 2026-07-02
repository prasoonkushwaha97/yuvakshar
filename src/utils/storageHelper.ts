import { supabase } from "@/lib/supabaseClient";

/**
 * Uploads a file to Supabase Storage in the specified bucket and folder.
 * Returns the public URL of the uploaded file.
 * If the bucket does not exist, it will throw an error to be handled gracefully by the UI.
 */
export async function uploadImage(file: File, bucketName: string, folderPath: string = ""): Promise<string> {
  // Validate file size and type before attempting upload
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds the 10 MB limit.");
  }
  
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file format. Please upload JPG, PNG, WEBP, or GIF.");
  }

  const fileExt = file.name.split(".").pop() || "jpg";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const fileName = `${uniqueId}.${fileExt}`;
  
  // Clean folderPath
  const cleanFolder = folderPath.trim().replace(/^\/|\/$/g, "");
  const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}. Make sure the bucket "${bucketName}" exists and is public.`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (!data || !data.publicUrl) {
    throw new Error("Failed to retrieve the public URL for the uploaded image.");
  }
  
  return data.publicUrl;
}
