import { fetch } from "@tauri-apps/plugin-http";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export const AVAILABLE_MODELS = [
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5（高速・低コスト）" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6（バランス）" },
  { id: "claude-opus-4-6", label: "Claude Opus 4.6（高品質）" },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];

function buildPrompt(centerText: string): string {
  return (
    `あなたはMandal-Artのアシスタントです。与えられた中心テーマに対し、` +
    `周囲の8セルに配置する関連するキーワードや相反するキーワード、` +
    `短いフレーズ（各20文字以内）を8つ生成してください。\n\n` +
    `中心テーマ: ${centerText}\n\n` +
    `必ずJSON配列で8つの文字列だけを返してください。説明は不要です。` +
    `例: ["キーワード1","キーワード2","キーワード3","キーワード4","キーワード5","キーワード6","キーワード7","キーワード8"]`
  );
}

export async function generateKeywords(
  centerText: string,
  apiKey: string,
  model: ModelId,
): Promise<string[]> {
  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      messages: [{ role: "user", content: buildPrompt(centerText) }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(error?.error?.message ?? `API エラー: ${response.status}`);
  }

  const data = await response.json() as {
    content?: Array<{ type: string; text: string }>;
  };
  const text = data.content?.[0]?.text ?? "";

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("レスポンスのパースに失敗しました");

  const keywords = JSON.parse(match[0]) as unknown[];
  if (!Array.isArray(keywords) || keywords.length < 8) {
    throw new Error("8つのキーワードを取得できませんでした");
  }

  return keywords.slice(0, 8).map(String);
}
