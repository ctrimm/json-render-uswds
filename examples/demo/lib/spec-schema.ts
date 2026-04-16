import { z } from "zod";

// Action types for event handling
const actionSchema = z.union([
  z.object({
    type: z.literal("setState"),
    path: z.string().describe("State path to update (e.g. '/currentStep')"),
    value: z.unknown().describe("Value to set at the path"),
  }),
  z.object({
    type: z.literal("navigate"),
    href: z.string().describe("URL to navigate to"),
  }),
  z.object({
    type: z.literal("increment"),
    path: z.string().describe("State path to increment"),
    by: z.number().optional().describe("Amount to increment (default: 1)"),
  }),
  z.object({
    type: z.literal("decrement"),
    path: z.string().describe("State path to decrement"),
    by: z.number().optional().describe("Amount to decrement (default: 1)"),
  }),
]);

export const specSchema = z.object({
  root: z.string().describe("The element ID to render as root"),
  elements: z
    .record(
      z.string(),
      z.object({
        type: z.string().describe("USWDS component name"),
        props: z.record(z.string(), z.unknown()).default({}),
        children: z.array(z.string()).default([]),
        actions: z
          .record(z.string(), actionSchema)
          .optional()
          .describe("Event handlers (e.g. { press: { type: 'setState', ... } })"),
      })
    )
    .describe("Map of element ID to element definition"),
});

export type Spec = z.infer<typeof specSchema>;
export type Action = z.infer<typeof actionSchema>;
