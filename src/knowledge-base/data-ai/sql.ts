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
  id: "sql-relational-database-concepts",
  title: "Relational Database Concepts",
  aliases: ["relational model", "tables and keys", "rdbms concepts"],
  description: "Tables, rows, columns, keys, and relationships that underpin SQL.",
  difficulty: "beginner",
  learningOrder: 1,
  prerequisiteIds: [],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc", "react", "kubernetes", "python class"],
  concepts: [
    concept({ id: "sql-tables", title: "Tables", description: "Relations stored as named tables with fixed columns." }),
    concept({ id: "sql-rows-columns", title: "Rows and Columns", description: "Rows are records; columns are typed attributes." }),
    concept({ id: "sql-primary-keys", title: "Primary Keys", description: "Unique identifiers for each row." }),
    concept({ id: "sql-foreign-keys", title: "Foreign Keys", description: "References that enforce relationships between tables." }),
    concept({ id: "sql-normalization-basics", title: "Normalization Basics", description: "Reduce redundant storage with related tables." }),
    concept({ id: "sql-null", title: "NULL Semantics", description: "Unknown or missing values behave differently from empty strings." })
  ],
  learningObjectives: ["Explain tables, keys, and relationships", "Distinguish NULL from empty values"],
  practicalArtifacts: [
    artifact({
      id: "sql-relational-erd-snippet",
      type: "diagram",
      title: "Orders-customers relationship",
      
      content: "customers(id PK) → orders(id PK, customer_id FK)\n1 customer → many orders",
      
      explanation: "Shows primary/foreign key relationship between customers and orders.",
      conceptIds: ["sql-primary-keys", "sql-foreign-keys", "sql-tables"],
    }),
  ],
  commonMistakes: [
    mistake("sql-rel-pk-null", "Allowing NULL in a primary key", "Confusing uniqueness with optionality", "Primary keys must be NOT NULL and unique.", ["sql-primary-keys", "sql-null"]),
    mistake("sql-rel-fk-orphan", "Inserting orphan foreign keys", "Skipping referential checks", "Ensure parent rows exist before child inserts.", ["sql-foreign-keys"])
  ],
  exercises: [
    exercise({
      id: "sql-rel-model-exercise",
      title: "Model a blog schema",
      instructions: ["Define tables for authors and posts with PK/FK.", "Mark which columns should disallow NULL."],
      hints: ["posts.author_id references authors.id", "Titles are usually NOT NULL"],
      expectedOutcome: "A two-table schema with keys and nullability notes.",
      conceptIds: ["sql-tables", "sql-primary-keys", "sql-foreign-keys", "sql-null"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-relational-database-concepts", [
    "sql-tables", "sql-rows-columns", "sql-primary-keys", "sql-foreign-keys", "sql-normalization-basics"
  ], ["concept-understanding", "architecture-reasoning", "debugging", "practical-scenario", "query-interpretation"]),
});


const t2 = topic({
  id: "sql-select-and-from",
  title: "SELECT and FROM",
  aliases: ["select", "from clause", "query projection"],
  description: "Project columns and choose source tables with SELECT and FROM.",
  difficulty: "beginner",
  learningOrder: 2,
  prerequisiteIds: ["sql-relational-database-concepts"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc", "react hooks", "kubernetes"],
  concepts: [
    concept({ id: "sql-select-list", title: "Select List", description: "Choose columns or expressions to return." }),
    concept({ id: "sql-from-clause", title: "FROM Clause", description: "Identify the source table or join root." }),
    concept({ id: "sql-column-aliases", title: "Column Aliases", description: "Rename outputs with AS for clarity." }),
    concept({ id: "sql-distinct", title: "DISTINCT", description: "Remove duplicate result rows when needed." }),
    concept({ id: "sql-select-expressions", title: "Select Expressions", description: "Compute derived columns in the select list." }),
    concept({ id: "sql-result-sets", title: "Result Sets", description: "Queries return tabular result sets." })
  ],
  learningObjectives: ["Write SELECT projections", "Use aliases and DISTINCT appropriately"],
  practicalArtifacts: [
    artifact({
      id: "sql-select-basic",
      type: "query",
      title: "Project customer names",
      language: "sql",
      content: "SELECT id, name AS customer_name\nFROM customers;",
      expectedOutput: "Rows with id and customer_name columns",
      explanation: "Projects two columns and aliases name.",
      conceptIds: ["sql-select-list", "sql-from-clause", "sql-column-aliases"],
    }),
  ],
  commonMistakes: [
    mistake("sql-select-star-prod", "Using SELECT * in production reports", "Convenience during exploration", "Project only needed columns.", ["sql-select-list"]),
    mistake("sql-select-alias-where", "Referencing SELECT aliases in WHERE", "Forgetting logical query order", "Repeat the expression or use a subquery.", ["sql-column-aliases"])
  ],
  exercises: [
    exercise({
      id: "sql-select-exercise",
      title: "Distinct cities",
      instructions: ["Return distinct city values from customers.", "Alias the column as city_name."],
      hints: ["DISTINCT applies to selected rows", "AS renames the output"],
      expectedOutcome: "SELECT DISTINCT city AS city_name FROM customers;",
      conceptIds: ["sql-distinct", "sql-column-aliases", "sql-from-clause"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-select-and-from", [
    "sql-select-list", "sql-from-clause", "sql-column-aliases", "sql-distinct", "sql-select-expressions"
  ], ["concept-understanding", "query-interpretation", "expected-output", "debugging", "practical-scenario"]),
});


const t3 = topic({
  id: "sql-filtering-with-where",
  title: "Filtering with WHERE",
  aliases: ["where clause", "filtering rows", "predicates"],
  description: "Restrict rows with comparison operators, AND/OR, IN, BETWEEN, and LIKE.",
  difficulty: "beginner",
  learningOrder: 3,
  prerequisiteIds: ["sql-select-and-from"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc", "kubernetes pod"],
  concepts: [
    concept({ id: "sql-where", title: "WHERE Clause", description: "Filter rows before aggregation." }),
    concept({ id: "sql-comparison-ops", title: "Comparison Operators", description: "Use =, <>, <, >, <=, >= on values." }),
    concept({ id: "sql-logical-ops", title: "AND OR NOT", description: "Combine predicates with Boolean logic." }),
    concept({ id: "sql-in-between", title: "IN and BETWEEN", description: "Concise membership and range checks." }),
    concept({ id: "sql-like", title: "LIKE Patterns", description: "Match text with % and _ wildcards." }),
    concept({ id: "sql-null-filters", title: "Filtering NULLs", description: "Use IS NULL / IS NOT NULL, never = NULL." })
  ],
  learningObjectives: ["Filter rows with precise predicates", "Handle NULL correctly in filters"],
  practicalArtifacts: [
    artifact({
      id: "sql-where-active",
      type: "query",
      title: "Active high-value orders",
      language: "sql",
      content: "SELECT id, total\nFROM orders\nWHERE status = 'active'\n  AND total >= 100;",
      expectedOutput: "Active orders with total at least 100",
      explanation: "Combines equality and comparison filters with AND.",
      conceptIds: ["sql-where", "sql-comparison-ops", "sql-logical-ops"],
    }),
  ],
  commonMistakes: [
    mistake("sql-where-eq-null", "Writing WHERE col = NULL", "Treating NULL like a normal value", "Use IS NULL instead.", ["sql-null-filters"]),
    mistake("sql-where-or-precedence", "Misreading AND/OR precedence", "Missing parentheses", "Parenthesize mixed AND/OR predicates.", ["sql-logical-ops"])
  ],
  exercises: [
    exercise({
      id: "sql-where-exercise",
      title: "Filter customers",
      instructions: ["Find customers in cities starting with 'San' and with score BETWEEN 70 AND 90.", "Exclude rows where email IS NULL."],
      hints: ["LIKE 'San%'", "IS NOT NULL for email"],
      expectedOutcome: "A WHERE clause using LIKE, BETWEEN, and IS NOT NULL.",
      conceptIds: ["sql-where", "sql-like", "sql-in-between", "sql-null-filters"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-filtering-with-where", [
    "sql-where", "sql-comparison-ops", "sql-logical-ops", "sql-in-between", "sql-like"
  ], ["concept-understanding", "query-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t4 = topic({
  id: "sql-sorting-with-order-by",
  title: "Sorting with ORDER BY",
  aliases: ["order by", "sorting results"],
  description: "Sort result rows ascending or descending, including multi-column sorts.",
  difficulty: "beginner",
  learningOrder: 4,
  prerequisiteIds: ["sql-filtering-with-where"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc"],
  concepts: [
    concept({ id: "sql-order-by", title: "ORDER BY", description: "Sort the final result set." }),
    concept({ id: "sql-asc-desc", title: "ASC and DESC", description: "Control sort direction per column." }),
    concept({ id: "sql-multi-sort", title: "Multi-column Sort", description: "Break ties with secondary sort keys." }),
    concept({ id: "sql-null-sort", title: "NULL Sort Behavior", description: "NULL ordering depends on the engine." }),
    concept({ id: "sql-order-alias", title: "Ordering by Alias", description: "Some engines allow ORDER BY select aliases." }),
    concept({ id: "sql-stable-sort-needs", title: "Deterministic Ordering", description: "Add a unique key when pagination requires stability." })
  ],
  learningObjectives: ["Sort single and multiple columns", "Choose ASC/DESC deliberately"],
  practicalArtifacts: [
    artifact({
      id: "sql-order-top",
      type: "query",
      title: "Top orders by total",
      language: "sql",
      content: "SELECT id, total\nFROM orders\nORDER BY total DESC, id ASC;",
      expectedOutput: "Orders from largest total to smallest, ties by id",
      explanation: "Primary DESC sort with deterministic tie-breaker.",
      conceptIds: ["sql-order-by", "sql-asc-desc", "sql-multi-sort", "sql-stable-sort-needs"],
    }),
  ],
  commonMistakes: [
    mistake("sql-order-before-filter", "Assuming ORDER BY affects WHERE", "Confusing logical query phases", "WHERE filters before sorting.", ["sql-order-by"]),
    mistake("sql-order-unstable", "Paginating without a unique tie-breaker", "Pages shift between requests", "Add a unique column to ORDER BY.", ["sql-stable-sort-needs"])
  ],
  exercises: [
    exercise({
      id: "sql-order-exercise",
      title: "Sort employees",
      instructions: ["List employees by department ASC then salary DESC.", "Include id as a final tie-breaker."],
      hints: ["Multiple columns in ORDER BY", "Mix ASC and DESC"],
      expectedOutcome: "ORDER BY department ASC, salary DESC, id ASC",
      conceptIds: ["sql-order-by", "sql-multi-sort", "sql-asc-desc"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-sorting-with-order-by", [
    "sql-order-by", "sql-asc-desc", "sql-multi-sort", "sql-null-sort", "sql-order-alias"
  ], ["concept-understanding", "query-interpretation", "expected-output", "debugging", "practical-scenario"]),
});


const t5 = topic({
  id: "sql-aggregation",
  title: "Aggregation",
  aliases: ["aggregate functions", "count sum avg"],
  description: "Summarize rows with COUNT, SUM, AVG, MIN, and MAX.",
  difficulty: "beginner",
  learningOrder: 5,
  prerequisiteIds: ["sql-sorting-with-order-by"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc", "spark"],
  concepts: [
    concept({ id: "sql-count", title: "COUNT", description: "Count rows or non-null expressions." }),
    concept({ id: "sql-sum-avg", title: "SUM and AVG", description: "Numeric totals and means." }),
    concept({ id: "sql-min-max", title: "MIN and MAX", description: "Extreme values in a set." }),
    concept({ id: "sql-agg-null", title: "Aggregates and NULL", description: "Most aggregates ignore NULL inputs." }),
    concept({ id: "sql-count-star-vs-col", title: "COUNT(*) vs COUNT(col)", description: "COUNT(*) counts rows; COUNT(col) skips NULL." }),
    concept({ id: "sql-agg-without-group", title: "Scalar Aggregation", description: "Aggregates without GROUP BY return one row." })
  ],
  learningObjectives: ["Choose the right aggregate", "Explain NULL behavior in aggregates"],
  practicalArtifacts: [
    artifact({
      id: "sql-agg-revenue",
      type: "query",
      title: "Order revenue summary",
      language: "sql",
      content: "SELECT COUNT(*) AS order_count, SUM(total) AS revenue, AVG(total) AS avg_total\nFROM orders\nWHERE status = 'paid';",
      expectedOutput: "One summary row for paid orders",
      explanation: "Scalar aggregates over a filtered set.",
      conceptIds: ["sql-count", "sql-sum-avg", "sql-agg-without-group"],
    }),
  ],
  commonMistakes: [
    mistake("sql-agg-count-null", "Expecting COUNT(col) to count NULL rows", "Assuming all counts are identical", "Use COUNT(*) when every row matters.", ["sql-count-star-vs-col", "sql-agg-null"]),
    mistake("sql-agg-select-bare", "Selecting non-aggregated columns without GROUP BY", "Engine-specific quirks", "Aggregate or group every selected column.", ["sql-agg-without-group"])
  ],
  exercises: [
    exercise({
      id: "sql-agg-exercise",
      title: "Catalog stats",
      instructions: ["Compute product count, min price, and max price.", "Ignore discontinued products in a WHERE filter."],
      hints: ["MIN/MAX on price", "Filter before aggregating"],
      expectedOutcome: "One row with count/min/max for active products.",
      conceptIds: ["sql-count", "sql-min-max", "sql-agg-without-group"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-aggregation", [
    "sql-count", "sql-sum-avg", "sql-min-max", "sql-agg-null", "sql-count-star-vs-col"
  ], ["concept-understanding", "query-interpretation", "expected-output", "calculation", "practical-scenario"]),
});


const t6 = topic({
  id: "sql-group-by-and-having",
  title: "GROUP BY and HAVING",
  aliases: ["group by", "having clause"],
  description: "Group rows and filter groups with HAVING.",
  difficulty: "beginner",
  learningOrder: 6,
  prerequisiteIds: ["sql-aggregation"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc"],
  concepts: [
    concept({ id: "sql-group-by", title: "GROUP BY", description: "Partition rows into groups for aggregation." }),
    concept({ id: "sql-having", title: "HAVING", description: "Filter groups after aggregation." }),
    concept({ id: "sql-where-vs-having", title: "WHERE vs HAVING", description: "WHERE filters rows; HAVING filters groups." }),
    concept({ id: "sql-group-keys", title: "Grouping Keys", description: "Non-aggregated select columns must be grouping keys." }),
    concept({ id: "sql-multi-group", title: "Multi-column Groups", description: "Group by more than one column." }),
    concept({ id: "sql-having-agg", title: "Aggregates in HAVING", description: "HAVING predicates usually reference aggregates." })
  ],
  learningObjectives: ["Group data correctly", "Choose WHERE vs HAVING"],
  practicalArtifacts: [
    artifact({
      id: "sql-group-dept",
      type: "query",
      title: "Departments with high average salary",
      language: "sql",
      content: "SELECT department, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 80000;",
      expectedOutput: "Departments whose average salary exceeds 80000",
      explanation: "Groups by department then filters groups with HAVING.",
      conceptIds: ["sql-group-by", "sql-having", "sql-where-vs-having"],
    }),
  ],
  commonMistakes: [
    mistake("sql-group-missing-key", "Selecting a non-grouped column", "Wanting detail inside aggregates", "Include the column in GROUP BY or aggregate it.", ["sql-group-keys"]),
    mistake("sql-group-filter-in-where", "Filtering aggregates in WHERE", "Confusing phases", "Move aggregate filters to HAVING.", ["sql-where-vs-having"])
  ],
  exercises: [
    exercise({
      id: "sql-group-exercise",
      title: "Customers with many orders",
      instructions: ["Count orders per customer_id.", "Keep groups with COUNT(*) >= 3."],
      hints: ["GROUP BY customer_id", "HAVING COUNT(*) >= 3"],
      expectedOutcome: "customer_id groups meeting the threshold.",
      conceptIds: ["sql-group-by", "sql-having", "sql-having-agg"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-group-by-and-having", [
    "sql-group-by", "sql-having", "sql-where-vs-having", "sql-group-keys", "sql-multi-group"
  ], ["concept-understanding", "query-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t7 = topic({
  id: "sql-joins",
  title: "JOINs",
  aliases: ["inner join", "left join", "joining tables"],
  description: "Combine related tables with INNER, LEFT, and multi-table joins.",
  difficulty: "beginner",
  learningOrder: 7,
  prerequisiteIds: ["sql-group-by-and-having"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc", "react"],
  concepts: [
    concept({ id: "sql-inner-join", title: "INNER JOIN", description: "Keep matching rows from both sides." }),
    concept({ id: "sql-left-join", title: "LEFT JOIN", description: "Keep all left rows; unmatched right columns are NULL." }),
    concept({ id: "sql-join-predicates", title: "Join Predicates", description: "Express match conditions in ON." }),
    concept({ id: "sql-multi-join", title: "Multi-table Joins", description: "Chain joins across more than two tables." }),
    concept({ id: "sql-join-duplicates", title: "Join Duplication", description: "One-to-many matches multiply rows." }),
    concept({ id: "sql-self-join", title: "Self Joins", description: "Join a table to itself with aliases." })
  ],
  learningObjectives: ["Choose INNER vs LEFT JOIN", "Write correct ON predicates"],
  practicalArtifacts: [
    artifact({
      id: "sql-join-orders",
      type: "query",
      title: "Customers and orders",
      language: "sql",
      content: "SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;",
      expectedOutput: "All customers with order ids or NULL",
      explanation: "LEFT JOIN preserves customers without orders.",
      conceptIds: ["sql-left-join", "sql-join-predicates"],
    }),
  ],
  commonMistakes: [
    mistake("sql-join-filter-left", "Filtering a LEFT JOIN right column in WHERE", "Accidentally turning it into an inner join", "Filter right-side columns in ON or allow NULL carefully.", ["sql-left-join"]),
    mistake("sql-join-missing-on", "Omitting join conditions", "Cartesian products explode", "Always specify ON predicates.", ["sql-join-predicates"])
  ],
  exercises: [
    exercise({
      id: "sql-join-exercise",
      title: "Employees with departments",
      instructions: ["INNER JOIN employees to departments.", "Return employee name and department name."],
      hints: ["Match department_id", "Alias both tables"],
      expectedOutcome: "Names paired with department titles.",
      conceptIds: ["sql-inner-join", "sql-join-predicates"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-joins", [
    "sql-inner-join", "sql-left-join", "sql-join-predicates", "sql-multi-join", "sql-join-duplicates"
  ], ["concept-understanding", "query-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t8 = topic({
  id: "sql-subqueries",
  title: "Subqueries",
  aliases: ["nested queries", "subselect"],
  description: "Nest queries in WHERE, FROM, and SELECT for multi-step logic.",
  difficulty: "intermediate",
  learningOrder: 8,
  prerequisiteIds: ["sql-joins"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc"],
  concepts: [
    concept({ id: "sql-scalar-subquery", title: "Scalar Subqueries", description: "Subqueries that return one value." }),
    concept({ id: "sql-in-subquery", title: "IN Subqueries", description: "Membership tests against a nested result." }),
    concept({ id: "sql-exists", title: "EXISTS", description: "Check whether a correlated subquery returns any row." }),
    concept({ id: "sql-from-subquery", title: "FROM Subqueries", description: "Treat a nested query as a derived table." }),
    concept({ id: "sql-correlated", title: "Correlated Subqueries", description: "Inner query references outer row values." }),
    concept({ id: "sql-subquery-vs-join", title: "Subquery vs JOIN", description: "Choose readability and performance intentionally." })
  ],
  learningObjectives: ["Write scalar and IN subqueries", "Use EXISTS for existence checks"],
  practicalArtifacts: [
    artifact({
      id: "sql-subquery-above-avg",
      type: "query",
      title: "Orders above average",
      language: "sql",
      content: "SELECT id, total\nFROM orders\nWHERE total > (SELECT AVG(total) FROM orders);",
      expectedOutput: "Orders with total above overall average",
      explanation: "Scalar subquery computes the comparison threshold.",
      conceptIds: ["sql-scalar-subquery"],
    }),
  ],
  commonMistakes: [
    mistake("sql-subquery-multi-row", "Using a multi-row subquery where a scalar is required", "Missing IN/EXISTS", "Use IN/EXISTS or aggregate to one value.", ["sql-scalar-subquery", "sql-in-subquery"]),
    mistake("sql-subquery-corr-perf", "Correlated subqueries that re-scan huge tables", "Translating nested loops literally", "Consider JOIN or rewrite when profiles show pain.", ["sql-correlated", "sql-subquery-vs-join"])
  ],
  exercises: [
    exercise({
      id: "sql-subquery-exercise",
      title: "Customers with orders",
      instructions: ["Return customers that have at least one order using EXISTS.", "Do not use JOIN for this exercise."],
      hints: ["Correlate on customer_id", "EXISTS short-circuits on first match"],
      expectedOutcome: "Customer rows where an orders subquery finds a match.",
      conceptIds: ["sql-exists", "sql-correlated"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-subqueries", [
    "sql-scalar-subquery", "sql-in-subquery", "sql-exists", "sql-from-subquery", "sql-correlated"
  ], ["concept-understanding", "query-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t9 = topic({
  id: "sql-window-functions",
  title: "Window Functions",
  aliases: ["over partition", "ranking functions"],
  description: "Compute rankings and running metrics with OVER partitions.",
  difficulty: "intermediate",
  learningOrder: 9,
  prerequisiteIds: ["sql-subqueries"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc"],
  concepts: [
    concept({ id: "sql-over", title: "OVER Clause", description: "Define the window for an analytic function." }),
    concept({ id: "sql-partition-by", title: "PARTITION BY", description: "Restart calculations per group without collapsing rows." }),
    concept({ id: "sql-order-window", title: "ORDER BY in Windows", description: "Define peer ordering inside a partition." }),
    concept({ id: "sql-row-number", title: "ROW_NUMBER", description: "Assign unique ranks within a partition." }),
    concept({ id: "sql-rank-dense", title: "RANK and DENSE_RANK", description: "Rank with or without gaps after ties." }),
    concept({ id: "sql-running-sum", title: "Running Aggregates", description: "Compute cumulative sums with frames." })
  ],
  learningObjectives: ["Write PARTITION BY windows", "Rank rows without collapsing groups"],
  practicalArtifacts: [
    artifact({
      id: "sql-window-rank",
      type: "query",
      title: "Rank orders per customer",
      language: "sql",
      content: "SELECT customer_id, id, total,\n       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS rn\nFROM orders;",
      expectedOutput: "Each order with a per-customer rank",
      explanation: "ROW_NUMBER ranks without collapsing rows.",
      conceptIds: ["sql-over", "sql-partition-by", "sql-row-number", "sql-order-window"],
    }),
  ],
  commonMistakes: [
    mistake("sql-window-group-mix", "Mixing GROUP BY collapse with window needs", "Wanting both detail and totals", "Use windows to keep detail rows.", ["sql-over"]),
    mistake("sql-window-missing-order", "Ranking without ORDER BY in OVER", "Non-deterministic ranks", "Always order ranking windows.", ["sql-order-window", "sql-row-number"])
  ],
  exercises: [
    exercise({
      id: "sql-window-exercise",
      title: "Latest order per customer",
      instructions: ["Rank orders per customer by created_at DESC.", "Keep only rn = 1 in an outer filter."],
      hints: ["ROW_NUMBER in a subquery", "Filter rn in the outer query"],
      expectedOutcome: "One latest order row per customer.",
      conceptIds: ["sql-row-number", "sql-partition-by", "sql-order-window"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-window-functions", [
    "sql-over", "sql-partition-by", "sql-order-window", "sql-row-number", "sql-rank-dense"
  ], ["concept-understanding", "query-interpretation", "expected-output", "debugging", "practical-scenario"]),
});


const t10 = topic({
  id: "sql-indexing-and-query-performance",
  title: "Indexing and Query Performance",
  aliases: ["indexes", "query performance", "explain plans"],
  description: "Speed up lookups with indexes and read simple execution plans.",
  difficulty: "intermediate",
  learningOrder: 10,
  prerequisiteIds: ["sql-window-functions"],
  relatedTopicIds: [ ],
  contaminationTerms: ["aws", "vpc", "kubernetes"],
  concepts: [
    concept({ id: "sql-index-basics", title: "Index Basics", description: "Indexes trade write cost for faster lookups." }),
    concept({ id: "sql-btree-index", title: "B-Tree Indexes", description: "Common default for equality and range predicates." }),
    concept({ id: "sql-covering-index", title: "Covering Indexes", description: "Indexes that satisfy a query without table lookups." }),
    concept({ id: "sql-selectivity", title: "Selectivity", description: "Highly selective predicates benefit most from indexes." }),
    concept({ id: "sql-explain", title: "EXPLAIN Plans", description: "Inspect whether queries use indexes or scans." }),
    concept({ id: "sql-anti-patterns", title: "Performance Anti-Patterns", description: "Leading wildcards and functions on columns can block indexes." })
  ],
  learningObjectives: ["Propose indexes for common filters", "Spot simple anti-patterns in plans"],
  practicalArtifacts: [
    artifact({
      id: "sql-index-orders-customer",
      type: "query",
      title: "Index for customer order lookup",
      language: "sql",
      content: "CREATE INDEX idx_orders_customer_created\nON orders (customer_id, created_at DESC);",
      expectedOutput: "Index supporting per-customer recent-order lookups",
      explanation: "Composite index matches filter + sort pattern.",
      conceptIds: ["sql-index-basics", "sql-btree-index", "sql-selectivity"],
    }),
  ],
  commonMistakes: [
    mistake("sql-index-overindex", "Indexing every column", "Assuming more indexes always help", "Index for real access paths; measure write impact.", ["sql-index-basics"]),
    mistake("sql-index-leading-wildcard", "LIKE '%term' on an indexed column", "Searching substrings", "Avoid leading wildcards or use specialized search.", ["sql-anti-patterns"])
  ],
  exercises: [
    exercise({
      id: "sql-index-exercise",
      title: "Improve a slow filter",
      instructions: ["Given WHERE email = ? AND status = 'active', propose an index.", "Explain how you would verify with EXPLAIN."],
      hints: ["Equality columns are good leading keys", "Check for index scan vs seq scan"],
      expectedOutcome: "A reasoned index proposal plus verification step.",
      conceptIds: ["sql-index-basics", "sql-explain", "sql-selectivity"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sql-indexing-and-query-performance", [
    "sql-index-basics", "sql-btree-index", "sql-covering-index", "sql-selectivity", "sql-explain"
  ], ["concept-understanding", "configuration-analysis", "debugging", "practical-scenario", "architecture-reasoning"]),
});


export const sqlKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-sql",
  title: "SQL",
  aliases: ["sql", "learn sql", "structured query language", "databases sql"],
  category: "Data",
  description:
    "Canonical SQL curriculum from relational concepts through joins, subqueries, windows, and indexing.",
  topics: [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10],
});

