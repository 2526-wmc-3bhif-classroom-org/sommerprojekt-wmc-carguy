export const JWT_SECRET = process.env.SECRET_KEY || "dev-secret-change-me";

// Mutable object so admin can change AI settings at runtime without a server restart
export const aiConfig = {
    provider: process.env.AI_PROVIDER || "local",
    apiKey: process.env.AI_API_KEY || "",
    apiUrl: process.env.AI_API_URL || "",
    model: process.env.AI_MODEL || "",
};

// Legacy named exports kept for backward compatibility
export const AI_PROVIDER = process.env.AI_PROVIDER || "local";
export const AI_API_KEY = process.env.AI_API_KEY || "";
export const AI_API_URL = process.env.AI_API_URL || "";
export const AI_MODEL = process.env.AI_MODEL || "";
