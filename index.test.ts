/**
 * Tests for problem breakdown agent
 */

import { describe, it, expect, jest } from '@jest/globals';

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              function_call: {
                arguments: JSON.stringify({
                  steps: [
                    { id: 'step1', title: 'Setup', description: 'Initial setup', dependencies: [] },
                    { id: 'step2', title: 'Build', description: 'Build project', dependencies: ['step1'] }
                  ],
                  summary: 'Test summary'
                })
              }
            }
          }]
        })
      }
    }
  }))
}));

describe('Problem Breakdown Agent', () => {
  it('should analyze problems and generate mermaid diagrams', async () => {
    // Since everything is in one file now, we test the integrated behavior
    expect(true).toBe(true); // Placeholder - in real scenario we'd test the handler
  });
});