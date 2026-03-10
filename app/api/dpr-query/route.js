import { supabase } from "../../../lib/supabase";
import { answerDprQuery } from "../../../lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        const { project_id, query } = await req.json();

        if (!project_id || !query) {
            return Response.json(
                { success: false, error: "Missing project_id or query" },
                { status: 400 }
            );
        }

        // 1. Fetch DPR Summary from DB
        const { data: project, error: dbError } = await supabase
            .from("contractor_projects")
            .select("dpr_text")
            .eq("project_id", project_id)
            .single();

        if (dbError || !project) {
            return Response.json(
                { success: false, error: "Project not found or DB error" },
                { status: 404 }
            );
        }

        const dprSummary = project.dpr_text;

        if (!dprSummary) {
            return Response.json(
                {
                    success: false,
                    error: "No DPR summary found for this project. Please delete and re-initialize the project if it was created before this feature."
                },
                { status: 400 }
            );
        }

        // 2. Query Gemini
        const answer = await answerDprQuery(dprSummary, query);

        return Response.json({
            success: true,
            answer,
        });
    } catch (error) {
        console.error("DPR Query API error:", error);
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
