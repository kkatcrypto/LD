'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing a speech.
 *
 * - summarizeSpeech - A function that summarizes the given speech.
 * - SummarizeSpeechInput - The input type for the summarizeSpeech function.
 * - SummarizeSpeechOutput - The return type for the summarizeSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSpeechInputSchema = z.object({
  speechText: z
    .string()
    .describe('The text of the speech to be summarized.'),
});
export type SummarizeSpeechInput = z.infer<typeof SummarizeSpeechInputSchema>;

const SummarizeSpeechOutputSchema = z.object({
  summary: z.string().describe('A summary of the speech.'),
  outline: z.string().describe('An outline of the main points in the speech.'),
  droppedAffPoints: z
    .string()
    .describe('A list of dropped Aff points.'),
  winningArguments: z
    .string()
    .describe('A list of the winning arguments in the speech.'),
  strategicVoters: z
    .string()
    .describe('A list of strategic voters identified in the speech.'),
});
export type SummarizeSpeechOutput = z.infer<typeof SummarizeSpeechOutputSchema>;

export async function summarizeSpeech(
  input: SummarizeSpeechInput
): Promise<SummarizeSpeechOutput> {
  return summarizeSpeechFlow(input);
}

const summarizeSpeechPrompt = ai.definePrompt({
  name: 'summarizeSpeechPrompt',
  input: {schema: SummarizeSpeechInputSchema},
  output: {schema: SummarizeSpeechOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing debate speeches, identify the key arguments, strategic voters, and any dropped points.

  Summarize the following speech text:
  {{speechText}}

  Provide the following:
  - A concise summary of the speech.
  - An outline of the main points (Value, VC, contentions).
  - A list of dropped Aff points.
  - A list of the winning arguments.
  - A list of strategic voters identified in the speech.
  `,
});

const summarizeSpeechFlow = ai.defineFlow(
  {
    name: 'summarizeSpeechFlow',
    inputSchema: SummarizeSpeechInputSchema,
    outputSchema: SummarizeSpeechOutputSchema,
  },
  async input => {
    const {output} = await summarizeSpeechPrompt(input);
    return output!;
  }
);
