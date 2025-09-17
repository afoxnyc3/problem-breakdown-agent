# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Run development server with hot reload (watches src/api/analyze.ts)
- `npm run build` - Compile TypeScript to JavaScript (outputs to dist/)
- `npm start` - Run compiled production version
- `npm run vercel-dev` - Run Vercel dev environment locally
- `npx tsx src/test-local.ts` - Test the agent locally with sample input

### Deployment
- `vercel` - Deploy to Vercel (requires Vercel CLI installed globally)

## Architecture Overview

This is a minimal AI agent that breaks down complex problems into actionable steps with Mermaid diagrams. The system uses OpenAI's function calling for guaranteed structured output.

### Core Flow
1. **API Endpoint** (`api/analyze.ts`): Vercel serverless function that receives POST requests with problem descriptions
2. **Problem Analyzer** (`src/lib/analyzer.ts`): Uses OpenAI GPT-4 with function calling to ensure structured JSON output containing steps with dependencies
3. **Mermaid Generator** (`src/lib/mermaid-generator.ts`): Converts the structured steps into valid Mermaid flowchart syntax with proper escaping and styling

### Key Design Decisions
- **ES Modules**: Project uses `"type": "module"` in package.json - all imports must use `.js` extensions even for TypeScript files
- **Structured Output**: Uses OpenAI function calling (not just prompting) via `ANALYSIS_FUNCTION_SCHEMA` to guarantee parseable JSON responses
- **Step Dependencies**: Each step has an ID and can declare dependencies on other step IDs, enabling complex workflow representations
- **Vercel Deployment**: Configured for serverless deployment with `/api/analyze` as the main endpoint

### API Contract
- **Endpoint**: POST `/api/analyze`
- **Input**: `{ "problem": "string" }`
- **Output**: `{ success: boolean, data?: { steps: Step[], mermaidDiagram: string, summary: string }, error?: string }`

### Environment Requirements
- Must have `OPENAI_API_KEY` in `.env` file
- Uses GPT-4-turbo-preview model by default
- Node.js 18+ required for ES modules support

## Development Workflow Rules

### Test-Driven Development (TDD)
**IMPORTANT**: This project follows strict TDD practices. ALWAYS:
1. Write tests FIRST before implementing any new feature
2. Ensure tests fail initially (red phase)
3. Write minimal code to make tests pass (green phase)
4. Refactor while keeping tests green (refactor phase)
5. Run `npm test` before ANY commit

### Documentation Requirements
Every change MUST be documented:

1. **decision-log.md**: Record ALL architectural and technical decisions with:
   - Date, Context, Options Considered, Decision Made, Consequences

2. **change-log.md**: Log EVERY change with:
   - Date/Time, Type (Feature|Fix|Refactor|Test|Docs|Config), Component, Description, Files Modified

3. **todo.md**: Update task status BEFORE starting work:
   - Move tasks from ⏳ Pending → 🚧 In Progress → ✅ Completed
   - Add new tasks as they're identified

### Commit Standards
**EVERY commit must**:
- Have a clear, concise message: `<type>: <brief description>`
- Types: feat, fix, test, docs, refactor, style, chore
- Example: `feat: add rate limiting to API endpoint`
- Run tests before committing: `npm test`
- Update change-log.md with the change

### Testing Commands
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- Target: Maintain >80% code coverage