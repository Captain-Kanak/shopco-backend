import { CloudinaryStorage } from "multer-storage-cloudinary-v2";
import multer from "multer";
import { env } from "./env.js";
import { cloudinaryUpload } from "./cloudinary.js";
import { resolveFileUploadMeta } from "../utils/file-upload.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type CloudinaryStorageOptions = ConstructorParameters<
  typeof CloudinaryStorage
>[0];

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload as CloudinaryStorageOptions["cloudinary"],
  params: async (req, file) => {
    const { uniqueFileName, folderName, resourceType } = resolveFileUploadMeta(
      file.originalname,
    );

    return {
      resource_type: resourceType,
      public_id: uniqueFileName,
      folder: `${env.CLOUDINARY_FOLDER}/${folderName}`,
    };
  },
} as CloudinaryStorageOptions);

export const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});
