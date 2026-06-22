import { ProjectService } from "./projectService";
import { TaskService } from "./taskService";
import { NoteService } from "./noteService";
import { LogService } from "./logService";

const getOpenAiKey = () => {
  return localStorage.getItem("pv_openai_key") || import.meta.env.VITE_OPENAI_API_KEY || "";
};

// Local Smart Context Analyzer: processes query against localStorage data
const analyzeLocalContext = async (queryText, uid = "mock-user-123") => {
  const [projs, tsks, nts, lgs] = await Promise.all([
    ProjectService.getAllForUser(uid),
    TaskService.getAllForUser(uid),
    NoteService.getAllForUser(uid),
    LogService.getAllForUser(uid),
  ]);

  const q = queryText.toLowerCase();

  // 1. Where did I stop?
  if (q.includes("stop") || q.includes("where did i") || q.includes("last work")) {
    if (lgs.length === 0) {
      return "You haven't logged any daily updates yet. Write a Development Log to track where you stop!";
    }
    const latestLog = lgs[0];
    return `According to your latest Development Log on **${latestLog.date}** for project **${latestLog.projectTitle}**:\n\n* **Completed Work:** ${latestLog.completedWork}\n* **Blockers / Issues:** ${latestLog.issues || "No blockers logged."}\n\n**Next Steps suggested:** ${latestLog.nextSteps || "None logged."}`;
  }

  // 2. What should I work on next? / Generate daily plan
  if (q.includes("next") || q.includes("work on") || q.includes("plan") || q.includes("daily plan")) {
    const pending = tsks.filter((t) => t.status !== "done");
    if (pending.length === 0) {
      return "Great news! You have no pending tasks. Open the Tasks board to create a sprint checklist!";
    }
    
    // Sort high/urgent first
    const sorted = [...pending].sort((a, b) => {
      const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    });

    const taskList = sorted.slice(0, 3).map((t, idx) => `${idx + 1}. **${t.title}** (Priority: \`${t.priority.toUpperCase()}\` · Project: *${t.projectTitle}*)`).join("\n");
    return `Here is your recommended Daily Plan based on pending items:\n\n### Prioritized Deliverables:\n${taskList}\n\n*Would you like to auto-generate daily subtasks for these items?*`;
  }

  // 3. Summarize project X
  if (q.includes("summarize") || q.includes("project")) {
    // Find matching project
    const match = projs.find((p) => q.includes(p.title.toLowerCase()) || q.includes("current"));
    const target = match || projs[0];

    if (!target) {
      return "You don't have any projects in this workspace yet. Create a Project to generate a summary!";
    }

    const projTasks = tsks.filter((t) => t.projectId === target.id);
    const completedTasks = projTasks.filter((t) => t.status === "done").length;
    const projNotes = nts.filter((n) => n.projectId === target.id);

    return `### Project Summary: **${target.title}**\n\n* **Status:** \`${target.status.toUpperCase()}\` · **Priority:** \`${target.priority.toUpperCase()}\`\n* **Progress:** \`${target.progress}%\` complete\n* **Timeline:** ${target.startDate || "—"} to ${target.dueDate || "—"}\n\n**Description:** ${target.description || "No description provided."}\n\n**Workspace Metrics:**\n* Scoped Tasks: ${projTasks.length} (${completedTasks} Completed)\n* Documentation pages: ${projNotes.length} docs`;
  }

  // 4. Generate tasks from notes
  if (q.includes("generate tasks") || q.includes("notes") || q.includes("task from note")) {
    if (nts.length === 0) {
      return "You have no notes logged in your Documentation Hub yet. Create a Note to extract tasks!";
    }
    const note = nts[0];
    
    // Simple heuristic: extract lines starting with bullet points or checkboxes in note content
    const lines = note.content ? note.content.split("\n") : [];
    const extracted = lines
      .filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* ") || l.trim().includes("[ ]"))
      .map((l) => l.replace(/^[-*\s]+/, "").replace(/\[\s\]/, "").trim())
      .slice(0, 4);

    if (extracted.length === 0) {
      return `### Tasks generated from note **"${note.title}"**:\n\n* [ ] Review details in "${note.title}" documentation.\n* [ ] Define validation specifications.\n* [ ] Write initial unit tests.`;
    }

    const taskItems = extracted.map((item) => `* [ ] ${item}`).join("\n");
    return `### Action items generated from note **"${note.title}"**:\n\n${taskItems}`;
  }

  // 5. Explain notes / Explain project notes
  if (q.includes("explain") && (q.includes("note") || q.includes("docs") || q.includes("documentation"))) {
    if (nts.length === 0) {
      return "You have no notes logged in your Documentation Hub yet. Create a Note to explain!";
    }
    // Find note matching project or title search
    const match = nts.find(
      (n) =>
        q.includes(n.title.toLowerCase()) ||
        (n.projectTitle && q.includes(n.projectTitle.toLowerCase()))
    );
    const target = match || nts[0];

    return `### Note Explanation: **${target.title}**\n\n${
      target.content
        ? `Here is an analysis and explanation of your note:\n\n${target.content.slice(
            0,
            400
          )}${target.content.length > 400 ? "..." : ""}`
        : "This note is currently empty. Write some content first!"
    }\n\n*Would you like to generate action items or ask specific questions about this documentation?*`;
  }

  // Default Fallback Response
  return `I'm your ProjectVault AI workspace assistant. I can query details about your projects, daily logs, and documentation pages.\n\nTry asking me:\n* *"Where did I stop last time?"*\n* *"What should I work on next?"*\n* *"Summarize my current project"*`;
};

/**
 * OpenAiService — handles AI chat querying.
 * Connects to OpenAI Chat Completion API if a custom key is saved.
 * Falls back to a local Context Analyzer reading active workspace items if key is blank.
 */
export const OpenAiService = {
  async ask(queryText, conversationHistory = [], uid = "mock-user-123") {
    const key = getOpenAiKey();

    if (!key) {
      // Offline local analysis fallback
      return new Promise((resolve) => {
        setTimeout(async () => {
          const response = await analyzeLocalContext(queryText, uid);
          resolve(response);
        }, 1500); // Simulate network latency
      });
    }

    // Build OpenAI system prompt with workspace context
    const [projs, tsks, nts, lgs] = await Promise.all([
      ProjectService.getAllForUser(uid),
      TaskService.getAllForUser(uid),
      NoteService.getAllForUser(uid),
      LogService.getAllForUser(uid),
    ]);

    const systemPrompt = `You are a helpful AI assistant inside ProjectVault AI.
You have access to the user's workspace dataset:
- Projects: ${JSON.stringify(projs)}
- Tasks: ${JSON.stringify(tsks)}
- Notes: ${JSON.stringify(nts)}
- Daily Logs: ${JSON.stringify(lgs)}

When the user asks questions about their projects, tasks, stopping points, daily logs, notes, or plans, answer them accurately and concisely by analyzing this data. Format responses using beautiful markdown. Keep answers focus-oriented.`;

    try {
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: queryText },
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "OpenAI API returned an error.");
      }

      const resData = await response.json();
      return resData.choices?.[0]?.message?.content || "No response generated.";
    } catch (err) {
      console.error("OpenAI request error:", err);
      throw err;
    }
  },
};
