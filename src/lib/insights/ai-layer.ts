/**
 * Future: LLM-assisted narratives on top of rule-based insights.
 * Pass structured metrics + user preferences; return ranked story cards.
 */
export type AiInsightContext = {
  userId: string;
  monthKey: string;
  metricsJson: string;
};

export async function enrichInsightsWithAi(
  ctx: AiInsightContext,
): Promise<{ lines: string[] }> {
  void ctx;
  return { lines: [] };
}
