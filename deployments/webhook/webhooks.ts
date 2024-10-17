import { decodeHex } from "@std/encoding/hex.ts";
import { timingSafeEqual } from "@std/crypto/timing_safe_equal.ts";

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
