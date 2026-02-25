/** Factor applied to current revenue to estimate total pipeline value */
const PIPELINE_MULTIPLIER = 1.5;

/** Monthly ad spend budget used to calculate ROAS */
const AD_SPEND_DIVISOR = 20000;

export function calculatePipelineValue(revenue: number): number {
  return Math.round(revenue * PIPELINE_MULTIPLIER);
}

export function calculateRoas(revenue: number): string {
  return (revenue / AD_SPEND_DIVISOR).toFixed(1);
}
