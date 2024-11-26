import { Hono } from 'hono'
import { stream } from 'hono/streaming'
import { accepts } from 'hono/accepts'
import { getResultStream } from "./labelstudio.ts";
import { webhooks, WebhookValidationError } from "./webhooks.ts";

export const app = new Hono().get("/labelstudio_export", c => {
    const accept = accepts(c, {
        header: 'Accept',
        supports: ['application/json', 'text/csv'],
        default: 'text/csv',
    }) as 'application/json' | 'text/csv'

    return stream(c, async (stream) => {
        c.header("Content-Type", `${accept}; charset=utf-8`)

        await stream.pipe(
            getResultStream(accept)
        )
    })
}).post(
    "/webhook",
    async (c, next) => {
        const valid = await webhooks.verify(c.req.raw.clone());

        if (!valid) {
            throw new WebhookValidationError();
        }

        await next();
    },
    async (c) => {
        const command = new Deno.Command(webhooks.scriptPath, {
            cwd: webhooks.cwd,
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