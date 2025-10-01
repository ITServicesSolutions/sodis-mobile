// services/eventBus.ts
type Callback = () => void;
const events: Record<string, Callback[]> = {};

export const on = (event: string, callback: Callback) => {
  if (!events[event]) events[event] = [];
  events[event].push(callback);
};

export const emit = (event: string) => {
  if (events[event]) {
    events[event].forEach((callback) => callback());
  }
};
