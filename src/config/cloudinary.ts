import { v2 as cloudinary } from "cloudinary";
import status from "http-status";
import { env } from "./env.js";
import AppError from "../errors/app-error.js";
import { CloudinaryResourceType } from "../utils/file-upload.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const deleteFromCloudinaryById = async (
  publicId: string,
  resourceType: CloudinaryResourceType = "image",
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error: any) {
    console.error(
      `Failed to delete "${publicId}" from Cloudinary:`,
      error.message,
    );
  }
};

export const deleteFromCloudinaryByUrl = async (
  url: string,
  resourceType: CloudinaryResourceType = "image",
): Promise<void> => {
  try {
    const regex = /\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/;
    const match = url.match(regex);

    if (!match || !match[1]) {
      throw new AppError("Invalid Cloudinary URL", status.BAD_REQUEST);
    }

    await deleteFromCloudinaryById(match[1], resourceType);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    console.error(
      `Failed to delete file from Cloudinary URL "${url}":`,
      error.message,
    );
  }
};

export { cloudinary as cloudinaryUpload };
