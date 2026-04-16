import { useCallback } from "react";
import type { Spec, Action } from "./spec-schema";
import { executeAction } from "./actions";

/**
 * Hook to get an action handler for a given element
 */
export function useActionHandler(
  spec: Spec | null,
  elementId: string,
  onStateChange: (path: string, value: unknown) => void,
) {
  return useCallback(
    (eventName: string) => {
      if (!spec) return;

      const element = spec.elements[elementId];
      if (!element || !element.actions) return;

      const action = element.actions[eventName];
      if (!action) return;

      executeAction(action, onStateChange);
    },
    [spec, elementId, onStateChange],
  );
}

/**
 * Create a wrapper for component emit that triggers actions
 */
export function createEmitWithActions(
  spec: Spec | null,
  elementId: string,
  onStateChange: (path: string, value: unknown) => void,
  originalEmit: (eventName: string) => void,
) {
  return (eventName: string) => {
    // Execute action if defined
    if (spec) {
      const element = spec.elements[elementId];
      if (element?.actions?.[eventName]) {
        const action = element.actions[eventName];
        executeAction(action, onStateChange);
      }
    }

    // Always emit the original event
    originalEmit(eventName);
  };
}
