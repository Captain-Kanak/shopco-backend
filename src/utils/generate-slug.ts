import { randomBytes } from "crypto";
import slugify from "slugify";

export const generateUniqueSlug = (title: string) => {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
  });

  const suffix = () => randomBytes(4).toString("hex");

  let slug = `${baseSlug}-${suffix()}`;

  return slug;
};
