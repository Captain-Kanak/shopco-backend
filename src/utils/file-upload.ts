import status from "http-status";
import crypto from "crypto";
import AppError from "../errors/app-error.js";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const PDF_EXTENSIONS = ["pdf"];
const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...PDF_EXTENSIONS];

export type CloudinaryResourceType = "image" | "raw";

export interface FileUploadMeta {
  uniqueFileName: string;
  folderName: string;
  resourceType: CloudinaryResourceType;
}

export const resolveFileUploadMeta = (
  originalFileName: string,
): FileUploadMeta => {
  const extension = originalFileName.split(".").pop()?.toLocaleLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new AppError("Unsupported file type", status.BAD_REQUEST);
  }

  const folderName = IMAGE_EXTENSIONS.includes(extension) ? "images" : "pdfs";
  const resourceType: CloudinaryResourceType = IMAGE_EXTENSIONS.includes(
    extension,
  )
    ? "image"
    : "raw";

  const fileNameWithoutExtension = originalFileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9-]/gi, "");

  const safeName = fileNameWithoutExtension || "file";
  const uniqueFileName = `${crypto.randomUUID()}-${safeName}`;

  return { uniqueFileName, folderName, resourceType };
};
