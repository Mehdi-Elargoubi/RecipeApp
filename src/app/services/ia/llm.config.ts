import { ChatMistralAI } from "@langchain/mistralai";
import { environment } from "../../../environments/environment";


export const modelLLM = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: environment.mistral.apiKey,
    temperature: 0.7
});