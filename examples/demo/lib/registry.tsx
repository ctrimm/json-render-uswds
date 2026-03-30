import { defineRegistry } from "@json-render/react";
import { uswdsComponents } from "@cdt5058/json-render-uswds";
import { catalog } from "./catalog";

export const { registry } = defineRegistry(catalog, {
  components: uswdsComponents,
});
