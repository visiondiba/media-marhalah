import { l as server_build_exports } from "./assets/server-build-XSkOPRSa.js";
import { createRequestHandler } from "@netlify/remix-adapter";
//#region \0virtual:netlify-server
var _virtual_netlify_server_default = createRequestHandler({
	build: server_build_exports,
	getLoadContext: async (_req, ctx) => ctx
});
//#endregion
export { _virtual_netlify_server_default as default };
