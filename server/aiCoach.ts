import { invokeLLM } from "./_core/llm";

export interface CoachingContext {
  customerName?: string;
  industry?: string;
  lastVisit?: string;
  orderHistory?: string;
  currentChallenge?: string;
  repExperience?: "junior" | "mid" | "senior";
}

export interface CoachingResponse {
  advice: string;
  strategies: string[];
  examples: string[];
  resources?: string[];
}

/**
 * AI Sales Coach - Provides real-time coaching for food & beverage sales reps
 * Specialized for small retail stores: restaurants, delis, bakeries, cafes, grocery stores
 * Handles objections, customer strategies, and field challenges
 */

export async function getObjectionHandling(
  objection: string,
  context?: CoachingContext
): Promise<CoachingResponse> {
  const systemPrompt = `You are an expert sales coach with 20+ years of experience selling food and beverage products to small retail stores.
You specialize in helping sales reps sell to restaurants, delis, bakeries, cafes, specialty grocery stores, and independent food retailers.
These are transactional relationships - no contracts or long-term agreements. Focus on building trust, understanding their immediate needs, and making quick decisions.
Provide practical, actionable advice that can be implemented immediately.
Consider the rep's experience level and customer context when providing guidance.
Remember: These are small business owners who make quick buying decisions based on quality, price, and reliability.`;

  const userPrompt = `
Sales Rep Experience: ${context?.repExperience || "mid"}
Customer: ${context?.customerName || "Unknown"}
Store Type: ${context?.industry || "Small retail food & beverage store"}
Last Visit: ${context?.lastVisit || "First contact"}
Order History: ${context?.orderHistory || "No previous orders"}

OBJECTION: "${objection}"

Please provide:
1. Analysis of the objection specific to food & beverage retail
2. 3-4 specific strategies to handle this objection (focus on quick decisions, no contracts)
3. 2-3 real-world examples of how to respond to small food retailers
4. Key talking points that resonate with independent store owners

Format your response as JSON with keys: advice, strategies, examples, resources`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "objection_handling",
        strict: true,
        schema: {
          type: "object",
          properties: {
            advice: { type: "string", description: "Overall coaching advice for food & beverage sales" },
            strategies: {
              type: "array",
              items: { type: "string" },
              description: "Specific strategies to handle the objection in F&B retail",
            },
            examples: {
              type: "array",
              items: { type: "string" },
              description: "Real-world examples and responses for small food retailers",
            },
            resources: {
              type: "array",
              items: { type: "string" },
              description: "Additional resources or tips for F&B sales",
            },
          },
          required: ["advice", "strategies", "examples"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI coach");

  const contentStr = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(contentStr);
}

export async function getCustomerStrategy(
  context: CoachingContext
): Promise<CoachingResponse> {
  const systemPrompt = `You are an expert sales strategist specializing in food and beverage sales to small retail stores.
You understand the unique needs of restaurants, delis, bakeries, cafes, and independent grocers.
These are transactional relationships - focus on immediate needs, quick turnaround, and building trust through reliability.
Provide personalized strategies based on store type and history.
Focus on understanding their inventory needs, seasonal demands, and building repeat business.`;

  const userPrompt = `
Customer Profile:
- Store Name: ${context.customerName || "Unknown"}
- Store Type: ${context.industry || "Small retail food & beverage store"}
- Last Visit: ${context.lastVisit || "First contact"}
- Order History: ${context.orderHistory || "No previous orders"}

Please provide:
1. Overall strategy for this store type
2. 3-4 specific tactics to increase order frequency and size
3. 2-3 product opportunities based on their store type
4. Key success metrics to track (order frequency, average order value, product mix)

Format your response as JSON with keys: advice, strategies, examples, resources`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "customer_strategy",
        strict: true,
        schema: {
          type: "object",
          properties: {
            advice: { type: "string", description: "Overall strategy advice for this F&B retail customer" },
            strategies: {
              type: "array",
              items: { type: "string" },
              description: "Specific tactics for this store type",
            },
            examples: {
              type: "array",
              items: { type: "string" },
              description: "Examples and implementation tips for F&B retail",
            },
            resources: {
              type: "array",
              items: { type: "string" },
              description: "Additional resources specific to this store type",
            },
          },
          required: ["advice", "strategies", "examples"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI coach");

  const contentStr = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(contentStr);
}

export async function getSalesCoaching(
  topic: string,
  context?: CoachingContext
): Promise<CoachingResponse> {
  const systemPrompt = `You are a world-class sales coach specializing in food and beverage sales to small retail stores.
You have expertise in selling to restaurants, delis, bakeries, cafes, and independent grocers.
These are transactional relationships - no contracts. Focus on quick decisions, building trust, and understanding immediate needs.
Provide actionable, practical advice that sales reps can use immediately.
Tailor your advice to the rep's experience level and the specific situation in F&B retail.
Help reps understand what motivates small business owners: quality, reliability, fair pricing, and quick service.`;

  const userPrompt = `
Sales Rep Experience: ${context?.repExperience || "mid"}
Current Challenge: "${topic}"
${context?.customerName ? `Customer: ${context.customerName}` : ""}
${context?.industry ? `Store Type: ${context.industry}` : ""}

Please provide:
1. Root cause analysis of the challenge in food & beverage retail
2. 3-4 proven techniques to overcome it (specific to F&B sales)
3. 2-3 specific examples with dialogue for small food retailers
4. Quick wins and long-term improvements for building repeat business

Format your response as JSON with keys: advice, strategies, examples, resources`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sales_coaching",
        strict: true,
        schema: {
          type: "object",
          properties: {
            advice: { type: "string", description: "Coaching advice for F&B sales" },
            strategies: {
              type: "array",
              items: { type: "string" },
              description: "Techniques and strategies for food & beverage retail sales",
            },
            examples: {
              type: "array",
              items: { type: "string" },
              description: "Examples and dialogue specific to F&B retail",
            },
            resources: {
              type: "array",
              items: { type: "string" },
              description: "Resources and tips for F&B sales success",
            },
          },
          required: ["advice", "strategies", "examples"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI coach");

  const contentStr = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(contentStr);
}
