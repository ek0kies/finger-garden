import { ref } from "vue";
import { getStrokeLength } from "../core/gestures/strokeSampler";
import type { InputStroke, StrokePoint } from "../types/game";

function toRelativePoint(
  event: PointerEvent,
  target: HTMLElement,
  cameraX: number
): StrokePoint {
  const rect = target.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    t: performance.now(),
    cameraX
  };
}

export function useGestureInput(
  onStroke: (stroke: InputStroke) => void,
  canStart: () => boolean = () => true,
  getCameraX: () => number = () => 0
) {
  const drawing = ref(false);
  const previewPoints = ref<StrokePoint[]>([]);

  let pointerId: number | null = null;
  let startedAt = 0;

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.currentTarget as HTMLElement | null;
    if (!target || !canStart()) return;

    pointerId = event.pointerId;
    drawing.value = true;
    startedAt = performance.now();
    previewPoints.value = [toRelativePoint(event, target, getCameraX())];

    if (target instanceof HTMLCanvasElement) {
      target.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!drawing.value || pointerId !== event.pointerId) return;
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    previewPoints.value.push(toRelativePoint(event, target, getCameraX()));
  };

  const finishStroke = (event: PointerEvent): void => {
    if (!drawing.value || pointerId !== event.pointerId) return;
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;

    previewPoints.value.push(toRelativePoint(event, target, getCameraX()));

    const points = [...previewPoints.value];
    const endedAt = performance.now();
    const duration = endedAt - startedAt;

    drawing.value = false;
    pointerId = null;
    previewPoints.value = [];

    if (points.length < 2) return;

    onStroke({
      points,
      startedAt,
      endedAt,
      duration,
      length: getStrokeLength(points)
    });
  };

  const onPointerUp = (event: PointerEvent): void => {
    finishStroke(event);
  };

  const onPointerCancel = (event: PointerEvent): void => {
    finishStroke(event);
  };

  return {
    drawing,
    previewPoints,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  };
}
