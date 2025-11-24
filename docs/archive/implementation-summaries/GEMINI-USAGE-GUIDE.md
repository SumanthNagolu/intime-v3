# Gemini Usage Guide

## 🚀 Getting Started

You have successfully replicated the project's architecture for Gemini. This guide explains how to use the new capabilities available in the `.gemini/` directory.

## 🧠 Adopting Personas

You can ask Gemini to adopt specific personas to get specialized expertise. Use the following prompts:

### Strategic
- **CEO Advisor**: "Act as the CEO Advisor. Analyze the strategic impact of [feature/decision]."
- **CFO Advisor**: "Act as the CFO Advisor. Evaluate the financial implications of [proposal]."

### Planning
- **PM Agent**: "Act as the PM Agent. Help me plan the requirements for [feature]."

### Implementation
- **Database Architect**: "Act as the Database Architect. Design the schema for [module]."
- **Frontend Developer**: "Act as the Frontend Developer. Create a [component] following the design system."
- **API Developer**: "Act as the API Developer. Design the API endpoints for [service]."

### Operations & Quality
- **QA Engineer**: "Act as the QA Engineer. Write a test plan for [feature]."
- **Security Auditor**: "Act as the Security Auditor. Review this code for vulnerabilities."
- **Deployment Specialist**: "Act as the Deployment Specialist. Prepare the deployment checklist."

## ⚡ Triggering Workflows

You can trigger defined workflows by using natural language or slash commands (if supported by your interface, otherwise just ask):

- **Feature Development**: "Run the feature development workflow for [feature name]."
- **Database Design**: "Run the database design workflow."
- **Candidate Pipeline**: "Run the candidate pipeline workflow."
- **Cross-Pollination**: "Analyze cross-pollination opportunities for [scenario]."
- **Deployment**: "Run the deployment workflow."

## 📚 Key Resources

- **`GEMINI.md`**: The core project context and source of truth.
- **`.geminirules`**: The rules that Gemini automatically follows (you can remind Gemini to "follow .geminirules" if needed).
- **`.gemini/agents/`**: Detailed definitions of each agent persona.
- **`.gemini/commands/`**: Definitions of standard workflows.

## 🔄 Daily Workflow

1.  **Start with Strategy/Planning**: Use the CEO Advisor or PM Agent to define what needs to be done.
2.  **Design Architecture**: Use the Database Architect to plan data structures.
3.  **Implement**: Use the Frontend/API Developers to write code.
4.  **Verify**: Use the QA Engineer and Security Auditor to check work.

## 💡 Pro Tip

If Gemini seems to forget its role or the project context, simply say:
> "Read `GEMINI.md` and `.geminirules` to refresh your context."
