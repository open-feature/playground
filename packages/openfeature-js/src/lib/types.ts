export type Context = {
  userId?: string;
};

export interface Feature {
  isEnabled(id: string, context?: Context): Promise<boolean>;
  getVariation(
    id: string,
    context?: Context
  ): Promise<FlagEvaluationVariationResponse>;
}

export type FlagEvaluationRequest = {
  clientName: string;
  clientVersion?: string;
  flagId: string;
  context: Context;
};

export type FlagEvaluationResponse = {
  enabled: boolean;
};

export type FlagEvaluationVariationResponse = FlagEvaluationResponse & {
  stringValue?: string;
  boolValue?: boolean;
  numberValue?: number;
};

export interface FeatureProvider {
  name: string;
  evaluateFlag(
    request: FlagEvaluationRequest
  ): Promise<FlagEvaluationVariationResponse>;
}
