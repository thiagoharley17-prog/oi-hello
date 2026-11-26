import { useId, useState } from "react";
import { useSiteImagePreview } from "./site-image-preview";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  SITE_IMAGE_BUCKET,
  SITE_IMAGE_TYPES,
  siteImageExtension,
  siteImagePath,
} from "@/lib/site-editor-image";

export function SiteImageField({
  label,
  value,
  change,
  optional,
  onUploadState,
}: {
  label: string;
  value: string;
  change: (url: string) => void;
  optional: boolean;
  onUploadState: ((uploading: boolean) => void) | undefined;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const description = useId();
  const preview = useSiteImagePreview(value);

  async function upload(file: File) {
    onUploadState?.(true);
    setPending(true);
    setError("");
    try {
      const extension = await siteImageExtension(file);
      const objectName = `${crypto.randomUUID()}.${extension}`;
      const bucket = supabase.storage.from(SITE_IMAGE_BUCKET);
      const { error } = await bucket.upload(objectName, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: "31536000",
      });
      if (error)
        throw new Error("Não foi possível enviar a imagem. Confira sua sessão e tente novamente.");
      change(siteImagePath(objectName));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar a imagem.");
    } finally {
      setPending(false);
      onUploadState?.(false);
    }
  }

  return (
    <div className="grid gap-2 rounded-md border p-3">
      {preview.url && (
        <img
          src={preview.url}
          alt=""
          className="h-24 max-w-full rounded border bg-muted object-contain"
        />
      )}
      <label className="grid gap-2 text-sm font-medium">
        {label}
        <input
          type="file"
          accept={SITE_IMAGE_TYPES}
          aria-describedby={description}
          className="w-full max-w-md rounded-md border border-input px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      <small id={description} className="text-muted-foreground">
        JPG, PNG ou WebP, até 5 MB.
      </small>
      {preview.failed && (
        <p className="text-sm text-muted-foreground">Prévia da imagem indisponível.</p>
      )}
      {pending && (
        <p role="status" className="text-sm">
          Enviando imagem…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {optional && value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            change("");
            setError("");
          }}
        >
          Remover imagem
        </Button>
      )}
    </div>
  );
}
