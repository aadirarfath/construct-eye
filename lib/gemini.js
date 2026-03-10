import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_KEY || process.env.GEMINI_KEY
);



/* =====================================================
TIMELINE GENERATOR
===================================================== */

export async function generateTimeline(

  planText,
  duration,
  budget

) {

  console.log("\n========== GEMINI TIMELINE START ==========");

  console.log("📄 Plan length:", planText?.length);

  console.log("⏱ Duration:", duration);

  console.log("💰 Budget:", budget);


  try {

    const model = genAI.getGenerativeModel({

      model: "gemini-2.5-flash"

    });


    const prompt = `

You are a senior civil engineer.

Analyze the construction plan and generate a COMPLETE timeline.

Plan:
${planText}

Duration:
${duration}

Budget:
${budget}

RULES:

• Minimum 6 phases  
• Cover entire duration  
• Logical civil engineering sequence  

Return ONLY valid JSON.

FORMAT:

{
"timeline":[
{
"phase":"Site Preparation",
"start":0,
"end":1
}
],
"feasible":true,
"suggestion":"short recommendation"
}

NO explanation.
NO markdown.

`;


    console.log("🤖 Sending timeline request...");


    const result = await model.generateContent(prompt);


    const raw = result.response.text();


    console.log("📥 Raw timeline response:");

    console.log(raw);


    const cleaned = raw
      .replace(/```json|```/g, "")
      .trim();


    let parsed;


    try {

      parsed = JSON.parse(cleaned);

    }
    catch {

      console.log("❌ Timeline parse failed");

      return fallbackTimeline();

    }


    console.log("✅ Timeline parsed successfully");

    console.log(parsed);

    console.log("========== GEMINI TIMELINE END ==========\n");


    return parsed;

  }
  catch (error) {

    console.log("❌ Timeline generation failed:");

    console.log(error.message);

    return fallbackTimeline();

  }

}



function fallbackTimeline() {

  return {

    timeline: [],

    feasible: false,

    suggestion: "AI failed to generate timeline"

  };

}

/* =====================================================
DPR SUMMARIZER
===================================================== */

export async function summarizeDpr(planText) {
  console.log("\n========== GEMINI DPR SUMMARIZER START ==========");
  console.log("📄 Plan length:", planText?.length);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a construction project manager.
Summarize the following Detailed Project Report (DPR) into a concise overview.
Focus on key details required to answer high-level questions later (e.g., goals, major phases, materials, risks, constraints).
Keep the summary under 1000 words.

DPR Text:
${planText}
`;

    console.log("🤖 Sending summarize request...");
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log("✅ Summary generated successfully", summary.length, "chars");
    console.log("========== GEMINI DPR SUMMARIZER END ==========\n");

    return summary;
  } catch (error) {
    console.log("❌ DPR Summarization failed:", error.message);
    if (typeof planText === 'string') {
      return planText.substring(0, 3000); // Fallback: just return first 3000 chars
    } else {
      return "Failed to extract or summarize DPR text.";
    }
  }
}

/* =====================================================
DPR CHATBOT
===================================================== */

export async function answerDprQuery(dprSummary, query) {
  console.log("\n========== GEMINI DPR QUERY START ==========");
  console.log("📄 Summary length:", dprSummary?.length);
  console.log("❓ Query:", query);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a construction assistant chatbot for a contractor.
You are answering a question based ONLY on the following Detailed Project Report summary.
Provide a brief, direct, and to-the-point answer. Do not use conversational filler.

DPR Summary:
${dprSummary}

Contractor Query:
${query}
`;

    console.log("🤖 Sending query request...");
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log("✅ Query answered successfully");
    console.log("========== GEMINI DPR QUERY END ==========\n");

    return answer;
  } catch (error) {
    console.log("❌ DPR Query failed:", error.message);
    return "Sorry, I encountered an error while processing your request.";
  }
}


/* =====================================================
PROGRESS ANALYZER
===================================================== */

export async function verifyProgress({

  imageBuffer,
  expectedPhase,
  news,
  weather,
  summary

}) {


  console.log("\n========== GEMINI IMAGE ANALYSIS START ==========");

  console.log("📍 Expected phase:", expectedPhase);

  console.log("📰 News count:", news?.length);

  console.log("🌦 Weather:", weather);

  console.log("📄 Summary length:", summary?.length);

  console.log("🖼 Image size:", imageBuffer?.length);


  try {

    const model = genAI.getGenerativeModel({

      model: "gemini-2.5-flash"

    });


    const prompt = `

You are a government construction inspector AI.

Expected Phase:
${expectedPhase}

Project Summary:
${summary}

Weather:
${JSON.stringify(weather)}

News:
${JSON.stringify(news)}

TASK:

Analyze construction image progress and external risks.

Return ONLY valid JSON.

FORMAT:

{
"completionPercent": number,
"progress": "short description",
"suggestion": "actionable suggestion",
"delayRisk": "low or medium or high",
"newDeadline": "YYYY-MM-DD or null"
}

NO explanation.
NO markdown.

`;


    console.log("🤖 Sending image analysis request...");


    const result = await model.generateContent([

      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg"
        }
      },

      prompt

    ]);


    const raw = result.response.text();


    console.log("📥 Raw analysis response:");

    console.log(raw);


    const cleaned = raw
      .replace(/```json|```/g, "")
      .trim();


    let parsed;


    try {

      parsed = JSON.parse(cleaned);

    }
    catch {

      console.log("❌ Analysis parse failed");

      parsed = fallbackAnalysis();

    }


    console.log("✅ Analysis parsed successfully");

    console.log(parsed);

    console.log("========== GEMINI IMAGE ANALYSIS END ==========\n");


    return parsed;

  }
  catch (error) {

    console.log("❌ Image analysis failed:");

    console.log(error.message);

    return fallbackAnalysis();

  }

}



function fallbackAnalysis() {

  return {

    completionPercent: 0,

    progress: "Unable to analyze",

    suggestion: "Manual inspection required",

    delayRisk: "unknown",

    newDeadline: null

  };

}
