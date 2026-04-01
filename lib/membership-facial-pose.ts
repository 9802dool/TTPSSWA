import type { NormalizedFace } from "@tensorflow-models/blazeface";

export type PoseHint =
  | "loading"
  | "noface"
  | "far"
  | "center"
  | "tilt"
  | "hold";

const MAX_ROLL_DEG = 12;
const MIN_FACE_AREA_RATIO = 0.035;
const MAX_CENTER_OFFSET = 0.2;
const MIN_PROB = 0.72;

/**
 * BlazeFace landmark order: right eye, left eye, nose, mouth, right ear, left ear.
 * Returns whether the head appears level (eyes horizontal) and face is usable.
 */
export function analyzeFacePose(
  face: NormalizedFace | undefined,
  videoWidth: number,
  videoHeight: number,
): PoseHint {
  if (!face || videoWidth < 32 || videoHeight < 32) return "noface";

  const prob = face.probability;
  if (typeof prob === "number" && prob < MIN_PROB) return "noface";

  const tl = face.topLeft as [number, number] | undefined;
  const br = face.bottomRight as [number, number] | undefined;
  const lm = face.landmarks as number[][] | undefined;
  if (!tl || !br || !lm || lm.length < 3) return "noface";

  const fw = br[0] - tl[0];
  const fh = br[1] - tl[1];
  const faceArea = fw * fh;
  const frameArea = videoWidth * videoHeight;
  if (faceArea / frameArea < MIN_FACE_AREA_RATIO) return "far";

  const fx = (tl[0] + br[0]) / 2;
  const fy = (tl[1] + br[1]) / 2;
  const cx = videoWidth / 2;
  const cy = videoHeight / 2;
  const offset =
    Math.hypot(fx - cx, fy - cy) / Math.min(videoWidth, videoHeight);
  if (offset > MAX_CENTER_OFFSET) return "center";

  const [rx, ry] = lm[0];
  const [lx, ly] = lm[1];
  const angleRad = Math.atan2(ly - ry, lx - rx);
  let angleDeg = Math.abs((angleRad * 180) / Math.PI);
  if (angleDeg > 90) angleDeg = 180 - angleDeg;
  if (angleDeg > MAX_ROLL_DEG) return "tilt";

  return "hold";
}

export function poseHintMessage(hint: PoseHint): string {
  switch (hint) {
    case "loading":
      return "Starting camera…";
    case "noface":
      return "Show your face — look straight at the camera.";
    case "far":
      return "Move a little closer.";
    case "center":
      return "Center your face in the frame.";
    case "tilt":
      return "Keep your head straight — don’t tilt sideways.";
    case "hold":
      return "Perfect — hold still. Photo in a moment…";
    default:
      return "";
  }
}
