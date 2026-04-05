import { defineRegistry } from "@json-render/react";
import { uswdsComponents } from "@cdt5058/json-render-uswds";
import { catalog } from "./catalog";

export const { registry } = defineRegistry(catalog, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: uswdsComponents as any,
});
