import type { GoalCategory } from "@/lib/goals/goal-identity";

export interface TopicConceptContext {
  topicTitle: string;
  topicId?: string;
  goalTitle?: string;
  goalCategory: GoalCategory;
}

/**
 * Expand a topic title into teachable technical concepts.
 * Learning objectives must NOT be used here — they are coverage checklists only.
 */
export function deriveTopicTeachingConcepts(context: TopicConceptContext): string[] {
  const topic = context.topicTitle.trim();
  const topicLower = topic.toLowerCase();
  const topicId = (context.topicId ?? "").toLowerCase();
  const goal = (context.goalTitle ?? "").toLowerCase();
  const haystack = `${topicLower} ${topicId} ${goal}`;

  if (/\bdata engineering\b/.test(haystack) || /\bdata-engineering\b/.test(haystack)) {
    if (
      /fundamental|landscape|overview|intro|basics/.test(topicLower) ||
      topicLower === "data engineering" ||
      /data-engineering-fundamentals|data-engineering-landscape/.test(topicId)
    ) {
      return [
        "What Data Engineering is",
        "How Data Engineering differs from Data Science",
        "ETL vs ELT",
        "Batch vs Streaming",
        "Data Lakes",
        "Data Warehouses",
        "Apache Spark",
        "Airflow and pipeline orchestration",
        "Data quality and monitoring",
      ];
    }

    if (/etl|elt/.test(haystack)) {
      return ["ETL stages", "ELT trade-offs", "Transformation placement", "Idempotent loads"];
    }

    if (/batch|stream/.test(haystack)) {
      return ["Batch processing windows", "Event streaming", "Latency trade-offs", "Exactly-once concerns"];
    }

    if (/warehouse|lakehouse|lake\b/.test(haystack)) {
      return ["Data lake storage", "Warehouse modeling", "Curated layers", "Query performance basics"];
    }

    if (/airflow|orchestr/.test(haystack)) {
      return ["DAG structure", "Scheduling", "Retries and sensors", "Dependency management"];
    }

    if (/spark/.test(haystack)) {
      return ["Spark jobs", "Partitions", "Transformations vs actions", "Shuffle costs"];
    }

    return [
      "Pipeline stages",
      "Storage layers",
      "Transformation patterns",
      "Orchestration",
      "Data quality checks",
    ];
  }

  if (/python syntax|basic data types|variables and/.test(haystack) || /python-syntax/.test(topicId)) {
    return [
      "Python assignment syntax",
      "Integers and floats",
      "Strings and booleans",
      "Dynamic typing",
      "print() and type()",
    ];
  }

  if (/\bpython functions?\b/.test(haystack) || /python-functions/.test(topicId)) {
    return ["def and return", "Parameters and arguments", "Local scope", "Calling functions"];
  }

  if (/\bsql joins?\b/.test(haystack) || /sql-joins/.test(topicId)) {
    return [
      "INNER JOIN",
      "LEFT JOIN",
      "Join keys",
      "Join cardinality",
      "NULL behavior in outer joins",
    ];
  }

  if (/\bsql\b/.test(haystack) && /select|filter|where/.test(haystack)) {
    return ["SELECT columns", "FROM tables", "WHERE filters", "ORDER BY", "NULL comparisons"];
  }

  if (/\breact\b/.test(haystack) && /component|props/.test(haystack)) {
    return ["Function components", "JSX", "Props", "Rendering children", "Composition"];
  }

  if (/\bgit\b/.test(haystack) && /branch/.test(haystack)) {
    return ["Creating branches", "Switching branches", "Merging", "Fast-forward vs merge commits"];
  }

  if (/prompt structure|prompt engineering/.test(haystack)) {
    return ["Role and task framing", "Constraints", "Examples", "Output format", "Iteration"];
  }

  if (/kubernetes|k8s/.test(haystack) && /network/.test(haystack)) {
    return ["Cluster networking model", "Services", "ClusterIP vs NodePort", "DNS in-cluster"];
  }

  if (/vpc|networking/.test(haystack) && context.goalCategory === "Cloud") {
    return ["CIDR ranges", "Subnets", "Route tables", "Internet and NAT gateways", "Security groups"];
  }

  return defaultConceptsFromTopic(topic, context.goalCategory);
}

function defaultConceptsFromTopic(topicTitle: string, category: GoalCategory): string[] {
  const cleaned = topicTitle
    .replace(/\b(fundamentals?|basics?|introduction|overview|essentials?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const base = cleaned || topicTitle;
  const categoryHooks: Record<string, string[]> = {
    Programming: [`${base} syntax`, `${base} core constructs`, `Common ${base} patterns`, `${base} errors`],
    Data: [`${base} concepts`, `${base} workflows`, `Storage and processing`, `Quality and reliability`],
    "Web Development": [`${base} building blocks`, `Component structure`, `State and data flow`, `Common pitfalls`],
    DevOps: [`${base} architecture`, `Configuration`, `Runtime behavior`, `Troubleshooting`],
    Cloud: [`${base} services`, `Networking and access`, `Security boundaries`, `Operational trade-offs`],
    "AI / Machine Learning": [`${base} definitions`, `Workflow steps`, `Evaluation`, `Failure modes`],
    Cybersecurity: [`${base} threats`, `Controls`, `Detection signals`, `Safe practices`],
  };

  return (
    categoryHooks[category] ?? [
      `Core ideas in ${base}`,
      `How ${base} works in practice`,
      `Typical tools and workflows`,
      `Common mistakes with ${base}`,
    ]
  );
}

/** Lecture-style teaching body for well-known topics. Returns null when no dedicated curriculum exists. */
export function buildTopicLectureBody(context: TopicConceptContext): string | null {
  const haystack = `${context.topicTitle} ${context.topicId ?? ""} ${context.goalTitle ?? ""}`.toLowerCase();

  if (/\bdata engineering\b/.test(haystack) || /\bdata-engineering\b/.test(haystack)) {
    if (/fundamental|landscape|overview|intro|basics/.test(haystack) || /data engineering$/.test(haystack.trim())) {
      return [
        "Data Engineering is the discipline of designing, building, and operating systems that collect, move, transform, and store data so other teams can analyze it or use it in products.",
        "It differs from Data Science: data scientists focus on models and insight, while data engineers focus on reliable pipelines, schemas, platforms, and the operational guarantees that keep data flowing.",
        "A typical architecture moves data from sources through ingestion and transformation into analytical storage. ETL (Extract-Transform-Load) cleans and reshapes data before loading a warehouse. ELT (Extract-Load-Transform) loads raw data first, then transforms inside a warehouse or lakehouse using its compute.",
        "Batch pipelines process data on a schedule (hourly, daily). Streaming pipelines process events continuously with lower latency. Choosing between them depends on freshness needs, cost, and operational complexity.",
        "Data lakes store large volumes of raw or semi-structured data cheaply. Data warehouses store curated, query-optimized tables for BI and reporting. Modern lakehouse designs combine lake storage with warehouse-style query engines.",
        "Apache Spark is commonly used for large-scale batch and micro-batch transforms. Airflow (and similar orchestrators) schedule pipeline DAGs, manage dependencies, and retry failed tasks.",
        "Production data engineering also means data quality checks, freshness monitoring, schema evolution, and clear ownership of each pipeline stage—from source extract to curated table.",
      ].join("\n\n");
    }
  }

  if (/python syntax|basic data types/.test(haystack)) {
    return [
      "Python programs bind names to objects with a single equals sign: count = 5. There is no separate type declaration step.",
      "Core built-in types include int, float, str, and bool. type(value) reports the runtime type. Strings use quotes; True and False are capitalized.",
      "Expressions combine values with operators. print() displays results. Mistakes often come from quoting booleans, confusing = with ==, or assuming static types.",
    ].join("\n\n");
  }

  if (/\bsql joins?\b/.test(haystack)) {
    return [
      "A JOIN combines rows from two tables using a join condition, usually equality on key columns.",
      "INNER JOIN returns only matching rows from both sides. LEFT JOIN keeps every row from the left table and fills NULLs when the right side has no match.",
      "Cardinality describes how many rows a join can produce: one-to-one, one-to-many, or many-to-many. Unexpected row explosion usually means the join keys are not unique on one side.",
    ].join("\n\n");
  }

  return null;
}
