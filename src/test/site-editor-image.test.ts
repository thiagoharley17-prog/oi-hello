import { Blob as NodeBlob } from "node:buffer";
import { expect, it } from "vitest";
import { MAX_SITE_IMAGE_BYTES, siteImageExtension } from "@/lib/site-editor-image";

it.each([
  ["image/jpeg", [255, 216, 255], "jpg"],
  ["image/png", [137, 80, 78, 71, 13, 10, 26, 10], "png"],
  ["image/webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80], "webp"],
] as const)("accepts matching raster signatures for %s", async (type, bytes, extension) => {
  expect(await siteImageExtension(new NodeBlob([new Uint8Array(bytes)], { type }) as Blob)).toBe(
    extension,
  );
});

it("rejects spoofed and oversized files", async () => {
  await expect(
    siteImageExtension(new NodeBlob(["<svg/>"], { type: "image/png" }) as Blob),
  ).rejects.toThrow("imagem válida");
  await expect(
    siteImageExtension(
      new NodeBlob([new Uint8Array(MAX_SITE_IMAGE_BYTES + 1)], { type: "image/jpeg" }) as Blob,
    ),
  ).rejects.toThrow("5 MB");
});
