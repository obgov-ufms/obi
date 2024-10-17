import { Hono } from "hono";
import { Webhooks } from "./webhooks.ts";
import { fromFileUrl } from "@std/path/mod.ts";

const config = {
	port: Number(Deno.env.get("PORT") ?? "8000"),
	hostname: Deno.env.get("HOSTNAME") ?? "0.0.0.0",
	script_path: "./deploy.sh",
	cwd: "../",
	secret: Deno.env.get("SECRET") ?? "It's a Secret to Everybody",
};

const scriptPath = fromFileUrl(import.meta.resolve(config.script_path));
const cwd = fromFileUrl(import.meta.resolve(config.cwd));

const webhooks = Webhooks({ secret: config.secret });

class WebhookValidationError extends Error {
	name = "WebhookValidationError";
	constructor() {
		super("Unauthorized");
	}
}

const app = new Hono()
	.post(
		"/webhook",
		async (c, next) => {
			const valid = await webhooks.verify(c.req.raw.clone());

			if (!valid) {
				throw new WebhookValidationError();
			}

			await next();
		},
		async (c) => {
			const command = new Deno.Command(scriptPath, {
				cwd,
				stdout: "piped",
				stderr: "piped",
				stdin: "null",
			});

			const { stdout, stderr, code } = await command.output();

			return c.json({
				code,
				stdout: new TextDecoder().decode(stdout),
				stderr: new TextDecoder().decode(stderr),
			});
		},
	)
	.onError((err, c) => c.json({ error: err.name, message: err.message }, 500));

Deno.serve(
	{
		hostname: config.hostname,
		port: config.port,
	},
	app.fetch,
);
