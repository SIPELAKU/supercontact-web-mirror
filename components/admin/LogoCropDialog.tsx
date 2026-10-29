"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { ZoomIn, ZoomOut } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { cropLogoImage, fitWholeZoom } from "./logoCrop";

interface LogoCropDialogProps {
  /** The picked image (an object URL) and its file name; null = closed. */
  source: { url: string; name: string } | null;
  onCancel: () => void;
  /** The square PNG cut from the picked image. */
  onConfirm: (file: File) => void;
}

const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;
// Shows which part of the square will be transparent.
const CHECKERBOARD = "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 16px 16px";

/**
 * "Adjust logo": the picked image under a fixed 1:1 frame, to drag and zoom
 * before it is uploaded. It opens zoomed to fit the whole image, so a wide
 * logo isn't cut; whatever the image doesn't cover stays transparent.
 * Give it a new `key` per image so it starts afresh.
 */
export default function LogoCropDialog({ source, onCancel, onConfirm }: LogoCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.5);
  const [area, setArea] = useState<Area | null>(null);
  const [preparing, setPreparing] = useState(false);

  const zoomBy = (step: number) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(minZoom, z + step)));

  const handleSave = async () => {
    if (!source || !area) return;
    setPreparing(true);
    try {
      onConfirm(await cropLogoImage(source.url, area, source.name));
    } catch (err) {
      notify.error("Logo not prepared", {
        description: err instanceof Error ? err.message : "Please try another image.",
      });
    } finally {
      setPreparing(false);
    }
  };

  return (
    <Dialog
      open={Boolean(source)}
      onClose={preparing ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography component="span" display="block" fontSize={18} fontWeight={600}>Adjust logo</Typography>
        <Typography component="span" display="block" variant="body2" color="text.secondary">
          Drag to move it and zoom to fit it in the square.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: "16px !important" }}>
        <div className="relative h-72 w-full overflow-hidden" style={{ background: CHECKERBOARD }}>
          {source && (
            <Cropper
              image={source.url}
              crop={crop}
              zoom={zoom}
              minZoom={minZoom}
              maxZoom={MAX_ZOOM}
              aspect={1}
              cropShape="rect"
              objectFit="contain"
              showGrid={false}
              // Lets the image move past the frame, so a wide logo fits whole.
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
              onMediaLoaded={({ naturalWidth, naturalHeight }) => {
                const fit = fitWholeZoom(naturalWidth, naturalHeight);
                setMinZoom(Math.min(0.5, fit));
                setZoom(fit);
              }}
              style={{ cropAreaStyle: { border: "2px solid #ffffff" } }}
            />
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <IconButton size="small" aria-label="Zoom out" onClick={() => zoomBy(-ZOOM_STEP)} disabled={zoom <= minZoom}>
            <ZoomOut className="h-4 w-4" />
          </IconButton>
          <Slider
            size="small"
            aria-label="Zoom"
            value={zoom}
            min={minZoom}
            max={MAX_ZOOM}
            step={0.01}
            onChange={(_, value) => setZoom(value as number)}
          />
          <IconButton size="small" aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM}>
            <ZoomIn className="h-4 w-4" />
          </IconButton>
        </div>
        <Typography variant="caption" color="text.secondary">
          Empty space in the square stays transparent.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <AppButton variantStyle="outline" color="gray" onClick={onCancel} disabled={preparing}>
          Cancel
        </AppButton>
        <AppButton variantStyle="primary" onClick={handleSave} disabled={!area} isLoading={preparing}>
          Save
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}
