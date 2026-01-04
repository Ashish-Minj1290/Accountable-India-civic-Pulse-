
/**
 * Fallback Service: DeepSeek + SERP (Search Engine Results Page)
 * This provides a secondary intelligence layer if Gemini fails on localhost.
 */

// Configuration - Assuming keys are in environment
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const SERPER_API_URL = "https://google.serper.dev/search";

export const queryDeepSeekWithSerp = async (prompt: string, schema?: any) => {
  try {
    // 1. Fetch Real-time data from SERP
    const serpResponse = await fetch(SERPER_API_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": (process.env as any).SERP_API_KEY || "fallback_key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: prompt, gl: "in" }),
    });

    const serpData = await serpResponse.json();
    const context = serpData.organic?.map((res: any) => 
      `Title: ${res.title}\nSnippet: ${res.snippet}\nLink: ${res.link}`
    ).join("\n\n") || "No recent news found.";

    const citations = serpData.organic?.map((res: any) => ({
      title: res.title,
      uri: res.link
    })) || [];

    // 2. Process context with DeepSeek
    const systemMsg = schema 
      ? `You are a civic data parser. Use the provided context to answer. Return ONLY raw JSON matching this schema: ${JSON.stringify(schema)}`
      : "You are a civic intelligence assistant. Summarize the provided context objectively.";

    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${(process.env as any).DEEPSEEK_API_KEY || "fallback_key"}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: `CONTEXT:\n${context}\n\nQUERY: ${prompt}` }
        ],
        response_format: schema ? { type: "json_object" } : { type: "text" }
      }),
    });

    const dsData = await deepseekResponse.json();
    const content = dsData.choices[0].message.content;

    return {
      text: content,
      sources: citations,
      engine: "DeepSeek+SERP"
    };
  } catch (error) {
    console.error("DeepSeek+SERP Fallback Error:", error);
    throw error;
  }
};
