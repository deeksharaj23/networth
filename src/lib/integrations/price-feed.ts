/**
 * Future: live quotes for stocks, mutual funds, and gold.
 * Wire to broker APIs, AMFI NAV endpoints, or aggregators.
 */
export type PriceQuoteRequest = {
  symbol: string;
  assetClass: "equity" | "mf" | "gold";
};

export type PriceQuote = {
  symbol: string;
  price: number;
  currency: string;
  asOf: string;
};

export async function fetchQuotes(
  requests: PriceQuoteRequest[],
): Promise<PriceQuote[]> {
  void requests;
  return [];
}
