import { app } from "./http.ts";
import { http } from "./config.ts";

Deno.serve({
    port: http.PORT,
    hostname: http.HOSTNAME
}, app.fetch)