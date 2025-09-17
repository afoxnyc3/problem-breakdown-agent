/**
 * Minimal problem breakdown agent - single file implementation
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// Types
interface Step {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
}

// OpenAI function schema for structured output
const ANALYSIS_SCHEMA = {
  name: "analyze_problem",
  parameters: {
    type: "object",
    properties: {
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            dependencies: { type: "array", items: { type: "string" } }
          },
          required: ["id", "title", "description", "dependencies"]
        }
      },
      summary: { type: "string" }
    },
    required: ["steps", "summary"]
  }
};

// Analyze problem using OpenAI
async function analyzeProblem(problem: string): Promise<{ steps: Step[], summary: string }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'Break down complex problems into clear, actionable steps with dependencies.'
      },
      { role: 'user', content: problem }
    ],
    functions: [ANALYSIS_SCHEMA],
    function_call: { name: 'analyze_problem' },
    temperature: 0.7
  });

  const result = completion.choices[0].message.function_call;
  if (!result?.arguments) throw new Error('No response from AI');

  return JSON.parse(result.arguments);
}

// Generate Mermaid diagram
function generateMermaid(steps: Step[]): string {
  let diagram = 'flowchart TD\n';

  // Add nodes
  steps.forEach(step => {
    const title = step.title.replace(/"/g, '&quot;');
    const desc = step.description.substring(0, 100).replace(/"/g, '&quot;');
    diagram += `  ${step.id}["<b>${title}</b><br/>${desc}"]\n`;
  });

  // Add connections
  steps.forEach(step => {
    step.dependencies.forEach(dep => {
      diagram += `  ${dep} --> ${step.id}\n`;
    });
  });

  return diagram;
}

// API handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { problem } = req.body;
  if (!problem) {
    return res.status(400).json({ error: 'Problem required' });
  }

  try {
    const analysis = await analyzeProblem(problem);
    const mermaidDiagram = generateMermaid(analysis.steps);

    res.status(200).json({
      success: true,
      data: { ...analysis, mermaidDiagram }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
}

// Local testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const testProblem = "Build a machine learning model for customer churn prediction";
  analyzeProblem(testProblem)
    .then(result => {
      console.log('Steps:', result.steps);
      console.log('\nMermaid:\n', generateMermaid(result.steps));
    })
    .catch(console.error);
}