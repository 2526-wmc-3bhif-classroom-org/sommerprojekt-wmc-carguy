import { AI_PROVIDER, AI_API_KEY, AI_API_URL, AI_MODEL } from "../config";

const LOCAL_BAD_WORDS = [
    "nigger", "faggot", "retard", "cunt", "kys", "kill yourself", "slut", "bitch", "whore", "rape"
];

export class ModerationService {
    public async moderateContent(text: string, imageUrls?: string[]): Promise<{ safe: boolean; reason?: string; flaggedImages?: string[] }> {
        const provider = (AI_PROVIDER || "local").toLowerCase();

        // 1. If provider is local or no configuration, use local fallback
        if (provider === "local" || (!AI_API_KEY && provider !== "ollama")) {
            return this.localModeration(text, imageUrls);
        }

        try {
            if (provider === "gemini") {
                return await this.moderateWithGemini(text, imageUrls);
            } else if (provider === "openai") {
                return await this.moderateWithOpenAI(text, imageUrls);
            } else if (provider === "ollama") {
                return await this.moderateWithOllama(text, imageUrls);
            }
        } catch (e: any) {
            console.warn(`AI Moderation provider (${provider}) failed. Falling back to local moderation. Error:`, e.message);
        }

        return this.localModeration(text, imageUrls);
    }

    private localModeration(text: string, imageUrls?: string[]): { safe: boolean; reason?: string; flaggedImages?: string[] } {
        const lowerText = text.toLowerCase();
        for (const word of LOCAL_BAD_WORDS) {
            if (lowerText.includes(word)) {
                return {
                    safe: false,
                    reason: `Blocked by local safety rules: detected offensive keyword "${word}".`
                };
            }
        }
        return { safe: true, flaggedImages: [] };
    }

    private async moderateWithGemini(text: string, imageUrls?: string[]): Promise<{ safe: boolean; reason?: string; flaggedImages?: string[] }> {
        const apiKey = AI_API_KEY;
        const model = AI_MODEL || "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const prompt = `You are an AI content moderator for a car enthusiast forum. 
Analyze the provided text and images for toxic behavior: hate speech, slurs, harassment, sexual content, or graphic violence.
Respond ONLY with a JSON object of this structure:
{
  "safe": boolean,
  "reason": "explanation if not safe, otherwise empty",
  "flaggedImages": [] (array of image indices that contain inappropriate content, e.g. [0] if the first image is bad)
}
Content to moderate:
Text: "${text.replace(/"/g, '\\"')}"`;

        const parts: any[] = [{ text: prompt }];

        if (imageUrls && imageUrls.length > 0) {
            for (const img of imageUrls) {
                if (img.startsWith("data:image/")) {
                    const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
                    if (match) {
                        parts.push({
                            inlineData: {
                                mimeType: match[1],
                                data: match[2]
                            }
                        });
                    }
                }
            }
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API returned status ${response.status}`);
        }

        const data = await response.json() as any;
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) throw new Error("Empty response from Gemini");

        const parsed = JSON.parse(textResponse.trim());
        return this.mapResponseIndicesToUrls(parsed, imageUrls);
    }

    private async moderateWithOpenAI(text: string, imageUrls?: string[]): Promise<{ safe: boolean; reason?: string; flaggedImages?: string[] }> {
        const apiKey = AI_API_KEY;
        const model = AI_MODEL || "gpt-4o-mini";
        const url = AI_API_URL || "https://api.openai.com/v1/chat/completions";

        const systemMessage = `You are an AI content moderator for a car enthusiast forum. 
Analyze the provided text and images for toxic behavior: hate speech, slurs, harassment, sexual content, or graphic violence.
Respond ONLY with a JSON object of this structure:
{
  "safe": boolean,
  "reason": "explanation if not safe, otherwise empty",
  "flaggedImages": [] (array of image indices that contain inappropriate content, e.g. [0] if the first image is bad)
}`;

        const contentParts: any[] = [{ type: "text", text: `Text to moderate: "${text}"` }];

        if (imageUrls && imageUrls.length > 0) {
            for (const img of imageUrls) {
                if (img.startsWith("data:image/")) {
                    contentParts.push({
                        type: "image_url",
                        image_url: { url: img }
                    });
                }
            }
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: contentParts }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API returned status ${response.status}`);
        }

        const data = await response.json() as any;
        const textResponse = data.choices?.[0]?.message?.content;
        if (!textResponse) throw new Error("Empty response from OpenAI");

        const parsed = JSON.parse(textResponse.trim());
        return this.mapResponseIndicesToUrls(parsed, imageUrls);
    }

    private async moderateWithOllama(text: string, imageUrls?: string[]): Promise<{ safe: boolean; reason?: string; flaggedImages?: string[] }> {
        const model = AI_MODEL || "llama3";
        const baseUrl = AI_API_URL || "http://localhost:11434";
        const url = `${baseUrl}/api/chat`;

        const systemMessage = `You are an AI content moderator for a car enthusiast forum. 
Analyze the provided text and images for toxic behavior: hate speech, slurs, harassment, sexual content, or graphic violence.
Respond ONLY with a JSON object of this structure (do not output markdown format, only valid JSON):
{
  "safe": boolean,
  "reason": "explanation if not safe, otherwise empty",
  "flaggedImages": [] (array of image indices that contain inappropriate content, e.g. [0] if the first image is bad)
}`;

        const images: string[] = [];
        if (imageUrls && imageUrls.length > 0) {
            for (const img of imageUrls) {
                if (img.startsWith("data:image/")) {
                    const match = img.match(/^data:image\/\w+;base64,(.+)$/);
                    if (match) {
                        images.push(match[1]);
                    }
                }
            }
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: `Text to moderate: "${text}"`, images: images.length > 0 ? images : undefined }
                ],
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API returned status ${response.status}`);
        }

        const data = await response.json() as any;
        const textResponse = data.message?.content;
        if (!textResponse) throw new Error("Empty response from Ollama");

        const parsed = JSON.parse(textResponse.trim());
        return this.mapResponseIndicesToUrls(parsed, imageUrls);
    }

    private mapResponseIndicesToUrls(parsed: any, imageUrls?: string[]): { safe: boolean; reason?: string; flaggedImages?: string[] } {
        const flaggedUrls: string[] = [];
        if (parsed.flaggedImages && Array.isArray(parsed.flaggedImages) && imageUrls) {
            for (const idx of parsed.flaggedImages) {
                const numIdx = Number(idx);
                if (!isNaN(numIdx) && imageUrls[numIdx]) {
                    flaggedUrls.push(imageUrls[numIdx]);
                }
            }
        }
        return {
            safe: !!parsed.safe,
            reason: parsed.reason || undefined,
            flaggedImages: flaggedUrls
        };
    }
}
