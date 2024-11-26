export const labelstudio = {
    API_PATH: Deno.env.get('LABELSTUDIO_API_PATH') ?? "",
    AUTH_TOKEN: Deno.env.get('LABELSTUDIO_AUTH_TOKEN') ?? "",
    PROJECT_ID: Number(Deno.env.get('LABELSTUDIO_PROJECT_ID') ?? -1),
}

export const webhooks = {
    SCRIPT_PATH: "./deploy.sh",
    CWD: "../",
    SECRET: Deno.env.get("WEBHOOK_SECRET") ?? "It's a Secret to Everybody",
}

export const http = {
    PORT: Number(Deno.env.get("PORT") ?? "8000"),
    HOSTNAME: Deno.env.get("HOSTNAME") ?? "0.0.0.0",
}