import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,POST",
  })
);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("SkillSync Interview AI Running");
});

// ================== INTERVIEW AI ==================
app.post("/generate-interview", async (req, res) => {
  try {
    const { role, resume } = req.body;

    const prompt = `
You are an AI interview generator for SkillSync.

ROLE: ${role}
RESUME: ${resume || "None"}

Previously asked questions (DO NOT repeat any of these):
${(req.body.previousQuestions || []).join("\n")}

STRICT RULES:
• ONLY generate questions for the exact role: ${role}
• DO NOT switch domain
• Use resume only to adjust difficulty
• NEVER repeat any question from the previous list

RETURN ONLY PURE JSON:

{
 "technical":[
   {"question":"","difficulty":"Easy/Medium/Hard","answer":""}
 ],
 "nonTechnical":[
   {"question":"","difficulty":"Easy/Medium/Hard","answer":""}
 ]
}

REQUIREMENTS:
• 5 Technical Questions (STRICTLY ${role})
• 5 Non-Technical Questions
• Each question must be NEW and UNIQUE
• Answers MUST be detailed
• JSON MUST BE VALID
`;


    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    let text = completion.choices[0].message.content || "";

    text = text.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

    let parsed;

    // ---- SAFE JSON PARSER ----
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("BROKEN AI JSON FIXING...");
      text = text
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/\n/g, " ");

      parsed = JSON.parse(text);
    }

    return res.json({
      success: true,
      data: parsed,
    });

  } catch (err) {
    console.log("SERVER ERROR:", err.message);

    // ---------- FINAL GUARANTEED FALLBACK ----------
    return res.json({
      success: true,
      data: {
        technical: [
          {
            question: `Explain your understanding of the role ${req.body.role}?`,
            difficulty: "Medium",
            answer:
              "Explain responsibilities, tools used, workflows, business impact, challenges handled, and measurable outcomes.",
          },
          {
            question: "Explain one major project relevant to this role.",
            difficulty: "Medium",
            answer:
              "Discuss problem, approach, tools, challenges, optimizations, performance, and results.",
          },
        ],
        nonTechnical: [
          {
            question: "Tell me about yourself.",
            difficulty: "Easy",
            answer:
              "Introduce background, achievements, passion for domain, relevant strengths, and conclude with why this role.",
          },
          {
            question: "Why should we hire you?",
            difficulty: "Medium",
            answer:
              "Show fit to role, value to company, mindset, capability, fast learning, teamwork, dedication.",
          },
        ],
      },
    });
  }
});

app.listen(5000, () =>
  console.log("Groq Server Running on Port 5000")
);
