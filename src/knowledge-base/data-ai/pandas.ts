import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","react hooks","kubernetes pod"];

const pandas_series_and_dataframeTopic = topic({
  id: "pandas-series-and-dataframe",
  title: "Series and DataFrame",
  aliases: ["dataframe","pandas series"],
  description: "Create and inspect Series/DataFrame objects and their indexes.",
  learningOrder: 1,
  
  relatedTopicIds: ["pandas-selection-and-filtering"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pandas-series",
      title: "Series",
      description: "Series applied in this topic.",
    }),
    concept({
      id: "pandas-dataframe",
      title: "DataFrame",
      description: "DataFrame applied in this topic.",
    }),
    concept({
      id: "pandas-index",
      title: "Index",
      description: "Index applied in this topic.",
    }),
    concept({
      id: "pandas-dtypes",
      title: "dtypes",
      description: "dtypes applied in this topic.",
    }),
    concept({
      id: "pandas-head-info",
      title: "head/info",
      description: "head/info applied in this topic.",
    }),
    concept({
      id: "pandas-shape",
      title: "shape",
      description: "shape applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Series correctly","Explain DataFrame in context"],
  practicalArtifacts: [
    artifact({
      id: "pandas-series-and-dataframe-artifact",
      type: "code",
      title: "Build a DataFrame",
      language: "python",
      content: "import pandas as pd\ndf = pd.DataFrame({\"name\": [\"Ada\", \"Lin\"], \"score\": [95, 88]})\nprint(df.shape)\nprint(df[\"score\"].mean())",
      expectedOutput: "(2, 2)\n91.5",
      explanation: "DataFrame construction and Series aggregation.",
      conceptIds: ["pandas-series","pandas-dataframe","pandas-index","pandas-dtypes"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pandas-series-and-dataframe-mistake-1",
      "Misapplying Series",
      "Skipping hands-on checks in Series and DataFrame",
      "Practice Series with a tiny example first.",
      ["pandas-series"],
    ),
    mistake(
      "pandas-series-and-dataframe-mistake-2",
      "Pulling unrelated-domain demos into Series and DataFrame",
      "Defaulting to out-of-domain snippets",
      "Stay inside Series and DataFrame concepts.",
      ["pandas-dataframe"],
    ),
  ],
  exercises: [
    exercise({
      id: "pandas-series-and-dataframe-exercise",
      title: "Series and DataFrame mini exercise",
      instructions: ["Build a small example covering Series.","Extend it with DataFrame.","Verify behavior related to Index."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Series and DataFrame.",
      conceptIds: ["pandas-series","pandas-dataframe","pandas-index"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("pandas-series-and-dataframe", ["pandas-series","pandas-dataframe","pandas-index","pandas-dtypes","pandas-head-info"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const pandas_selection_and_filteringTopic = topic({
  id: "pandas-selection-and-filtering",
  title: "Selection and Filtering",
  aliases: ["pandas loc","filtering"],
  description: "Select columns/rows with loc/iloc and boolean masks.",
  learningOrder: 2,
  prerequisiteIds: ["pandas-series-and-dataframe"],
  relatedTopicIds: ["pandas-cleaning"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pandas-column-selection",
      title: "Column Selection",
      description: "Column Selection applied in this topic.",
    }),
    concept({
      id: "pandas-loc",
      title: "loc",
      description: "loc applied in this topic.",
    }),
    concept({
      id: "pandas-iloc",
      title: "iloc",
      description: "iloc applied in this topic.",
    }),
    concept({
      id: "pandas-boolean-masks",
      title: "Boolean Masks",
      description: "Boolean Masks applied in this topic.",
    }),
    concept({
      id: "pandas-query",
      title: "query",
      description: "query applied in this topic.",
    }),
    concept({
      id: "pandas-assignment",
      title: "Assignment",
      description: "Assignment applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Column Selection correctly","Explain loc in context"],
  practicalArtifacts: [
    artifact({
      id: "pandas-selection-and-filtering-artifact",
      type: "code",
      title: "Selection and Filtering worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Column Selection, loc, iloc.",
      conceptIds: ["pandas-column-selection","pandas-loc","pandas-iloc","pandas-boolean-masks"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pandas-selection-and-filtering-mistake-1",
      "Misapplying Column Selection",
      "Skipping hands-on checks in Selection and Filtering",
      "Practice Column Selection with a tiny example first.",
      ["pandas-column-selection"],
    ),
    mistake(
      "pandas-selection-and-filtering-mistake-2",
      "Pulling unrelated-domain demos into Selection and Filtering",
      "Defaulting to out-of-domain snippets",
      "Stay inside Selection and Filtering concepts.",
      ["pandas-loc"],
    ),
  ],
  exercises: [
    exercise({
      id: "pandas-selection-and-filtering-exercise",
      title: "Selection and Filtering mini exercise",
      instructions: ["Build a small example covering Column Selection.","Extend it with loc.","Verify behavior related to iloc."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Selection and Filtering.",
      conceptIds: ["pandas-column-selection","pandas-loc","pandas-iloc"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("pandas-selection-and-filtering", ["pandas-column-selection","pandas-loc","pandas-iloc","pandas-boolean-masks","pandas-query"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const pandas_cleaningTopic = topic({
  id: "pandas-cleaning",
  title: "Data Cleaning",
  aliases: ["pandas cleaning","missing values"],
  description: "Handle missing values, duplicates, and type conversions.",
  learningOrder: 3,
  prerequisiteIds: ["pandas-selection-and-filtering"],
  relatedTopicIds: ["pandas-groupby-aggregations"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pandas-isna",
      title: "isna",
      description: "isna applied in this topic.",
    }),
    concept({
      id: "pandas-fillna-dropna",
      title: "fillna/dropna",
      description: "fillna/dropna applied in this topic.",
    }),
    concept({
      id: "pandas-duplicated",
      title: "duplicated",
      description: "duplicated applied in this topic.",
    }),
    concept({
      id: "pandas-astype",
      title: "astype",
      description: "astype applied in this topic.",
    }),
    concept({
      id: "pandas-replace",
      title: "replace",
      description: "replace applied in this topic.",
    }),
    concept({
      id: "pandas-string-accessors",
      title: "string Accessors",
      description: "string Accessors applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply isna correctly","Explain fillna/dropna in context"],
  practicalArtifacts: [
    artifact({
      id: "pandas-cleaning-artifact",
      type: "code",
      title: "Data Cleaning worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates isna, fillna/dropna, duplicated.",
      conceptIds: ["pandas-isna","pandas-fillna-dropna","pandas-duplicated","pandas-astype"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pandas-cleaning-mistake-1",
      "Misapplying isna",
      "Skipping hands-on checks in Data Cleaning",
      "Practice isna with a tiny example first.",
      ["pandas-isna"],
    ),
    mistake(
      "pandas-cleaning-mistake-2",
      "Pulling unrelated-domain demos into Data Cleaning",
      "Defaulting to out-of-domain snippets",
      "Stay inside Data Cleaning concepts.",
      ["pandas-fillna-dropna"],
    ),
  ],
  exercises: [
    exercise({
      id: "pandas-cleaning-exercise",
      title: "Data Cleaning mini exercise",
      instructions: ["Build a small example covering isna.","Extend it with fillna/dropna.","Verify behavior related to duplicated."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Data Cleaning.",
      conceptIds: ["pandas-isna","pandas-fillna-dropna","pandas-duplicated"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("pandas-cleaning", ["pandas-isna","pandas-fillna-dropna","pandas-duplicated","pandas-astype","pandas-replace"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const pandas_groupby_aggregationsTopic = topic({
  id: "pandas-groupby-aggregations",
  title: "GroupBy and Aggregations",
  aliases: ["pandas groupby","aggregations"],
  description: "Split-apply-combine with groupby and agg.",
  learningOrder: 4,
  prerequisiteIds: ["pandas-cleaning"],
  relatedTopicIds: ["pandas-joins-and-reshaping"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pandas-groupby",
      title: "groupby",
      description: "groupby applied in this topic.",
    }),
    concept({
      id: "pandas-agg",
      title: "agg",
      description: "agg applied in this topic.",
    }),
    concept({
      id: "pandas-transform",
      title: "transform",
      description: "transform applied in this topic.",
    }),
    concept({
      id: "pandas-multi-aggregations",
      title: "multi-aggregations",
      description: "multi-aggregations applied in this topic.",
    }),
    concept({
      id: "pandas-named-aggregation",
      title: "Named Aggregation",
      description: "Named Aggregation applied in this topic.",
    }),
    concept({
      id: "pandas-reset-index",
      title: "reset_index",
      description: "reset_index applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply groupby correctly","Explain agg in context"],
  practicalArtifacts: [
    artifact({
      id: "pandas-groupby-aggregations-artifact",
      type: "code",
      title: "Group mean scores",
      language: "python",
      content: "import pandas as pd\ndf = pd.DataFrame({\"team\": [\"A\", \"A\", \"B\"], \"score\": [10, 20, 15]})\nprint(df.groupby(\"team\")[\"score\"].mean())",
      expectedOutput: "team\nA    15.0\nB    15.0",
      explanation: "Classic groupby mean.",
      conceptIds: ["pandas-groupby","pandas-agg","pandas-transform","pandas-multi-aggregations"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pandas-groupby-aggregations-mistake-1",
      "Misapplying groupby",
      "Skipping hands-on checks in GroupBy and Aggregations",
      "Practice groupby with a tiny example first.",
      ["pandas-groupby"],
    ),
    mistake(
      "pandas-groupby-aggregations-mistake-2",
      "Pulling unrelated-domain demos into GroupBy and Aggregations",
      "Defaulting to out-of-domain snippets",
      "Stay inside GroupBy and Aggregations concepts.",
      ["pandas-agg"],
    ),
  ],
  exercises: [
    exercise({
      id: "pandas-groupby-aggregations-exercise",
      title: "GroupBy and Aggregations mini exercise",
      instructions: ["Build a small example covering groupby.","Extend it with agg.","Verify behavior related to transform."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for GroupBy and Aggregations.",
      conceptIds: ["pandas-groupby","pandas-agg","pandas-transform"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("pandas-groupby-aggregations", ["pandas-groupby","pandas-agg","pandas-transform","pandas-multi-aggregations","pandas-named-aggregation"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const pandas_joins_and_reshapingTopic = topic({
  id: "pandas-joins-and-reshaping",
  title: "Joins and Reshaping",
  aliases: ["pandas merge","pivot"],
  description: "Combine tables with merge/concat and reshape with pivot/melt.",
  learningOrder: 5,
  prerequisiteIds: ["pandas-groupby-aggregations"],
  relatedTopicIds: ["pandas-timeseries-basics"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pandas-merge",
      title: "merge",
      description: "merge applied in this topic.",
    }),
    concept({
      id: "pandas-join-keys",
      title: "join Keys",
      description: "join Keys applied in this topic.",
    }),
    concept({
      id: "pandas-concat",
      title: "concat",
      description: "concat applied in this topic.",
    }),
    concept({
      id: "pandas-pivot",
      title: "pivot",
      description: "pivot applied in this topic.",
    }),
    concept({
      id: "pandas-melt",
      title: "melt",
      description: "melt applied in this topic.",
    }),
    concept({
      id: "pandas-stack-unstack-intro",
      title: "stack/unstack Intro",
      description: "stack/unstack Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply merge correctly","Explain join Keys in context"],
  practicalArtifacts: [
    artifact({
      id: "pandas-joins-and-reshaping-artifact",
      type: "code",
      title: "Joins and Reshaping worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates merge, join Keys, concat.",
      conceptIds: ["pandas-merge","pandas-join-keys","pandas-concat","pandas-pivot"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pandas-joins-and-reshaping-mistake-1",
      "Misapplying merge",
      "Skipping hands-on checks in Joins and Reshaping",
      "Practice merge with a tiny example first.",
      ["pandas-merge"],
    ),
    mistake(
      "pandas-joins-and-reshaping-mistake-2",
      "Pulling unrelated-domain demos into Joins and Reshaping",
      "Defaulting to out-of-domain snippets",
      "Stay inside Joins and Reshaping concepts.",
      ["pandas-join-keys"],
    ),
  ],
  exercises: [
    exercise({
      id: "pandas-joins-and-reshaping-exercise",
      title: "Joins and Reshaping mini exercise",
      instructions: ["Build a small example covering merge.","Extend it with join Keys.","Verify behavior related to concat."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Joins and Reshaping.",
      conceptIds: ["pandas-merge","pandas-join-keys","pandas-concat"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("pandas-joins-and-reshaping", ["pandas-merge","pandas-join-keys","pandas-concat","pandas-pivot","pandas-melt"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const pandas_timeseries_basicsTopic = topic({
  id: "pandas-timeseries-basics",
  title: "Time Series Basics",
  aliases: ["pandas time series","resample"],
  description: "Parse dates, set DateTimeIndex, and resample simple series.",
  learningOrder: 6,
  prerequisiteIds: ["pandas-joins-and-reshaping"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pandas-to-datetime",
      title: "to_datetime",
      description: "to_datetime applied in this topic.",
    }),
    concept({
      id: "pandas-datetimeindex",
      title: "DateTimeIndex",
      description: "DateTimeIndex applied in this topic.",
    }),
    concept({
      id: "pandas-dt-accessors",
      title: "dt Accessors",
      description: "dt Accessors applied in this topic.",
    }),
    concept({
      id: "pandas-resample",
      title: "resample",
      description: "resample applied in this topic.",
    }),
    concept({
      id: "pandas-rolling",
      title: "rolling",
      description: "rolling applied in this topic.",
    }),
    concept({
      id: "pandas-time-zone-awareness-intro",
      title: "Time Zone Awareness Intro",
      description: "Time Zone Awareness Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply to_datetime correctly","Explain DateTimeIndex in context"],
  practicalArtifacts: [
    artifact({
      id: "pandas-timeseries-basics-artifact",
      type: "code",
      title: "Time Series Basics worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates to_datetime, DateTimeIndex, dt Accessors.",
      conceptIds: ["pandas-to-datetime","pandas-datetimeindex","pandas-dt-accessors","pandas-resample"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pandas-timeseries-basics-mistake-1",
      "Misapplying to_datetime",
      "Skipping hands-on checks in Time Series Basics",
      "Practice to_datetime with a tiny example first.",
      ["pandas-to-datetime"],
    ),
    mistake(
      "pandas-timeseries-basics-mistake-2",
      "Pulling unrelated-domain demos into Time Series Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Time Series Basics concepts.",
      ["pandas-datetimeindex"],
    ),
  ],
  exercises: [
    exercise({
      id: "pandas-timeseries-basics-exercise",
      title: "Time Series Basics mini exercise",
      instructions: ["Build a small example covering to_datetime.","Extend it with DateTimeIndex.","Verify behavior related to dt Accessors."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Time Series Basics.",
      conceptIds: ["pandas-to-datetime","pandas-datetimeindex","pandas-dt-accessors"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("pandas-timeseries-basics", ["pandas-to-datetime","pandas-datetimeindex","pandas-dt-accessors","pandas-resample","pandas-rolling"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

export const pandasKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-pandas",
  title: "Pandas",
  aliases: ["pandas","learn pandas","python pandas","pandas dataframe"],
  category: "Data",
  description: "Pandas starter curriculum covering Series/DataFrame, selection, cleaning, groupby, joins, and time series basics.",
  topics: [pandas_series_and_dataframeTopic, pandas_selection_and_filteringTopic, pandas_cleaningTopic, pandas_groupby_aggregationsTopic, pandas_joins_and_reshapingTopic, pandas_timeseries_basicsTopic],
});
