---
name: deep-research
description: Conducts comprehensive internet research on a given topic, formulates an optimal plan and implementation strategy, and proactively asks clarifying questions or seeks suggestions from the user to ensure 100% accuracy and the best possible outcome.
---

# Deep Research Skill

This skill allows the agent to act as a highly collaborative and thorough technical researcher and implementer. Unlike entirely autonomous skills, `deep-research` leverages deep web searching and critical analysis, but actively partners with the user to guarantee perfect accuracy before execution.

## Core Directives

1.  **Deep Web Investigation:** When tasked, immediately use web search tools (`search_web`, `read_url_content`, `browser_subagent`) to gather extensive information on the specific topic, technology, or problem. Do not rely solely on internal knowledge; verify against the latest best practices.
2.  **Optimal Solution Identification:** Filter through the research to identify the absolute best, most optimal, and modern solution for the user's specific context.
3.  **Strategic Planning:** Before jumping into code, formulate a clear, step-by-step implementation plan based on the chosen optimal solution.
4.  **Proactive Clarification & Suggestions:** **This is critical:** Before finalizing the plan or starting implementation, you *must* consult the user. 
    - Ask clarifying questions about edge cases, their specific environment, or business requirements.
    - Offer informed suggestions based on your research (e.g., "I found that using Library X is 20% faster than Library Y. Should we proceed with X?").
    - Ensure you have absolute clarity to guarantee a 100% accurate result.
5.  **Flawless Implementation:** Once the user approves the plan and answers the clarifying questions, execute the implementation precisely as planned.

## Workflow Execution

1.  **Acknowledge & Search:** Confirm the request and immediately begin targeted internet searches.
2.  **Analyze & Synthesize:** Read documentation, current tutorials, and community discussions (like StackOverflow or GitHub issues) to understand the landscape.
3.  **Formulate the Proposal:** Draft a markdown artifact containing:
    - **Research Summary:** Briefly what you found.
    - **Recommended Optimal Solution:** Your pick for the best approach and *why*.
    - **Step-by-Step Plan:** How you intend to implement it.
    - **Clarifying Questions:** 2-3 specific questions for the user to refine the approach and eliminate ambiguity.
4.  **Wait for User Input:** Pause execution until the user responds to your questions and approves the plan.
5.  **Implement:** Using the tools available to you (file editing, command execution), implement the approved plan.
6.  **Verify & Report:** Run necessary checks to ensure 100% accuracy, then report the successful completion to the user.
