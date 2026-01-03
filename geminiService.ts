// geminiService.ts  (FRONTEND ONLY – no API key, no @google/genai)
import { Transaction, Goal } from "./types";

/**
 * Call backend to get 3 pieces of financial advice.
 */
export async function getFinancialAdvice(
  transactions: Transaction[],
  goals: Goal[]
) {
  const res = await fetch("/api/finz-advice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions, goals }),
  });

  if (!res.ok) {
    console.error("FinZ advice backend error", res.status);
    // Same fallback you used before
    return [
      { type: "tip", message: "Set aside ₹500 this week for your trip fund!" },
      { type: "warning", message: "You spent 30% more on food this week." },
      { type: "flex", message: "You saved ₹2,000 more than last month. King!" },
    ];
  }

  return (await res.json()) as {
    type: string;
    message: string;
  }[];
}

/**
 * Send a free‑form chat message to FinZ AI and get a reply string back.
 */
export async function sendFinZChatMessage(
  message: string,
  transactions: Transaction[],
  goals: Goal[]
): Promise<string> {
  const res = await fetch("/api/finz-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, transactions, goals }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("FinZ chat backend error", res.status, errText);
    throw new Error(`Backend Error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.reply as string;
}

