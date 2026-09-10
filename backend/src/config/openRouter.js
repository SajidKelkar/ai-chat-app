import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    throw new Error("Open Router API Key is Missing");
}

const openRouter = new OpenRouter({
    apiKey: apiKey
});

export default openRouter;