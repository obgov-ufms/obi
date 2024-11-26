import { decodeHex } from "@std/encoding";
import { timingSafeEqual } from "@std/crypto";
import { webhooks as webhooksConfig } from "./config.ts";

// https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
export const Webhooks = (options: { secret: string }) => {
    const key = crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(options.secret),
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign", "verify"],
    );

    return {
        cwd: new URL(import.meta.resolve(webhooksConfig.CWD)),
        scriptPath: new URL(import.meta.resolve(webhooksConfig.SCRIPT_PATH)),
        verify: async (req: Request) => {
            const signatureChallengeHex = req.headers.get("x-hub-signature-256");

            if (signatureChallengeHex === null) {
                return false;
            }

            const body = await req.arrayBuffer();

            const signature = await crypto.subtle.sign("HMAC", await key, body);
            const signatureChallenge = decodeHex(signatureChallengeHex);

            return timingSafeEqual(signature, signatureChallenge);
        },
    };
};

export const webhooks = Webhooks({ secret: webhooksConfig.SECRET });

export class WebhookValidationError extends Error {
    override name = "WebhookValidationError";
    constructor() {
        super("Unauthorized");
    }
}
