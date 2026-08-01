import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const t1 = topic({
  id: "de-landscape",
  title: "Data Engineering Landscape",
  aliases: ["de landscape", "data platform landscape"],
  description: "Orient around producers, pipelines, storage, and consumers in a data platform.",
  difficulty: "beginner",
  learningOrder: 1,
  prerequisiteIds: [],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react hooks", "kubernetes rbac"],
  concepts: [
    concept({ id: "de-producers", title: "Data Producers", description: "Applications and systems that emit data." }),
    concept({ id: "de-pipelines", title: "Pipelines", description: "Automated movement and transformation of data." }),
    concept({ id: "de-storage-layers", title: "Storage Layers", description: "Landing, processed, and serving storage tiers." }),
    concept({ id: "de-consumers", title: "Data Consumers", description: "Analytics, ML, and operational readers." }),
    concept({ id: "de-batch-vs-stream-overview", title: "Batch vs Stream Overview", description: "Latency and freshness trade-offs at platform level." }),
    concept({ id: "de-platform-roles", title: "Platform Roles", description: "How analytics engineers, DE, and stewards collaborate." })
  ],
  learningObjectives: ["Map platform building blocks", "Locate where pipelines sit between producers and consumers"],
  practicalArtifacts: [
    artifact({
      id: "de-landscape-flow",
      type: "diagram",
      title: "Platform flow",
      
      content: "Producers -> Ingestion -> Lake/Warehouse -> Transforms -> Dashboards/ML",
      
      explanation: "High-level data platform path.",
      conceptIds: ["de-producers", "de-pipelines", "de-storage-layers", "de-consumers"],
    }),
  ],
  commonMistakes: [
    mistake("de-landscape-warehouse-only", "Assuming a warehouse alone is a platform", "Tool-centric thinking", "Include ingestion, quality, and orchestration.", ["de-pipelines", "de-storage-layers"]),
    mistake("de-landscape-ignore-producers", "Designing pipelines without producer contracts", "Breaking changes surprise DE", "Document schemas and SLAs with producers.", ["de-producers"])
  ],
  exercises: [
    exercise({
      id: "de-landscape-exercise",
      title: "Sketch your platform",
      instructions: [
        "Create a diagram for a business event (e.g., order placed).",
        "Label producer, pipeline, storage, and consumer, then verify the data path.",
      ],
      hints: ["Keep to one event", "Name concrete systems"],
      expectedOutcome: "One annotated flow covering all four roles.",
      conceptIds: ["de-producers", "de-pipelines", "de-storage-layers", "de-consumers"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-landscape", [
    "de-producers", "de-pipelines", "de-storage-layers", "de-consumers", "de-batch-vs-stream-overview"
  ], ["concept-understanding", "architecture-reasoning", "practical-scenario", "debugging", "configuration-analysis"]),
});


const t2 = topic({
  id: "de-fundamentals",
  title: "Data Engineering Fundamentals",
  aliases: ["de fundamentals", "data engineering basics qualified"],
  description: "Core principles: schemas, SLAs, idempotency, and reproducibility.",
  difficulty: "beginner",
  learningOrder: 2,
  prerequisiteIds: ["de-landscape"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react"],
  concepts: [
    concept({ id: "de-schemas", title: "Schemas", description: "Structured contracts for fields and types." }),
    concept({ id: "de-sla-slo", title: "SLAs and SLOs", description: "Freshness and availability targets for data products." }),
    concept({ id: "de-idempotency", title: "Idempotency", description: "Re-running a job should not corrupt outputs." }),
    concept({ id: "de-reproducibility", title: "Reproducibility", description: "Rebuild datasets from tracked inputs and code." }),
    concept({ id: "de-partitioning", title: "Partitioning", description: "Split data by time/key for pruneable reads." }),
    concept({ id: "de-late-data", title: "Late Data", description: "Events arriving after a nominal watermark." })
  ],
  learningObjectives: ["Define schema and freshness targets", "Design idempotent loads"],
  practicalArtifacts: [
    artifact({
      id: "de-fundamentals-contract",
      type: "case-study",
      title: "Orders daily table contract",
      
      content: "Table: orders_daily\nGrain: order_id\nSLA: available by 06:00 UTC\nLoad: idempotent upsert by order_id",
      expectedOutput: "Clear grain, SLA, and idempotent load rule",
      explanation: "Captures fundamentals as an actionable contract.",
      conceptIds: ["de-schemas", "de-sla-slo", "de-idempotency"],
    }),
  ],
  commonMistakes: [
    mistake("de-fund-append-dupes", "Appending the same batch twice", "No idempotent keys", "Upsert or partition-overwrite safely.", ["de-idempotency"]),
    mistake("de-fund-no-grain", "Publishing tables without declared grain", "Ambiguous metrics", "Document the grain explicitly.", ["de-schemas"])
  ],
  exercises: [
    exercise({
      id: "de-fundamentals-exercise",
      title: "Write a dataset contract",
      instructions: ["For clicks_hourly, define grain, SLA, partitioning, and late-data policy."],
      hints: ["Grain might be user_id + event_ts hour", "State how late events are handled"],
      expectedOutcome: "A short contract covering the four fundamentals.",
      conceptIds: ["de-schemas", "de-sla-slo", "de-partitioning", "de-late-data"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-fundamentals", [
    "de-schemas", "de-sla-slo", "de-idempotency", "de-reproducibility", "de-partitioning"
  ], ["concept-understanding", "architecture-reasoning", "practical-scenario", "debugging", "expected-output"]),
});


const t3 = topic({
  id: "de-etl-and-elt",
  title: "ETL and ELT",
  aliases: ["etl", "elt", "transform patterns"],
  description: "Compare transform-before-load vs load-then-transform patterns.",
  difficulty: "beginner",
  learningOrder: 3,
  prerequisiteIds: ["de-fundamentals"],
  relatedTopicIds: [],
  contaminationTerms: ["kubernetes pod", "react hooks"],
  concepts: [
    concept({ id: "de-etl", title: "ETL", description: "Transform before loading into the target system." }),
    concept({ id: "de-elt", title: "ELT", description: "Load raw first, transform inside the warehouse/lakehouse." }),
    concept({ id: "de-staging", title: "Staging Areas", description: "Landing zones for raw or lightly processed data." }),
    concept({ id: "de-business-transforms", title: "Business Transforms", description: "Apply conforming dimensions and metrics rules." }),
    concept({ id: "de-schema-evolution", title: "Schema Evolution", description: "Handle additive and breaking field changes." }),
    concept({ id: "de-tooling-fit", title: "Pattern Fit", description: "Choose ETL vs ELT based on compute location and team skills." })
  ],
  learningObjectives: ["Differentiate ETL and ELT", "Place staging and transforms intentionally"],
  practicalArtifacts: [
    artifact({
      id: "de-elt-flow",
      type: "workflow",
      title: "ELT for clicks",
      
      content: "Extract from API -> Load raw JSON to lake -> Transform with SQL/dbt into clicks_clean",
      expectedOutput: "Raw and curated layers both exist",
      explanation: "Classic ELT split between load and transform.",
      conceptIds: ["de-elt", "de-staging", "de-business-transforms"],
    }),
  ],
  commonMistakes: [
    mistake("de-etl-discard-raw", "Throwing away raw payloads after ETL", "Storage cost fears", "Keep raw/landing for reprocessing.", ["de-staging", "de-etl"]),
    mistake("de-elt-transform-in-bi", "Doing heavy transforms only in BI tools", "Dashboard logic sprawl", "Materialize curated models in the warehouse.", ["de-business-transforms", "de-elt"])
  ],
  exercises: [
    exercise({
      id: "de-etl-exercise",
      title: "Choose ETL or ELT",
      instructions: ["For a legacy ERP CSV and a cloud warehouse, recommend ETL or ELT with rationale.", "List staging and curated outputs."],
      hints: ["Warehouse SQL strength favors ELT", "Heavy proprietary transforms may stay ETL"],
      expectedOutcome: "A justified pattern choice with layer names.",
      conceptIds: ["de-etl", "de-elt", "de-tooling-fit", "de-staging"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-etl-and-elt", [
    "de-etl", "de-elt", "de-staging", "de-business-transforms", "de-schema-evolution"
  ], ["concept-understanding", "architecture-reasoning", "practical-scenario", "debugging", "configuration-analysis"]),
});


const t4 = topic({
  id: "de-batch-and-streaming",
  title: "Batch and Streaming",
  aliases: ["batch pipelines", "streaming pipelines"],
  description: "Design for latency needs using batch jobs and streaming systems.",
  difficulty: "beginner",
  learningOrder: 4,
  prerequisiteIds: ["de-etl-and-elt"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react"],
  concepts: [
    concept({ id: "de-batch-jobs", title: "Batch Jobs", description: "Process bounded datasets on a schedule." }),
    concept({ id: "de-streaming-jobs", title: "Streaming Jobs", description: "Process unbounded event streams continuously." }),
    concept({ id: "de-microbatch", title: "Micro-batch", description: "Small frequent batches approximating stream freshness." }),
    concept({ id: "de-watermarks", title: "Watermarks", description: "Track event-time progress for late data." }),
    concept({ id: "de-exactly-once", title: "Delivery Semantics", description: "At-least-once vs exactly-once effects on sinks." }),
    concept({ id: "de-latency-cost", title: "Latency vs Cost", description: "Faster freshness usually costs more compute." })
  ],
  learningObjectives: ["Pick batch vs streaming for a use case", "Explain watermarks at a high level"],
  practicalArtifacts: [
    artifact({
      id: "de-batch-stream-matrix",
      type: "case-study",
      title: "Freshness decision matrix",
      
      content: "Daily finance close -> batch\nFraud alerts -> streaming\nHourly product metrics -> micro-batch",
      expectedOutput: "Matched latency needs to processing style",
      explanation: "Chooses processing mode from freshness requirements.",
      conceptIds: ["de-batch-jobs", "de-streaming-jobs", "de-microbatch", "de-latency-cost"],
    }),
  ],
  commonMistakes: [
    mistake("de-stream-everything", "Streaming every pipeline by default", "Hype-driven design", "Use batch when SLA allows.", ["de-latency-cost", "de-batch-jobs"]),
    mistake("de-stream-ignore-late", "Ignoring late events in event-time jobs", "Assuming arrival order", "Define watermark and late-data policy.", ["de-watermarks"])
  ],
  exercises: [
    exercise({
      id: "de-batch-stream-exercise",
      title: "Classify three pipelines",
      instructions: ["For billing, clickstream personalization, and weekly exec report, choose batch/stream/micro-batch.", "Note the freshness target."],
      hints: ["Personalization is usually low latency", "Exec reports tolerate delay"],
      expectedOutcome: "Three justified processing choices.",
      conceptIds: ["de-batch-jobs", "de-streaming-jobs", "de-microbatch"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-batch-and-streaming", [
    "de-batch-jobs", "de-streaming-jobs", "de-microbatch", "de-watermarks", "de-exactly-once"
  ], ["concept-understanding", "architecture-reasoning", "practical-scenario", "debugging", "expected-output"]),
});


const t5 = topic({
  id: "de-lakes-and-warehouses",
  title: "Data Lakes and Warehouses",
  aliases: ["data lake", "data warehouse", "lakehouse"],
  description: "Store and serve analytical data across lakes, warehouses, and lakehouses.",
  difficulty: "beginner",
  learningOrder: 5,
  prerequisiteIds: ["de-batch-and-streaming"],
  relatedTopicIds: [],
  contaminationTerms: ["kubernetes", "react hooks"],
  concepts: [
    concept({ id: "de-data-lake", title: "Data Lake", description: "Store diverse raw and processed objects cheaply." }),
    concept({ id: "de-data-warehouse", title: "Data Warehouse", description: "Governed analytical tables optimized for SQL." }),
    concept({ id: "de-lakehouse", title: "Lakehouse", description: "Warehouse-like reliability on lake storage." }),
    concept({ id: "de-medallion", title: "Medallion Layers", description: "Bronze/silver/gold (raw/cleaned/curated) progression." }),
    concept({ id: "de-file-formats", title: "Columnar Formats", description: "Parquet/ORC for analytical scans." }),
    concept({ id: "de-table-formats", title: "Table Formats", description: "Iceberg/Delta/Hudi add transactions and evolution." })
  ],
  learningObjectives: ["Contrast lake vs warehouse", "Apply medallion layering"],
  practicalArtifacts: [
    artifact({
      id: "de-medallion-map",
      type: "diagram",
      title: "Medallion layout",
      
      content: "bronze raw events -> silver cleaned events -> gold order_metrics",
      
      explanation: "Progressive refinement across layers.",
      conceptIds: ["de-medallion", "de-data-lake", "de-data-warehouse"],
    }),
  ],
  commonMistakes: [
    mistake("de-lake-swamp", "Dumping files without catalogs or contracts", "Lake becomes unusable", "Register tables and document owners.", ["de-data-lake", "de-medallion"]),
    mistake("de-warehouse-raw-only", "Loading only curated data and losing raw history", "Reprocessing becomes impossible", "Retain a raw/bronze layer.", ["de-medallion"])
  ],
  exercises: [
    exercise({
      id: "de-lakes-exercise",
      title: "Place the datasets",
      instructions: ["Assign raw JSON clicks, cleaned clicks, and revenue_by_day to medallion layers.", "Say whether gold lives in warehouse or lakehouse tables."],
      hints: ["Raw -> bronze", "Business aggregates -> gold"],
      expectedOutcome: "Correct layer assignment with serving location note.",
      conceptIds: ["de-medallion", "de-lakehouse", "de-data-warehouse"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-lakes-and-warehouses", [
    "de-data-lake", "de-data-warehouse", "de-lakehouse", "de-medallion", "de-file-formats"
  ], ["concept-understanding", "architecture-reasoning", "practical-scenario", "configuration-analysis", "debugging"]),
});


const t6 = topic({
  id: "de-data-modeling",
  title: "Data Modeling",
  aliases: ["dimensional modeling", "star schema", "analytics modeling"],
  description: "Model analytical tables with facts, dimensions, and clear grain.",
  difficulty: "intermediate",
  learningOrder: 6,
  prerequisiteIds: ["de-lakes-and-warehouses"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react"],
  concepts: [
    concept({ id: "de-grain", title: "Grain", description: "What a single fact row represents." }),
    concept({ id: "de-facts", title: "Fact Tables", description: "Numeric measurements at a declared grain." }),
    concept({ id: "de-dimensions", title: "Dimension Tables", description: "Descriptive attributes for filtering and grouping." }),
    concept({ id: "de-star-schema", title: "Star Schema", description: "Facts surrounded by dimensions." }),
    concept({ id: "de-scd", title: "Slowly Changing Dimensions", description: "Track attribute changes over time." }),
    concept({ id: "de-conformed", title: "Conformed Dimensions", description: "Shared dimensions across facts." })
  ],
  learningObjectives: ["Declare grain for a fact", "Design a simple star schema"],
  practicalArtifacts: [
    artifact({
      id: "de-star-orders",
      type: "diagram",
      title: "Orders star",
      
      content: "fact_orders(order_id, order_ts, amount, customer_sk, product_sk)\ndim_customer / dim_product",
      
      explanation: "Fact with two dimensions at order grain.",
      conceptIds: ["de-facts", "de-dimensions", "de-star-schema", "de-grain"],
    }),
  ],
  commonMistakes: [
    mistake("de-model-mixed-grain", "Mixing order and line-item grains in one fact", "Reporting double counts", "Separate facts or choose one grain.", ["de-grain", "de-facts"]),
    mistake("de-model-wide-junk", "One enormous denormalized table for everything", "Hard to change slowly", "Prefer dimensional structure for analytics.", ["de-star-schema"])
  ],
  exercises: [
    exercise({
      id: "de-modeling-exercise",
      title: "Model subscriptions",
      instructions: ["Design fact_subscription_events and two dimensions.", "State the grain and one SCD need."],
      hints: ["Event grain might be subscription_id + event_ts", "Plan changes are often SCD2"],
      expectedOutcome: "Star sketch with grain and SCD note.",
      conceptIds: ["de-grain", "de-facts", "de-dimensions", "de-scd"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-data-modeling", [
    "de-grain", "de-facts", "de-dimensions", "de-star-schema", "de-scd"
  ], ["concept-understanding", "architecture-reasoning", "practical-scenario", "debugging", "expected-output"]),
});


const t7 = topic({
  id: "de-apache-spark",
  title: "Apache Spark",
  aliases: ["spark", "spark transforms", "dataframes spark"],
  description: "Transform large datasets with Spark DataFrames and jobs.",
  difficulty: "intermediate",
  learningOrder: 7,
  prerequisiteIds: ["de-data-modeling"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react hooks", "kubernetes"],
  concepts: [
    concept({ id: "de-spark-dataframe", title: "Spark DataFrames", description: "Distributed tables with lazy transformations." }),
    concept({ id: "de-spark-transformations", title: "Transformations", description: "map/filter/select/groupBy style operations." }),
    concept({ id: "de-spark-actions", title: "Actions", description: "Trigger computation (count, write, collect)." }),
    concept({ id: "de-spark-partitions", title: "Spark Partitions", description: "Parallelism unit influencing performance." }),
    concept({ id: "de-spark-shuffle", title: "Shuffles", description: "Expensive redistributions during joins/aggs." }),
    concept({ id: "de-spark-job", title: "Spark Jobs", description: "Application runs composed of stages and tasks." })
  ],
  learningObjectives: ["Write basic DataFrame transforms", "Recognize shuffle-heavy operations"],
  practicalArtifacts: [
    artifact({
      id: "de-spark-transform",
      type: "code",
      title: "Filter and aggregate orders",
      language: "python",
      content: "orders = spark.read.parquet('/lake/orders')\npayments = (\n  orders.filter('status = \\\"paid\\\"')\n        .groupBy('customer_id')\n        .sum('amount')\n)\npayments.write.mode('overwrite').parquet('/lake/gold/payments')",
      expectedOutput: "Parquet dataset aggregated by customer_id",
      explanation: "Lazy transforms followed by a write action.",
      conceptIds: ["de-spark-dataframe", "de-spark-transformations", "de-spark-actions"],
    }),
  ],
  commonMistakes: [
    mistake("de-spark-collect", "collect() on huge DataFrames", "Wanting to inspect everything", "Use limit/sample or write outputs.", ["de-spark-actions"]),
    mistake("de-spark-skew", "Ignoring skewed join keys", "One task runs forever", "Repartition or salt hot keys when needed.", ["de-spark-shuffle", "de-spark-partitions"])
  ],
  exercises: [
    exercise({
      id: "de-spark-exercise",
      title: "Clean clicks in Spark",
      instructions: ["Read bronze clicks, filter null user_id, aggregate counts by day.", "Write to silver."],
      hints: ["withColumn / groupBy", "mode overwrite for idempotent batch"],
      expectedOutcome: "Silver aggregate dataset written successfully.",
      conceptIds: ["de-spark-dataframe", "de-spark-transformations", "de-spark-actions"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-apache-spark", [
    "de-spark-dataframe", "de-spark-transformations", "de-spark-actions", "de-spark-partitions", "de-spark-shuffle"
  ], ["concept-understanding", "code-interpretation", "debugging", "practical-scenario", "expected-output"]),
});


const t8 = topic({
  id: "de-airflow-orchestration",
  title: "Workflow Orchestration with Airflow",
  aliases: ["airflow", "orchestration", "dags"],
  description: "Schedule and depend tasks with Airflow DAGs.",
  difficulty: "intermediate",
  learningOrder: 8,
  prerequisiteIds: ["de-apache-spark"],
  relatedTopicIds: [],
  contaminationTerms: ["react", "kubernetes ingress as default"],
  concepts: [
    concept({ id: "de-airflow-dag", title: "DAGs", description: "Directed graphs of tasks with schedules." }),
    concept({ id: "de-airflow-operators", title: "Operators", description: "Task templates that do work." }),
    concept({ id: "de-airflow-dependencies", title: "Dependencies", description: "Upstream/downstream relationships." }),
    concept({ id: "de-airflow-sensors", title: "Sensors", description: "Wait for external conditions." }),
    concept({ id: "de-airflow-retries", title: "Retries and SLAs", description: "Resilience and lateness signals." }),
    concept({ id: "de-airflow-idempotent-tasks", title: "Idempotent Tasks", description: "Safe DAG reruns." })
  ],
  learningObjectives: ["Define a DAG with dependencies", "Configure retries for flaky tasks"],
  practicalArtifacts: [
    artifact({
      id: "de-airflow-dag",
      type: "code",
      title: "Ingest-transform-publish DAG sketch",
      language: "python",
      content: "ingest >> transform >> publish\n# schedule: 0 6 * * *\n# retries: 2",
      expectedOutput: "Linear DAG running daily at 06:00",
      explanation: "Dependencies encode pipeline order.",
      conceptIds: ["de-airflow-dag", "de-airflow-dependencies", "de-airflow-retries"],
    }),
  ],
  commonMistakes: [
    mistake("de-airflow-logic-in-dag", "Heavy data processing inside DAG parsing", "Slow scheduler", "Keep top-level DAG thin; put work in operators.", ["de-airflow-dag", "de-airflow-operators"]),
    mistake("de-airflow-no-retries", "No retries on transient network tasks", "Noisy overnight failures", "Set bounded retries with backoff.", ["de-airflow-retries"])
  ],
  exercises: [
    exercise({
      id: "de-airflow-exercise",
      title: "Three-task DAG",
      instructions: ["Create tasks extract, load_raw, build_gold with dependencies.", "Add a sensor waiting for the source file."],
      hints: ["extract >> load_raw >> build_gold", "FileSensor before extract"],
      expectedOutcome: "DAG with sensor and linear dependencies.",
      conceptIds: ["de-airflow-dag", "de-airflow-sensors", "de-airflow-dependencies"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-airflow-orchestration", [
    "de-airflow-dag", "de-airflow-operators", "de-airflow-dependencies", "de-airflow-sensors", "de-airflow-retries"
  ], ["concept-understanding", "configuration-analysis", "practical-scenario", "debugging", "architecture-reasoning"]),
});


const t9 = topic({
  id: "de-data-quality-and-observability",
  title: "Data Quality and Observability",
  aliases: ["data quality", "observability", "data tests"],
  description: "Test freshness, volume, and schema; observe pipelines in production.",
  difficulty: "intermediate",
  learningOrder: 9,
  prerequisiteIds: ["de-airflow-orchestration"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react hooks"],
  concepts: [
    concept({ id: "de-dq-freshness", title: "Freshness Checks", description: "Alert when data is later than SLA." }),
    concept({ id: "de-dq-volume", title: "Volume Checks", description: "Detect empty or anomalous row counts." }),
    concept({ id: "de-dq-schema", title: "Schema Checks", description: "Fail on unexpected breaking changes." }),
    concept({ id: "de-dq-null-rules", title: "Null and Range Rules", description: "Validate field-level expectations." }),
    concept({ id: "de-lineage", title: "Lineage", description: "Trace datasets back to upstream jobs." }),
    concept({ id: "de-incident-response", title: "Incident Response", description: "Triage broken data products quickly." })
  ],
  learningObjectives: ["Define practical DQ checks", "Use lineage during incidents"],
  practicalArtifacts: [
    artifact({
      id: "de-dq-checks",
      type: "workflow",
      title: "Daily DQ gate",
      
      content: "1) row_count > 0\n2) max(event_ts) within SLA\n3) required columns present\n4) null(user_id) < 1%",
      expectedOutput: "Pipeline fails closed when checks fail",
      explanation: "Minimal quality gate before publishing gold.",
      conceptIds: ["de-dq-volume", "de-dq-freshness", "de-dq-schema", "de-dq-null-rules"],
    }),
  ],
  commonMistakes: [
    mistake("de-dq-only-rowcount", "Only checking row_count > 0", "Missing silent corruption", "Add schema, null, and freshness checks.", ["de-dq-schema", "de-dq-freshness"]),
    mistake("de-dq-no-owner", "Alerts with no dataset owner", "Pages go nowhere", "Attach owners via catalog/lineage metadata.", ["de-lineage", "de-incident-response"])
  ],
  exercises: [
    exercise({
      id: "de-dq-exercise",
      title: "Quality suite for orders_daily",
      instructions: ["List four checks with thresholds.", "Describe who is paged when freshness fails."],
      hints: ["Include freshness and null rules", "Name an owning team"],
      expectedOutcome: "Actionable DQ suite with ownership.",
      conceptIds: ["de-dq-freshness", "de-dq-null-rules", "de-incident-response"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-data-quality-and-observability", [
    "de-dq-freshness", "de-dq-volume", "de-dq-schema", "de-dq-null-rules", "de-lineage"
  ], ["concept-understanding", "practical-scenario", "debugging", "architecture-reasoning", "expected-output"]),
});


const t10 = topic({
  id: "de-end-to-end-pipeline-project",
  title: "End-to-End Data Pipeline Project",
  aliases: ["de project", "e2e pipeline", "data engineering capstone"],
  description: "Deliver an ingest\u2192transform\u2192serve pipeline with quality gates.",
  difficulty: "intermediate",
  learningOrder: 10,
  prerequisiteIds: ["de-data-quality-and-observability"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc as filler", "react hooks", "kubernetes rbac filler"],
  concepts: [
    concept({ id: "de-project-requirements", title: "Pipeline Requirements", description: "Define source, grain, SLA, and consumers." }),
    concept({ id: "de-project-architecture", title: "Pipeline Architecture", description: "Choose lake/warehouse layers and compute." }),
    concept({ id: "de-project-orchestration", title: "Orchestrated Delivery", description: "Schedule end-to-end dependencies." }),
    concept({ id: "de-project-quality-gate", title: "Release Quality Gate", description: "Block publish on failed checks." }),
    concept({ id: "de-project-docs", title: "Data Product Docs", description: "Document contract, owners, and runbook." }),
    concept({ id: "de-project-demo", title: "Demo Path", description: "Prove raw\u2192gold and a failure alert." })
  ],
  learningObjectives: ["Ship an end-to-end pipeline", "Include orchestration and DQ gates"],
  practicalArtifacts: [
    artifact({
      id: "de-e2e-blueprint",
      type: "workflow",
      title: "Orders pipeline blueprint",
      
      content: "API extract -> bronze -> Spark silver -> warehouse gold -> Airflow DAG -> DQ gate -> dashboard",
      expectedOutput: "Runnable path with a quality gate before serving",
      explanation: "Capstone architecture stitching prior topics.",
      conceptIds: ["de-project-architecture", "de-project-orchestration", "de-project-quality-gate"],
    }),
  ],
  commonMistakes: [
    mistake("de-project-no-bronze", "Jumping straight to gold tables", "Demo pressure", "Keep raw landing for replay.", ["de-project-architecture"]),
    mistake("de-project-no-runbook", "No failure runbook", "On-call thrash", "Document first-response steps.", ["de-project-docs", "de-project-demo"])
  ],
  exercises: [
    exercise({
      id: "de-e2e-exercise",
      title: "Build the orders pipeline",
      instructions: ["Implement bronze/silver/gold for orders.", "Orchestrate daily and fail on freshness breach."],
      hints: ["Reuse Spark + Airflow topics", "Publish docs with owner + SLA"],
      expectedOutcome: "Demoable pipeline with DQ-gated gold table.",
      conceptIds: ["de-project-requirements", "de-project-orchestration", "de-project-quality-gate", "de-project-demo"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("de-end-to-end-pipeline-project", [
    "de-project-requirements", "de-project-architecture", "de-project-orchestration", "de-project-quality-gate", "de-project-docs"
  ], ["architecture-reasoning", "practical-scenario", "configuration-analysis", "debugging", "concept-understanding"]),
});


export const dataEngineeringKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-data-engineering",
  title: "Data Engineering",
  aliases: [
    "data engineering",
    "learn data engineering",
    "data engineer",
    "data pipelines",
  ],
  category: "Data",
  description:
    "Canonical data engineering curriculum from landscape and fundamentals through Spark, Airflow, quality, and an end-to-end pipeline project.",
  topics: [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10],
});

