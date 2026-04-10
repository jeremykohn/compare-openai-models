import type { OpenAIModel } from "~~/types/api";

export function sortModelsById(models: OpenAIModel[]): OpenAIModel[] {
  return [...models].sort((left, right) => left.id.localeCompare(right.id));
}

export function filterModelsByExclusionSet(
  models: OpenAIModel[],
  excludeSet: Set<string>,
): OpenAIModel[] {
  return models.filter((model) => !excludeSet.has(model.id));
}
