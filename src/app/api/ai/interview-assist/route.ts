import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { searchRAG } from "@/lib/academy/rag-service";

// Load Goutham's SGI context at startup
let sgiContext = "";
async function loadSGIContext() {
  if (sgiContext) return sgiContext;
  try {
    const basePath = join(process.cwd(), "public/academy/guidewire/interview-prep");
    const [notes, cheatSheet] = await Promise.all([
      readFile(join(basePath, "SGI-SpeakerNotes.md"), "utf-8"),
      readFile(join(basePath, "SGI-QuickRef-CheatSheet.md"), "utf-8"),
    ]);
    sgiContext = `\n\n## GOUTHAM'S SGI INTERVIEW CONTEXT\nYou are helping Goutham (Senior Guidewire Developer) in a LIVE interview with SGI (Saskatchewan Government Insurance). He submitted a PolicyCenter Cyber Liability solution. Below is his full solution context — use this as the PRIMARY source for answers. Frame everything as HIS experience.\n\n### SPEAKER NOTES (What Goutham planned to say)\n${notes}\n\n### QUICK REFERENCE\n${cheatSheet}`;
  } catch {
    console.warn("[Interview] Could not load SGI context files");
  }
  return sgiContext;
}

const INTERVIEW_SYSTEM_PROMPT = `You are coaching a Guidewire developer through a LIVE interview. You see their screen and feed them answers in real-time.

## CRITICAL: SPEED & BREVITY
- Keep answers SHORT: 2-4 sentences for simple questions, max 6 for complex ones
- Get to the point IMMEDIATELY — no preamble, no "Great question"
- Start with the answer, then add 1 detail that shows depth
- Sound natural and confident, like a senior dev in conversation

## HOW TO ANSWER
- Answer as if YOU are the candidate speaking to the interviewer in first person
- Frame as personal project experience: "In my project...", "What I did was...", "The way I implemented this..."
- Be SPECIFIC: drop exact Gosu classes, PCF pages, entity names
- Bold the key technical terms

## ANSWER STRUCTURE
1. Direct answer (1 sentence)
2. Specific technical detail with class/entity names
3. One gotcha or best practice (if relevant)

## KNOWLEDGE BASE CONTEXT
Use the context below for accurate technical details. Frame the information as YOUR experience.`;

export async function POST(request: NextRequest) {
  try {
    const { question, conversationHistory } = await request.json();

    if (!question) {
      return new Response(JSON.stringify({ error: "No question provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Parallel RAG searches — general + practical content for best coverage
    let ragContext = "";
    try {
      const [generalResults, practicalResults] = await Promise.all([
        searchRAG(question, {
          topK: 6,
          minScore: 0.28,
        }),
        searchRAG(question, {
          topK: 4,
          minScore: 0.25,
          sourceTypes: ["assignment", "interview_prep", "ppt_content", "narration", "knowledge_check"],
        }),
      ]);

      // Merge and deduplicate, prioritizing practical content (assignments, interview, narrations)
      const seen = new Set<string>();
      const merged = [];

      // Practical/hands-on content first
      for (const r of practicalResults) {
        if (!seen.has(r.chunk.id)) {
          seen.add(r.chunk.id);
          merged.push(r);
        }
      }
      // Then general results
      for (const r of generalResults) {
        if (!seen.has(r.chunk.id)) {
          seen.add(r.chunk.id);
          merged.push(r);
        }
      }

      // Take top 8 total
      const top = merged.slice(0, 8);

      if (top.length > 0) {
        const contextChunks = top.map((r, i) => {
          const meta = [
            r.chunk.source_type === "assignment" ? "Assignment (Hands-on Implementation)" :
            r.chunk.source_type === "narration" ? "Developer Explanation" :
            r.chunk.source_type === "knowledge_check" ? "Knowledge Check Q&A" :
            r.chunk.source_type === "interview_prep" ? "Interview Q&A" :
            r.chunk.source_type === "ppt_content" ? "Training Material" :
            r.chunk.source_type === "official_guide" ? "Guidewire Docs" :
            r.chunk.source_type === "video_transcript" ? "Training Video" :
            r.chunk.source_type,
            r.chunk.chapter_title || null,
          ]
            .filter(Boolean)
            .join(" | ");

          return `[${i + 1}] (${meta})\n${r.chunk.text}`;
        });

        ragContext = `\n${contextChunks.join("\n---\n")}`;
      }
    } catch (ragError) {
      console.error("[Interview] RAG search failed:", ragError);
    }

    // 2. Load SGI context + build system prompt
    const candidateContext = await loadSGIContext();
    const systemPrompt = INTERVIEW_SYSTEM_PROMPT + candidateContext + ragContext;

    // 3. Build conversation context
    const historyContext = conversationHistory
      ?.slice(-4)
      ?.map((h: { role: string; content: string }) => `${h.role}: ${h.content}`)
      .join("\n") || "";

    const userMessage = historyContext
      ? `Previous conversation:\n${historyContext}\n\nInterviewer asks: "${question}"\n\nGive me the answer to say (be concise):`
      : `Interviewer asks: "${question}"\n\nGive me the answer to say (be concise):`;

    // 4. Stream with Haiku for SPEED — context has all the knowledge needed
    const anthropic = new Anthropic({ apiKey });

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    // 5. Return streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("[Interview] Stream error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Interview assist error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
