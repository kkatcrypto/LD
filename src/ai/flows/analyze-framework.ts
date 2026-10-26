
'use server';
/**
 * @fileOverview Analyzes a debate framework to identify strengths, weaknesses, and strategic applications.
 *
 * - analyzeFramework - A function that handles the framework analysis process.
 * - AnalyzeFrameworkInput - The input type for the analyzeFramework function.
 * - AnalyzeFrameworkOutput - The return type for the analyzeFramework function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeFrameworkInputSchema = z.object({
  value: z.string().describe('The core value of the framework (e.g., Justice, Morality).'),
  valueCriterion: z.string().describe('The standard used to measure or achieve the value (e.g., Maximizing Well-being).'),
  interpretation: z.string().describe('The rules and interpretations for applying the framework.'),
});
export type AnalyzeFrameworkInput = z.infer<typeof AnalyzeFrameworkInputSchema>;

const AnalyzeFrameworkOutputSchema = z.object({
  strengths: z.string().describe('A summary of the potential strengths and persuasive arguments for this framework.'),
  weaknesses: z.string().describe('A summary of potential weaknesses, contradictions, or common arguments against this framework.'),
  applications: z.string().describe('Suggestions on how to strategically apply this framework to common debate resolutions or topics.'),
  philosophers: z.string().describe('A list of key philosophers, thinkers, or texts associated with the framework\'s concepts.'),
});
export type AnalyzeFrameworkOutput = z.infer<typeof AnalyzeFrameworkOutputSchema>;

export async function analyzeFramework(input: AnalyzeFrameworkInput): Promise<AnalyzeFrameworkOutput> {
  return analyzeFrameworkFlow(input);
}

const analyzeFrameworkPrompt = ai.definePrompt({
  name: 'analyzeFrameworkPrompt',
  input: { schema: AnalyzeFrameworkInputSchema },
  output: { schema: AnalyzeFrameworkOutputSchema },
  prompt: `You are an expert debate coach and philosopher. Analyze the following debate framework provided by a student.

  Framework Value: {{value}}
  Value Criterion: {{valueCriterion}}
  Interpretation/Rules: {{interpretation}}

  Your task is to provide a comprehensive analysis to help the student strengthen their position. Please provide the following:
  1.  **Potential Strengths:** Identify the most persuasive aspects of this framework. Why is it a strong ethical or logical position?
  2.  **Potential Weaknesses:** What are the most likely attacks or philosophical objections to this framework? Are there any internal contradictions?
  3.  **Suggested Applications:** How can this framework be effectively applied to arguments? Provide brief examples.
  4.  **Key Philosophers & Concepts:** List the major philosophers, schools of thought, or key texts that support or are relevant to this framework. This will help the user with further research.

  Be concise, clear, and provide actionable advice. Format your output as a JSON object.`,
});

const analyzeFrameworkFlow = ai.defineFlow(
  {
    name: 'analyzeFrameworkFlow',
    inputSchema: AnalyzeFrameworkInputSchema,
    outputSchema: AnalyzeFrameworkOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeFrameworkPrompt(input);
    return output!;
  }
);
