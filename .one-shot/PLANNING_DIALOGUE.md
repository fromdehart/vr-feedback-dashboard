# Planning Dialogue — vr-feedback-dashboard

## Initial Idea (Mon Mar  9 03:26:17 PM EDT 2026)
AI Conversation Evaluation Demo

VR / Roleplay Training Transcript Analyzer

⸻

Overview

This project is a demonstration system that evaluates transcripts from simulated training conversations and generates structured coaching feedback using AI.

The system demonstrates how AI can transform conversational transcripts into:
 1. Individual coaching insights for trainees
 2. Aggregate training insights for administrators

The demo simulates a training platform (such as VR roleplay training) where users practice difficult conversations and then receive automated analysis.

This prototype does not need to integrate with VR. Instead, transcripts are pasted into the system.

The AI evaluates the conversation and returns structured JSON that powers two dashboards.

⸻

Core Capabilities

The system will:
 1. Accept a dynamic training scenario
 2. Accept a conversation transcript
 3. Send the transcript to an AI evaluation prompt
 4. Receive structured evaluation JSON
 5. Render:

 • User Coaching Dashboard
 • Admin Insights Dashboard

The system also includes simulated transcripts across multiple performance levels so the dashboards can be demonstrated immediately.

⸻

Core Inputs

The system should support three inputs.

⸻

1. Scenario Description (Dynamic)

A short description describing the roleplay context.

Example inputs:

A manager addressing declining employee performance.

A customer service representative handling an upset customer whose order arrived damaged.

A team leader giving constructive feedback about missed deadlines.

A healthcare professional explaining a treatment plan to an anxious patient.

This scenario is injected into the evaluation prompt so the AI understands the context and expectations of the conversation.

⸻

2. Goal of the Conversation (Optional but Recommended)

The intended outcome of the conversation.

Examples:

Address performance concerns while maintaining trust.

Calm an upset customer and resolve the issue.

Deliver constructive feedback while maintaining morale.

Help a team member identify improvements.

This helps the AI judge whether the conversation achieved its intended purpose.

⸻

3. Conversation Transcript

A transcript of the roleplay interaction.

Example format:

Manager: Hi Alex, thanks for meeting today.

Employee: Sure, what’s up?

Manager: I wanted to talk about a few deadlines that slipped recently.

Employee: Yeah, things have been hectic.

Manager: I understand. Can you tell me more about what’s been going on?

⸻

AI Transcript Evaluation

The transcript is evaluated by an LLM acting as an expert communication coach.

The AI must analyze the trainee’s communication behavior and return structured coaching feedback in JSON.

⸻

Evaluation Metrics

Each conversation should be scored from 1 to 10.

Core Skill Metrics

clarity_of_issue
How clearly the trainee explains the problem.

empathy
Ability to recognize emotions and demonstrate understanding.

active_listening
Evidence the trainee acknowledges and responds to the other person.

question_quality
Use of open-ended and productive questions.

collaboration
Ability to work toward solutions together.

tone_professionalism
Respectful and professional tone.

resolution_effectiveness
Whether the conversation moves toward a constructive outcome.

overall_score
Weighted summary score across all metrics.

⸻

Qualitative Coaching Analysis

The AI should also generate qualitative feedback.

strengths
List of things the trainee did well.

areas_for_improvement
Key coaching opportunities.

recommended_phrases
Better ways to phrase parts of the conversation.

conversation_summary
Brief explanation of how the conversation went.

coaching_advice
Short actionable coaching paragraph.

⸻

Transcript Moment Analysis

The AI should identify specific moments in the transcript that represent strong or weak communication.

This allows the UI to highlight meaningful moments.

Example output structure:

key_moments:
 • line: “Manager: I noticed the last few deadlines slipped.”
type: strength
feedback: “Clearly states the issue without blame.”


## User Feedback (Mon Mar  9 03:48:08 PM EDT 2026)
Use the existing OpenAI function in the template or OpenAI api in general. 

Do we need a backend, can it the dashboard page be populated on the fly from the json?

We would like the most visually interesting charts and graphs?

## User Feedback (Mon Mar  9 04:04:33 PM EDT 2026)
Let’s use gpt-4.1-mini for now. 

Let’s put a super basic password in front of the demo so people don’t waste my api tokens
