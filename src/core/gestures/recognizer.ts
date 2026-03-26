import type { InputStroke } from "../../types/game";
import { recognizeCircle } from "./circleRecognizer";

export type GestureAction = "path" | "shield";

export interface GestureResult {
  action: GestureAction;
  confidence: number;
}

export function recognizeGesture(stroke: InputStroke): GestureResult {
  const circle = recognizeCircle(stroke);
  if (circle.matched && circle.confidence >= 0.55) {
    return {
      action: "shield",
      confidence: circle.confidence
    };
  }

  return {
    action: "path",
    confidence: 1
  };
}
