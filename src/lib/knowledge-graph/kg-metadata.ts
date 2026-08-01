import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";

/** Optional KG provenance attached to roadmaps, lessons, and assessments. */
export interface KnowledgeGraphProvenance {
  knowledgeGraphId?: string;
  canonicalTopicId?: string;
  prerequisiteIds?: string[];
  relatedTopicIds?: string[];
  kgValidationVersion?: string;
}

export function currentKgValidationVersion(): string {
  return KG_VALIDATION_VERSION;
}

export function hasKgProvenance(
  value: KnowledgeGraphProvenance | null | undefined,
): value is KnowledgeGraphProvenance & { knowledgeGraphId: string } {
  return Boolean(value?.knowledgeGraphId && value.knowledgeGraphId.length > 0);
}

export function withKgValidationVersion<T extends KnowledgeGraphProvenance>(
  value: T,
): T & { kgValidationVersion: string } {
  return {
    ...value,
    kgValidationVersion: value.kgValidationVersion ?? KG_VALIDATION_VERSION,
  };
}
