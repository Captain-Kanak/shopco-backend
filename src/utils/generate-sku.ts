import { randomBytes } from "crypto";
import slugify from "slugify";

interface AttributeInput {
  name: string;
  value: string;
}

export const generateSku = (
  productTitle: string,
  attributes: AttributeInput[] = [],
): string => {
  const titlePart =
    slugify(productTitle, { strict: true }).toUpperCase().slice(0, 20) ||
    "PRODUCT";

  const attributePart = attributes
    .map((attr) => slugify(attr.value, { strict: true }).toUpperCase())
    .filter(Boolean)
    .join("-");

  const suffix = randomBytes(2).toString("hex").toUpperCase();

  return [titlePart, attributePart, suffix].filter(Boolean).join("-");
};
