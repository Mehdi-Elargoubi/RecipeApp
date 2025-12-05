import { Injectable } from '@angular/core';
import { chain } from './chain/suggestion.chain';

@Injectable({
  providedIn: 'root'
})
export class IaServiceService {

  constructor() { }

  async askLLM(context: string, question: string): Promise<string> {
    const result = await chain.invoke({ context, input: question });
    return result.content as string;
  }
}
