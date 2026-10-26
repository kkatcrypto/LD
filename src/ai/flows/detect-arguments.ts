// src/ai/flows/detect-arguments.ts
'use server';
/**
 * @fileOverview Detects arguments across speeches, identifies dropped arguments, and highlights key clash points.
 *
 * - detectArguments - A function that handles the argument detection process.
 * - DetectArgumentsInput - The input type for the detectArguments function.
 * - DetectArgumentsOutput - The return type for the detectArguments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectArgumentsInputSchema = z.object({
  speeches: z.array(
    z.object({
      speaker: z.string().describe('The speaker of the speech (e.g., AC, NC, 1AR, 2NR, 2AR).'),
      flow: z.string().describe('The flow of the speech, containing the arguments made.'),
    })
  ).describe('An array of speeches, each containing the speaker and the flow of the speech.'),
});
export type DetectArgumentsInput = z.infer<typeof DetectArgumentsInputSchema>;

const DetectArgumentsOutputSchema = z.object({
  detectedArguments: z.array(
    z.object({
      argument: z.string().describe('The argument that was detected.'),
      originSpeech: z.string().describe('The speech in which the argument first appeared (e.g., AC, NC).'),
      type: z.string().describe('The type of argument (e.g., Contention, Impact, Offense, Defense, Voter).'),
      clashPoints: z.array(z.string()).describe('Key clash points related to the argument.'),
      droppedBy: z.array(z.string()).optional().describe('Speakers who dropped the argument, if any.'),
    })
  ).describe('An array of detected arguments, with clash points and dropped arguments.'),
  summary: z.string().describe('A summary of the key arguments and their status throughout the debate.'),
});
export type DetectArgumentsOutput = z.infer<typeof DetectArgumentsOutputSchema>;

export async function detectArguments(input: DetectArgumentsInput): Promise<DetectArgumentsOutput> {
  return detectArgumentsFlow(input);
}

const detectArgumentsPrompt = ai.definePrompt({
  name: 'detectArgumentsPrompt',
  input: {schema: DetectArgumentsInputSchema},
  output: {schema: DetectArgumentsOutputSchema},
  prompt: `You are an expert debate analyst. Your task is to analyze the provided speeches and detect the main arguments, identify key clash points, and determine if any arguments were dropped by specific speakers. You will also categorize each argument.

  Speeches:
  {{#each speeches}}
  Speaker: {{this.speaker}}
  Flow:
  {{this.flow}}
  {{/each}}

  Based on the speeches, identify the core arguments presented. For each argument:
  1.  Identify the speech where it was first introduced ('originSpeech').
  2.  Classify its 'type' as one of: Contention, Impact, Offense, Defense, Voter, Framework, Other. Use tags like [O], [D], [I], [Win], [Voter] to help classification.
  3.  Determine the key points of clash between the speakers ('clashPoints').
  4.  Identify if any speaker failed to address or respond to an argument ('droppedBy').

  Format your output as a JSON object.
  `,
});

const detectArgumentsFlow = ai.defineFlow(
  {
    name: 'detectArgumentsFlow',
    inputSchema: DetectArgumentsInputSchema,
    outputSchema: DetectArgumentsOutputSchema,
  },
  async input => {
    const {output} = await detectArgumentsPrompt(input);
    return output!;
  }
);
