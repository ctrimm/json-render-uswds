import type { Action } from "./spec-schema";

/**
 * Execute an action with the given state setter
 */
export function executeAction(
  action: Action,
  setState: (path: string, value: unknown) => void,
): void {
  switch (action.type) {
    case "setState":
      setState(action.path, action.value);
      break;

    case "navigate":
      window.location.href = action.href;
      break;

    case "increment": {
      const by = action.by ?? 1;
      setState(action.path, (prev: unknown) => {
        if (typeof prev === "number") return prev + by;
        return 1;
      });
      break;
    }

    case "decrement": {
      const by = action.by ?? 1;
      setState(action.path, (prev: unknown) => {
        if (typeof prev === "number") return Math.max(0, prev - by);
        return 0;
      });
      break;
    }

    default:
      // @ts-ignore - exhaustiveness check
      const _exhaustive: never = action;
      return _exhaustive;
  }
}
