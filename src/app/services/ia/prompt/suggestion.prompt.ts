import { PromptTemplate } from "@langchain/core/prompts";


export const prompt = new PromptTemplate({
    template: `
        You are an AI assistant.

        Context: {context}

        Question: {input}

        Answer in a concise and clear way.
        `,
    inputVariables: ['context', 'input'], // variables that will be replaced dynamically
    });
