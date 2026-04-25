import { useState, useCallback, useEffect } from "react";

export type ToastTone = "success" | "error" | "info";
export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

let counter = 0;
const listeners = new Set<(t: ToastItem[]) => void>();
let queue: ToastItem[] = [];

export function pushToast(message: string, tone: ToastTone = "info") {
  const item: ToastItem = { id: ++counter, message, tone };
  queue = [...queue, item];
  listeners.forEach((l) => l(queue));
  setTimeout(() => {
    queue = queue.filter((q) => q.id !== item.id);
    listeners.forEach((l) => l(queue));
  }, 3500);
}

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>(queue);
  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);
  return items;
}

export function useToast() {
  return useCallback((message: string, tone: ToastTone = "info") => {
    pushToast(message, tone);
  }, []);
}
