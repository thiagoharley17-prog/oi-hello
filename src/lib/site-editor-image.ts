export const SITE_IMAGE_BUCKET = "site-editor-images";
export const MAX_SITE_IMAGE_BYTES = 5 * 1024 * 1024;
export const SITE_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

export async function siteImageExtension(file: Blob) {
  if (!file.size || file.size > MAX_SITE_IMAGE_BYTES) {
    throw new Error("Escolha uma imagem de até 5 MB.");
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, index) => head[index + offset] === byte);

  if (file.type === "image/jpeg" && startsWith([255, 216, 255])) return "jpg";
  if (file.type === "image/png" && startsWith([137, 80, 78, 71, 13, 10, 26, 10])) return "png";
  if (file.type === "image/webp" && startsWith([82, 73, 70, 70]) && startsWith([87, 69, 66, 80], 8))
    return "webp";
  throw new Error("Escolha uma imagem válida no formato JPG, PNG ou WebP.");
}

const imagePrefix = "/api/site-image/";
const imageName = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\.(jpg|png|webp)$/;

export function siteImagePath(name: string) {
  return imagePrefix + name;
}

export function siteImageObject(path: string) {
  if (!path.startsWith(imagePrefix)) return null;
  const name = path.slice(imagePrefix.length);
  return imageName.test(name) ? name : null;
}
