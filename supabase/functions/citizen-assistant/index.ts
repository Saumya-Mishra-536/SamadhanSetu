import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
}
const officialSources = [
  { name: "myScheme — Government of India scheme directory", url: "https://www.myscheme.gov.in/", scope: "Scheme discovery and eligibility information; verify current rules on the scheme's own official page." },
  { name: "Bihar Lok Shikayat", url: "https://lokshikayat.bihar.gov.in/DefaultEn.aspx", scope: "Bihar public grievance redressal information." },
  { name: "Bihar UPYOG citizen services", url: "https://upyog.bihar.gov.in/c/citizen-services", scope: "Bihar urban local-body citizen services." },
  { name: "CPGRAMS", url: "https://pgportal.gov.in/V7/Home", scope: "Central public grievance portal; check exclusions and jurisdiction." },
]
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors })
  const auth = req.headers.get("Authorization") ?? ""
  if (!auth.startsWith("Bearer ")) return Response.json({ error: "Sign in is required." }, { status: 401, headers: cors })
  try {
    const body = await req.json()
    const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : []
    const sensitivePattern = /\\b(?:\\d{12}|\\d{10}|[A-Z]{5}\\d{4}[A-Z])\\b|\\b(?:otp|one[- ]time password|bank account|debit card|credit card|password)\\b/i
    if (messages.some((m: any) => sensitivePattern.test(m.content))) {
      return Response.json({ error: "Please remove Aadhaar/PAN numbers, phone numbers, OTPs, passwords and banking details before sending your question." }, { status: 400, headers: cors })
    }
    const language = body.language === "hi" ? "Hindi" : "English"
    if (!messages.length || messages.length > 8 || messages.some((m: any) => !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || m.content.length > 1200)) {
      return Response.json({ error: "Invalid message history." }, { status: 400, headers: cors })
    }
    const projectUrl = Deno.env.get("SUPABASE_URL")
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
    if (!projectUrl || !anonKey) return Response.json({ error: "Assistant backend is not configured." }, { status: 503, headers: cors })
    const quotaResponse = await fetch(projectUrl + "/rest/v1/rpc/consume_assistant_quota", {
      method: "POST",
      headers: { apikey: anonKey, Authorization: auth, "Content-Type": "application/json" },
      body: "{}",
    })
    if (!quotaResponse.ok) return Response.json({ error: "Unable to verify assistant usage limits." }, { status: 503, headers: cors })
    if (await quotaResponse.json() !== true) return Response.json({ error: "You have reached the assistant limit. Please try again in a few minutes." }, { status: 429, headers: cors })
    const apiKey = Deno.env.get("OPENAI_API_KEY")
    if (!apiKey) return Response.json({ error: "The assistant has not been configured by the platform operator yet." }, { status: 503, headers: cors })
    const system = `You are Samadhan Setu's citizen information assistant. Respond in ${language}. Samadhan Setu is an independent service, not a government department. Be empathetic, concise and practical. You have NO live browsing, no access to government databases, no ability to submit applications, and no verified scheme-specific eligibility dataset. Never claim that you checked a live scheme, verified an applicant's eligibility, submitted a complaint, or checked grievance status. For scheme discovery or eligibility, direct the citizen to the official myScheme directory and explain that the scheme's official department makes the final decision. Do not invent benefit amounts, income thresholds, document lists, deadlines, helplines, application status or government contacts. Ask only for non-sensitive information; never request Aadhaar, OTP, bank details, passwords or full identity documents. When relevant, cite only these known official starting points and explain their scope: ${JSON.stringify(officialSources)}. If the source list does not answer the question, say so and direct the user to the relevant department's official website. For emergencies, direct users to local emergency services rather than this assistant. This is general navigation information, not legal advice or an official determination.`
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini", temperature: 0.2, max_tokens: 650, messages: [{ role: "system", content: system }, ...messages] }),
    })
    if (!response.ok) return Response.json({ error: "The assistant provider returned an error. Please try again later." }, { status: 502, headers: cors })
    const result = await response.json()
    const answer = result.choices?.[0]?.message?.content
    if (typeof answer !== "string") throw new Error("Empty assistant response")
    return Response.json({ answer }, { headers: cors })
  } catch (_error) {
    return Response.json({ error: "Unable to process this question. Please try again." }, { status: 400, headers: cors })
  }
})
