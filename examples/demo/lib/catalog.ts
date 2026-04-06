import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { uswdsComponentDefinitions } from "@cdt5058/json-render-uswds/catalog";

export const catalog = defineCatalog(schema, {
  components: uswdsComponentDefinitions,
  actions: {},
});
