import { RunnableSequence } from '@langchain/core/runnables';
import { prompt } from '../prompt/suggestion.prompt';
import { modelLLM } from '../llm.config';

export const chain = RunnableSequence.from([prompt, modelLLM]);