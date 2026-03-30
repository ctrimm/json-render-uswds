import { z } from "zod";

export const specSchema = z.object({
  root: z.string().describe("The element ID to render as root"),
  elements: z
    .record(
      z.string(),
      z.object({
        type: z.string().describe("USWDS component name"),
        props: z.record(z.string(), z.unknown()).default({}),
        children: z.array(z.string()).default([]),
      })
    )
    .describe("Map of element ID to element definition"),
});

export type Spec = z.infer<typeof specSchema>;
