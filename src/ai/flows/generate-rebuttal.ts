
'use server';
/**
 * @fileOverview Generates rebuttals and counter-arguments for a given debate speech or argument.
 *
 * - generateRebuttal - A function that handles the rebuttal generation process.
 * - GenerateRebuttalInput - The input type for the generateRebuttal function.
 * - GenerateRebuttalOutput - The return type for the generateRebuttal function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRebuttalInputSchema = z.object({
  context: z.string().describe('The context of the debate, including previous speeches and arguments.'),
  argument: z.string().describe('The specific argument or speech to rebut.'),
});
export type GenerateRebuttalInput = z.infer<typeof GenerateRebuttalInputSchema>;

const GenerateRebuttalOutputSchema = z.object({
  rebuttal: z.string().describe('The generated rebuttal or counter-argument.'),
});
export type GenerateRebuttalOutput = z.infer<typeof GenerateRebuttalOutputSchema>;

export async function generateRebuttal(input: GenerateRebuttalInput): Promise<GenerateRebuttalOutput> {
  return generateRebuttalFlow(input);
}

const generateRebuttalPrompt = ai.definePrompt({
  name: 'generateRebuttalPrompt',
  input: { schema: GenerateRebuttalInputSchema },
  output: { schema: GenerateRebuttalOutputSchema },
  prompt: `You are an expert debate coach and AI assistant. Your task is to generate a strong rebuttal for the provided argument, considering the overall context of the debate.

  Debate Context:
  ---
  {{context}}
  ---

  Argument to Rebut:
  ---
  {{argument}}
  ---

  Based on the context, provide a concise, logical, and persuasive rebuttal. Identify potential fallacies, weak evidence, or counter-positions. Be strategic.`,
});

const generateRebuttalFlow = ai.defineFlow(
  {
    name: 'generateRebuttalFlow',
    inputSchema: GenerateRebuttalInputSchema,
    outputSchema: GenerateRebuttalOutputSchema,
  },
  async (input) => {
    const { output } = await generateRebuttalPrompt(input);
    return output!;
  }
);
