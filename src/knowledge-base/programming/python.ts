import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = [
  "aws",
  "vpc",
  "ec2",
  "s3",
  "azure",
  "kubernetes",
  "react hooks",
  "jsx",
  "java",
  "system.out",
  "javascript",
  "typescript",
];

const syntaxTopic = topic({
  id: "python-syntax-and-data-types",
  title: "Python Syntax and Data Types",
  aliases: ["python syntax", "data types", "variables and types", "python basics syntax"],
  description:
    "Write valid Python statements using variables, assignment, built-in scalar types, conversion, print, comments, and indentation.",
  learningOrder: 1,
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "python-variables",
      title: "Variables",
      description: "Names that refer to values in memory; created by assignment.",
      examples: [
        {
          title: "Name a value",
          content: "score = 95",
          language: "python",
          explanation: "score now refers to the integer 95.",
        },
      ],
      commonMistakes: ["Using a name before assigning it raises NameError."],
    }),
    concept({
      id: "python-assignment",
      title: "Assignment",
      description: "The = operator binds a name to a value; it is not a comparison.",
      prerequisiteConceptIds: ["python-variables"],
      examples: [{ title: "Rebind", content: "x = 1\nx = x + 1", language: "python" }],
    }),
    concept({
      id: "python-integers",
      title: "Integers",
      description: "Whole numbers with unlimited precision in Python 3.",
      prerequisiteConceptIds: ["python-assignment"],
      examples: [{ title: "Integer ops", content: "total = 3 + 4", language: "python" }],
    }),
    concept({
      id: "python-floats",
      title: "Floats",
      description: "Floating-point numbers for fractional values.",
      relatedConceptIds: ["python-integers"],
      examples: [{ title: "Division", content: "ratio = 7 / 2  # 3.5", language: "python" }],
      commonMistakes: ["Assuming 0.1 + 0.2 equals exactly 0.3."],
    }),
    concept({
      id: "python-strings",
      title: "Strings",
      description: "Immutable sequences of Unicode characters.",
      examples: [{ title: "Concatenation", content: 'greeting = "Hi " + "Ada"', language: "python" }],
    }),
    concept({
      id: "python-booleans",
      title: "Booleans",
      description: "True and False values used in conditions.",
      examples: [{ title: "Comparison", content: "ready = score >= 60", language: "python" }],
    }),
    concept({
      id: "python-type-conversion",
      title: "Type Conversion",
      description: "Convert between types with int(), float(), str(), and bool().",
      prerequisiteConceptIds: ["python-integers", "python-strings"],
      examples: [{ title: "Parse input", content: 'age = int("21")', language: "python" }],
      commonMistakes: ['int("3.14") raises ValueError; use float first.'],
    }),
    concept({
      id: "python-print",
      title: "Print",
      description: "Write text to standard output with print().",
      examples: [{ title: "Print values", content: 'print("score", 95)', language: "python" }],
    }),
    concept({
      id: "python-comments",
      title: "Comments",
      description: "Use # for line comments that document intent.",
      examples: [{ title: "Annotate", content: "rate = 0.2  # discount rate", language: "python" }],
    }),
    concept({
      id: "python-indentation",
      title: "Indentation",
      description: "Blocks are defined by consistent indentation, typically four spaces.",
      examples: [
        {
          title: "Indented block",
          content: "if True:\n    print(\"ok\")",
          language: "python",
        },
      ],
      commonMistakes: ["Mixing tabs and spaces causes IndentationError."],
    }),
  ],
  learningObjectives: [
    "Declare and reassign variables with correct types",
    "Convert between int, float, str, and bool safely",
    "Use print, comments, and consistent indentation",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-syntax-temperature-script",
      type: "code",
      title: "Celsius to Fahrenheit converter",
      language: "python",
      content:
        'celsius = float("22.5")\nfahrenheit = celsius * 9 / 5 + 32\nprint(f"{celsius} C is {fahrenheit} F")',
      expectedOutput: "22.5 C is 72.5 F",
      explanation: "Shows assignment, floats, conversion from string input, and print formatting.",
      conceptIds: ["python-assignment", "python-floats", "python-type-conversion", "python-print"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-syntax-name-before-assign",
      "Reading a variable before assignment",
      "Learners translate math-style declarations without binding first.",
      "Assign a value before using the name.",
      ["python-variables", "python-assignment"],
    ),
    mistake(
      "python-syntax-indent-mix",
      "Mixing tabs and spaces",
      "Editors disagree on tab width.",
      "Configure the editor for four spaces and never mix.",
      ["python-indentation"],
    ),
    mistake(
      "python-syntax-int-float-string",
      'Calling int() on a decimal string like "3.14"',
      "Assuming int parses any numeric text.",
      "Use float() then int() if truncation is intended.",
      ["python-type-conversion"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-syntax-profile-card",
      title: "Build a learner profile card",
      instructions: [
        "Create variables for name (str), age (int), and active (bool).",
        "Convert a string hours value to float.",
        "Print a one-line summary using those values.",
      ],
      hints: ["Use int()/float() for conversion", "f-strings keep formatting readable"],
      expectedOutcome: "A printed line containing name, age, hours, and active status.",
      conceptIds: ["python-variables", "python-type-conversion", "python-print", "python-booleans"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-syntax", [
    "python-variables",
    "python-assignment",
    "python-strings",
    "python-type-conversion",
    "python-indentation",
  ]),
});

const controlFlowTopic = topic({
  id: "python-control-flow",
  title: "Control Flow",
  aliases: ["if else", "loops", "for while", "branching"],
  description: "Branch with if/elif/else and repeat work with for and while loops.",
  learningOrder: 2,
  prerequisiteIds: ["python-syntax-and-data-types"],
  relatedTopicIds: ["python-functions"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "python-if",
      title: "If Statements",
      description: "Conditionally execute a block when a Boolean expression is true.",
    }),
    concept({
      id: "python-elif-else",
      title: "Elif and Else",
      description: "Chain mutually exclusive branches after an if.",
      prerequisiteConceptIds: ["python-if"],
    }),
    concept({
      id: "python-for-loops",
      title: "For Loops",
      description: "Iterate over iterables such as ranges and sequences.",
    }),
    concept({
      id: "python-while-loops",
      title: "While Loops",
      description: "Repeat while a condition remains true; guard against infinite loops.",
    }),
    concept({
      id: "python-break-continue",
      title: "Break and Continue",
      description: "Exit early or skip an iteration inside a loop.",
      prerequisiteConceptIds: ["python-for-loops"],
    }),
    concept({
      id: "python-nested-control",
      title: "Nested Control Flow",
      description: "Combine conditions and loops carefully with clear indentation.",
      prerequisiteConceptIds: ["python-if", "python-for-loops"],
    }),
  ],
  learningObjectives: [
    "Write branching logic with if/elif/else",
    "Iterate with for and while without infinite loops",
    "Use break/continue intentionally",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-control-grade-band",
      type: "code",
      title: "Grade band classifier",
      language: "python",
      content:
        'score = 78\nif score >= 90:\n    band = "A"\nelif score >= 70:\n    band = "B"\nelse:\n    band = "C"\nprint(band)',
      expectedOutput: "B",
      explanation: "Demonstrates mutually exclusive branches over a numeric threshold.",
      conceptIds: ["python-if", "python-elif-else"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-control-assign-in-if",
      "Using = instead of == in a condition",
      "Assignment and comparison look similar.",
      "Use == for equality checks inside if.",
      ["python-if"],
    ),
    mistake(
      "python-control-infinite-while",
      "While loop never updates the condition variable",
      "Forgetting to mutate the loop state.",
      "Update the controlling variable each iteration or break explicitly.",
      ["python-while-loops"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-control-fizz-filter",
      title: "Filter multiples",
      instructions: [
        "Loop from 1 to 20.",
        "Print numbers divisible by 3, skipping the rest with continue.",
      ],
      hints: ["Use range(1, 21)", "Modulo (%) checks divisibility"],
      expectedOutcome: "Printed multiples of 3 between 1 and 20.",
      conceptIds: ["python-for-loops", "python-break-continue"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "python-control",
    ["python-if", "python-elif-else", "python-for-loops", "python-while-loops", "python-break-continue"],
    ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"],
  ),
});

const functionsTopic = topic({
  id: "python-functions",
  title: "Functions",
  aliases: ["def", "parameters", "return values", "python functions"],
  description: "Define reusable functions with parameters, defaults, and return values.",
  learningOrder: 3,
  prerequisiteIds: ["python-control-flow"],
  relatedTopicIds: ["python-modules-and-packages"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "python-def", title: "Defining Functions", description: "Use def to declare a named callable block." }),
    concept({
      id: "python-parameters",
      title: "Parameters and Arguments",
      description: "Pass inputs positionally or by keyword.",
      prerequisiteConceptIds: ["python-def"],
    }),
    concept({
      id: "python-return",
      title: "Return Values",
      description: "Send a result back to the caller with return.",
      prerequisiteConceptIds: ["python-def"],
    }),
    concept({
      id: "python-default-args",
      title: "Default Arguments",
      description: "Provide fallback parameter values; avoid mutable defaults.",
      prerequisiteConceptIds: ["python-parameters"],
    }),
    concept({
      id: "python-scope",
      title: "Local Scope",
      description: "Names assigned inside a function are local unless declared otherwise.",
      prerequisiteConceptIds: ["python-def"],
    }),
    concept({
      id: "python-docstrings",
      title: "Docstrings",
      description: "Document function purpose with a string literal as the first statement.",
      prerequisiteConceptIds: ["python-def"],
    }),
  ],
  learningObjectives: [
    "Define functions with clear parameters and returns",
    "Choose defaults safely",
    "Reason about local scope",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-functions-discount",
      type: "code",
      title: "Price after discount",
      language: "python",
      content:
        "def price_after_discount(amount, rate=0.1):\n    \"\"\"Return amount reduced by rate.\"\"\"\n    return amount * (1 - rate)\n\nprint(price_after_discount(100))",
      expectedOutput: "90.0",
      explanation: "Shows def, default argument, docstring, and return.",
      conceptIds: ["python-def", "python-default-args", "python-return", "python-docstrings"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-functions-mutable-default",
      "Using a mutable list/dict as a default argument",
      "Defaults are evaluated once at definition time.",
      "Use None and create a new list inside the function.",
      ["python-default-args"],
    ),
    mistake(
      "python-functions-missing-return",
      "Forgetting return and getting None",
      "Assuming the last expression is returned automatically.",
      "Explicitly return the computed value.",
      ["python-return"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-functions-clamp",
      title: "Clamp a number",
      instructions: [
        "Write clamp(value, low, high) that returns value bounded to [low, high].",
        "Call it with a few sample inputs and print results.",
      ],
      hints: ["Use min and max together", "Return the bounded value"],
      expectedOutcome: "Function returns values inside the requested range.",
      conceptIds: ["python-def", "python-parameters", "python-return"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-functions", [
    "python-def",
    "python-parameters",
    "python-return",
    "python-default-args",
    "python-scope",
  ]),
});

const collectionsTopic = topic({
  id: "python-collections",
  title: "Collections",
  aliases: ["lists", "dicts", "sets", "tuples", "data structures"],
  description: "Store and transform data with lists, tuples, dictionaries, and sets.",
  learningOrder: 4,
  prerequisiteIds: ["python-functions"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "python-lists", title: "Lists", description: "Ordered, mutable sequences." }),
    concept({ id: "python-tuples", title: "Tuples", description: "Ordered, immutable sequences." }),
    concept({ id: "python-dicts", title: "Dictionaries", description: "Key-value maps with unique keys." }),
    concept({ id: "python-sets", title: "Sets", description: "Unordered collections of unique items." }),
    concept({
      id: "python-comprehensions",
      title: "Comprehensions",
      description: "Build lists/dicts/sets with compact expressions.",
      prerequisiteConceptIds: ["python-lists"],
    }),
    concept({
      id: "python-iteration-collections",
      title: "Iterating Collections",
      description: "Loop over items, keys, and values idiomatically.",
      prerequisiteConceptIds: ["python-lists", "python-dicts"],
    }),
  ],
  learningObjectives: [
    "Choose the right collection type",
    "Mutate lists and update dictionaries safely",
    "Write simple comprehensions",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-collections-roster",
      type: "code",
      title: "Student roster dictionary",
      language: "python",
      content:
        'students = {"ada": 92, "linus": 88}\npassed = [name for name, score in students.items() if score >= 90]\nprint(passed)',
      expectedOutput: "['ada']",
      explanation: "Combines dict iteration with a list comprehension filter.",
      conceptIds: ["python-dicts", "python-comprehensions", "python-iteration-collections"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-collections-mutate-while-iterate",
      "Mutating a list while iterating it",
      "Index shifts surprise beginners.",
      "Iterate a copy or build a new list.",
      ["python-lists", "python-iteration-collections"],
    ),
    mistake(
      "python-collections-unhashable-key",
      "Using a list as a dictionary key",
      "Only hashable types can be keys.",
      "Use a tuple or string key instead.",
      ["python-dicts"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-collections-unique-tags",
      title: "Unique tags",
      instructions: [
        "Given a list of tags with duplicates, produce a sorted unique list.",
        "Also build a frequency dictionary.",
      ],
      hints: ["set() removes duplicates", "dict.get(key, 0) helps counting"],
      expectedOutcome: "Sorted unique tags and a frequency map.",
      conceptIds: ["python-lists", "python-sets", "python-dicts"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-collections", [
    "python-lists",
    "python-dicts",
    "python-sets",
    "python-comprehensions",
    "python-tuples",
  ]),
});

const fileHandlingTopic = topic({
  id: "python-file-handling",
  title: "File Handling",
  aliases: ["files", "read write", "open context manager"],
  description: "Read and write text files safely with context managers.",
  learningOrder: 5,
  prerequisiteIds: ["python-collections"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "python-open", title: "Opening Files", description: "Use open() with an explicit mode." }),
    concept({
      id: "python-read-write",
      title: "Reading and Writing",
      description: "read, readline, readlines, write, and writelines.",
      prerequisiteConceptIds: ["python-open"],
    }),
    concept({
      id: "python-with-statement",
      title: "With Statement",
      description: "Context managers close files even when errors occur.",
      prerequisiteConceptIds: ["python-open"],
    }),
    concept({
      id: "python-path-basics",
      title: "Path Basics",
      description: "Compose portable paths instead of hard-coding separators.",
    }),
    concept({
      id: "python-text-encoding",
      title: "Text Encoding",
      description: "Specify encoding (usually utf-8) for text files.",
      prerequisiteConceptIds: ["python-open"],
    }),
    concept({
      id: "python-csv-lines",
      title: "Line-Oriented CSV",
      description: "Parse simple delimited lines before introducing csv module.",
      prerequisiteConceptIds: ["python-read-write"],
    }),
  ],
  learningObjectives: [
    "Open files with the correct mode and encoding",
    "Always close resources via with",
    "Process line-oriented text reliably",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-files-notes",
      type: "code",
      title: "Append a study note",
      language: "python",
      content:
        'with open("notes.txt", "a", encoding="utf-8") as handle:\n    handle.write("Reviewed file handling\\n")\nwith open("notes.txt", encoding="utf-8") as handle:\n    print(handle.read())',
      expectedOutput: "Reviewed file handling",
      explanation: "Shows append/read modes, encoding, and with.",
      conceptIds: ["python-with-statement", "python-read-write", "python-text-encoding"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-files-forgot-close",
      "Forgetting to close a file handle",
      "Relying on garbage collection timing.",
      "Prefer with open(...) as handle.",
      ["python-with-statement"],
    ),
    mistake(
      "python-files-wrong-mode",
      "Opening for write when read was intended",
      "Confusing 'w' and 'r' modes.",
      "Choose 'r', 'w', or 'a' deliberately; 'w' truncates.",
      ["python-open"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-files-count-lines",
      title: "Count non-empty lines",
      instructions: [
        "Read a text file and count lines that are not blank.",
        "Print the count.",
      ],
      hints: ["strip() detects blank lines", "Use with for reading"],
      expectedOutcome: "Printed integer count of non-empty lines.",
      conceptIds: ["python-with-statement", "python-read-write"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "python-files",
    ["python-open", "python-read-write", "python-with-statement", "python-text-encoding", "python-path-basics"],
    ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"],
  ),
});

const exceptionsTopic = topic({
  id: "python-exceptions",
  title: "Exceptions",
  aliases: ["error handling", "try except", "raise"],
  description: "Catch, raise, and design clear exception handling paths.",
  learningOrder: 6,
  prerequisiteIds: ["python-file-handling"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "python-try-except", title: "Try Except", description: "Handle expected failures without crashing." }),
    concept({
      id: "python-else-finally",
      title: "Else and Finally",
      description: "Run else when no exception occurs; finally always runs.",
      prerequisiteConceptIds: ["python-try-except"],
    }),
    concept({
      id: "python-raise",
      title: "Raising Exceptions",
      description: "Signal invalid states with raise.",
      prerequisiteConceptIds: ["python-try-except"],
    }),
    concept({
      id: "python-exception-types",
      title: "Exception Types",
      description: "Catch specific types (ValueError, TypeError, OSError) before broad Exception.",
    }),
    concept({
      id: "python-error-messages",
      title: "Error Messages",
      description: "Write actionable messages for callers and logs.",
      prerequisiteConceptIds: ["python-raise"],
    }),
    concept({
      id: "python-guard-clauses",
      title: "Guard Clauses",
      description: "Validate inputs early and fail fast.",
      relatedConceptIds: ["python-raise"],
    }),
  ],
  learningObjectives: [
    "Catch specific exceptions intentionally",
    "Use finally for cleanup",
    "Raise meaningful errors from helpers",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-exceptions-parse-int",
      type: "code",
      title: "Safe integer parse",
      language: "python",
      content:
        'def parse_int(text):\n    try:\n        return int(text)\n    except ValueError as exc:\n        raise ValueError(f"Not an integer: {text!r}") from exc\n\nprint(parse_int("42"))',
      expectedOutput: "42",
      explanation: "Catches ValueError and re-raises with context.",
      conceptIds: ["python-try-except", "python-raise", "python-exception-types"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-exceptions-bare-except",
      "Using bare except:",
      "Wanting to silence every error.",
      "Catch the specific exception types you can handle.",
      ["python-exception-types"],
    ),
    mistake(
      "python-exceptions-swallow",
      "Catching exceptions and doing nothing",
      "Fear of noisy logs.",
      "Log or re-raise; never silently ignore unexpected failures.",
      ["python-try-except"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-exceptions-divide",
      title: "Safe division",
      instructions: [
        "Write divide(a, b) that returns a/b.",
        "Raise ValueError when b is 0 with a clear message.",
      ],
      hints: ["Check b before dividing", "Include both operands in the message"],
      expectedOutcome: "Function returns quotient or raises ValueError for zero divisor.",
      conceptIds: ["python-raise", "python-guard-clauses"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-exceptions", [
    "python-try-except",
    "python-else-finally",
    "python-raise",
    "python-exception-types",
    "python-guard-clauses",
  ]),
});

const oopTopic = topic({
  id: "python-object-oriented-programming",
  title: "Object-Oriented Programming",
  aliases: ["oop", "classes", "objects", "methods"],
  description: "Model behavior with classes, instances, methods, and inheritance.",
  learningOrder: 7,
  prerequisiteIds: ["python-exceptions"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "python-classes", title: "Classes", description: "Blueprints for objects.", difficulty: "intermediate" }),
    concept({
      id: "python-instances",
      title: "Instances",
      description: "Concrete objects created from a class.",
      prerequisiteConceptIds: ["python-classes"],
      difficulty: "intermediate",
    }),
    concept({
      id: "python-init",
      title: "__init__",
      description: "Initialize instance attributes when an object is created.",
      prerequisiteConceptIds: ["python-instances"],
      difficulty: "intermediate",
    }),
    concept({
      id: "python-methods",
      title: "Instance Methods",
      description: "Functions defined on a class that receive self.",
      prerequisiteConceptIds: ["python-init"],
      difficulty: "intermediate",
    }),
    concept({
      id: "python-inheritance",
      title: "Inheritance",
      description: "Specialize behavior by subclassing.",
      prerequisiteConceptIds: ["python-classes"],
      difficulty: "intermediate",
    }),
    concept({
      id: "python-encapsulation",
      title: "Encapsulation",
      description: "Keep related state and behavior together; use naming conventions for privacy.",
      prerequisiteConceptIds: ["python-methods"],
      difficulty: "intermediate",
    }),
  ],
  learningObjectives: [
    "Define classes with __init__ and methods",
    "Create and use instances",
    "Extend behavior with inheritance",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-oop-counter",
      type: "code",
      title: "Counter class",
      language: "python",
      content:
        "class Counter:\n    def __init__(self, start=0):\n        self.value = start\n    def increment(self):\n        self.value += 1\n        return self.value\n\nc = Counter()\nprint(c.increment())",
      expectedOutput: "1",
      explanation: "Shows class, init, instance method, and state.",
      conceptIds: ["python-classes", "python-init", "python-methods", "python-instances"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-oop-forgot-self",
      "Forgetting self on instance methods",
      "Coming from languages where this is implicit.",
      "First parameter of instance methods must be self.",
      ["python-methods"],
    ),
    mistake(
      "python-oop-shared-mutable",
      "Mutable class attributes shared across instances",
      "Defining a list on the class body.",
      "Initialize mutable state in __init__.",
      ["python-init", "python-encapsulation"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-oop-bank-account",
      title: "Simple bank account",
      instructions: [
        "Create BankAccount with owner and balance.",
        "Add deposit and withdraw methods that reject negative amounts.",
      ],
      hints: ["Store balance on self", "Raise ValueError for invalid amounts"],
      expectedOutcome: "Account updates balance and rejects invalid operations.",
      conceptIds: ["python-classes", "python-init", "python-methods"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-oop", [
    "python-classes",
    "python-init",
    "python-methods",
    "python-inheritance",
    "python-encapsulation",
  ]),
});

const modulesTopic = topic({
  id: "python-modules-and-packages",
  title: "Modules and Packages",
  aliases: ["import", "packages", "modules"],
  description: "Organize code with modules, imports, and package layouts.",
  learningOrder: 8,
  prerequisiteIds: ["python-object-oriented-programming"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "python-import", title: "Import", description: "Load another module into the current namespace." }),
    concept({
      id: "python-from-import",
      title: "From Import",
      description: "Import selected names from a module.",
      prerequisiteConceptIds: ["python-import"],
    }),
    concept({
      id: "python-module-search-path",
      title: "Module Search Path",
      description: "Python finds modules via sys.path and installed packages.",
      prerequisiteConceptIds: ["python-import"],
    }),
    concept({
      id: "python-packages",
      title: "Packages",
      description: "Directories with __init__.py (or namespace packages) group modules.",
      prerequisiteConceptIds: ["python-import"],
    }),
    concept({
      id: "python-dunder-name",
      title: "__name__ Guard",
      description: "Use if __name__ == '__main__' for script entry points.",
      prerequisiteConceptIds: ["python-import"],
    }),
    concept({
      id: "python-stdlib-modules",
      title: "Standard Library Modules",
      description: "Prefer stdlib modules (math, json, pathlib) before reinventing.",
      relatedConceptIds: ["python-import"],
    }),
  ],
  learningObjectives: [
    "Import modules and selected names cleanly",
    "Structure a small package",
    "Protect script entry points with __name__",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-modules-json-roundtrip",
      type: "code",
      title: "JSON round-trip",
      language: "python",
      content:
        'import json\npayload = {"topic": "modules"}\ntext = json.dumps(payload)\nprint(json.loads(text)["topic"])',
      expectedOutput: "modules",
      explanation: "Uses a stdlib module via import.",
      conceptIds: ["python-import", "python-stdlib-modules"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-modules-circular",
      "Circular imports between modules",
      "Two modules import each other at top level.",
      "Invert dependencies or import inside functions when needed.",
      ["python-import", "python-packages"],
    ),
    mistake(
      "python-modules-star-import",
      "from module import * in application code",
      "Convenience hides name clashes.",
      "Import explicit names.",
      ["python-from-import"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-modules-util-package",
      title: "Tiny utils package",
      instructions: [
        "Create a package folder with a helpers module containing add(a, b).",
        "Import and call it from a main script guarded by __name__.",
      ],
      hints: ["Use a relative or package import", "Keep the entry script thin"],
      expectedOutcome: "Main script prints the sum via the package helper.",
      conceptIds: ["python-packages", "python-import", "python-dunder-name"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-modules", [
    "python-import",
    "python-from-import",
    "python-packages",
    "python-dunder-name",
    "python-stdlib-modules",
  ]),
});

const testingTopic = topic({
  id: "python-testing",
  title: "Testing",
  aliases: ["unittest", "pytest", "assertions", "test cases"],
  description: "Verify behavior with assertions and automated tests.",
  learningOrder: 9,
  prerequisiteIds: ["python-modules-and-packages"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "python-assertions", title: "Assertions", description: "assert documents and checks expected conditions in tests." }),
    concept({
      id: "python-test-functions",
      title: "Test Functions",
      description: "Name tests clearly and keep each focused on one behavior.",
      prerequisiteConceptIds: ["python-assertions"],
    }),
    concept({
      id: "python-arrange-act-assert",
      title: "Arrange Act Assert",
      description: "Structure tests into setup, action, and verification.",
      prerequisiteConceptIds: ["python-test-functions"],
    }),
    concept({
      id: "python-edge-cases",
      title: "Edge Cases",
      description: "Cover empty inputs, boundaries, and error paths.",
      relatedConceptIds: ["python-test-functions"],
    }),
    concept({
      id: "python-test-isolation",
      title: "Test Isolation",
      description: "Tests must not depend on order or shared mutable state.",
      prerequisiteConceptIds: ["python-test-functions"],
    }),
    concept({
      id: "python-regression-tests",
      title: "Regression Tests",
      description: "Lock fixed bugs with a failing-then-passing test.",
      relatedConceptIds: ["python-edge-cases"],
    }),
  ],
  learningObjectives: [
    "Write focused automated tests",
    "Cover happy path and edge cases",
    "Keep tests isolated and repeatable",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-testing-clamp-tests",
      type: "code",
      title: "Clamp unit tests",
      language: "python",
      content:
        "def clamp(value, low, high):\n    return max(low, min(value, high))\n\ndef test_clamp_middle():\n    assert clamp(5, 0, 10) == 5\n\ndef test_clamp_high():\n    assert clamp(50, 0, 10) == 10",
      expectedOutput: "Both assertions pass when run by a test runner",
      explanation: "Shows arrange-act-assert style tests around a pure function.",
      conceptIds: ["python-assertions", "python-test-functions", "python-arrange-act-assert"],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-testing-no-assert",
      "Writing a test that never asserts",
      "Printing values instead of checking them.",
      "End every test with a meaningful assertion.",
      ["python-assertions"],
    ),
    mistake(
      "python-testing-order-dependence",
      "Tests that only pass in a specific order",
      "Sharing mutated globals.",
      "Reset state in each test; prefer pure functions.",
      ["python-test-isolation"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-testing-parse-int-suite",
      title: "Test parse_int",
      instructions: [
        "Write tests for a parse_int helper covering valid input and ValueError.",
        "Keep each test to one behavior.",
      ],
      hints: ["Use pytest.raises or try/except around the error case", "Name tests after the behavior"],
      expectedOutcome: "At least two passing tests covering success and failure.",
      conceptIds: ["python-test-functions", "python-edge-cases", "python-arrange-act-assert"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-testing", [
    "python-assertions",
    "python-test-functions",
    "python-arrange-act-assert",
    "python-edge-cases",
    "python-test-isolation",
  ]),
});

const projectTopic = topic({
  id: "python-practical-project",
  title: "Practical Python Project",
  aliases: ["python project", "capstone", "applied python"],
  description: "Integrate syntax, functions, files, exceptions, and tests into a small end-to-end script.",
  learningOrder: 10,
  prerequisiteIds: ["python-testing"],
  difficulty: "intermediate",
  relatedTopicIds: ["python-file-handling", "python-functions"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "python-project-requirements",
      title: "Project Requirements",
      description: "Translate a brief into clear inputs, outputs, and constraints.",
      difficulty: "intermediate",
    }),
    concept({
      id: "python-project-decomposition",
      title: "Decomposition",
      description: "Split the solution into modules and functions with single responsibilities.",
      difficulty: "intermediate",
    }),
    concept({
      id: "python-project-cli",
      title: "Simple CLI Flow",
      description: "Accept input, process data, and print or write results.",
      difficulty: "intermediate",
    }),
    concept({
      id: "python-project-persistence",
      title: "Persistence",
      description: "Read and write project data files reliably.",
      prerequisiteConceptIds: ["python-project-cli"],
      difficulty: "intermediate",
    }),
    concept({
      id: "python-project-validation",
      title: "Input Validation",
      description: "Reject bad input with clear errors before processing.",
      difficulty: "intermediate",
    }),
    concept({
      id: "python-project-demo",
      title: "Demo Checklist",
      description: "Prove the project with a short happy-path and failure-path demo.",
      difficulty: "intermediate",
    }),
  ],
  learningObjectives: [
    "Ship a small multi-file Python tool",
    "Validate inputs and persist results",
    "Demonstrate success and failure paths",
  ],
  practicalArtifacts: [
    artifact({
      id: "python-project-expense-tracker",
      type: "workflow",
      title: "Mini expense tracker workflow",
      content:
        "1) Read expenses.csv\n2) Validate amount > 0\n3) Sum by category\n4) Write summary.json\n5) Print top category",
      expectedOutput: "summary.json plus printed top spending category",
      explanation: "End-to-end workflow combining files, functions, validation, and output.",
      conceptIds: [
        "python-project-decomposition",
        "python-project-persistence",
        "python-project-validation",
        "python-project-cli",
      ],
    }),
  ],
  commonMistakes: [
    mistake(
      "python-project-monolith",
      "Putting all logic in one untested script",
      "Rushing to a demo.",
      "Extract pure helpers and test them.",
      ["python-project-decomposition"],
    ),
    mistake(
      "python-project-no-validation",
      "Trusting every input line",
      "Happy-path sample data only.",
      "Validate types and ranges; skip or report bad rows.",
      ["python-project-validation"],
    ),
  ],
  exercises: [
    exercise({
      id: "python-project-todo-cli",
      title: "Todo list CLI",
      instructions: [
        "Build a CLI that adds, lists, and completes todos stored in a JSON file.",
        "Include validation for empty titles and a --help style usage print.",
      ],
      hints: ["Separate IO from pure list updates", "Write at least one test for completion logic"],
      expectedOutcome: "Working CLI with persisted todos and basic validation.",
      conceptIds: [
        "python-project-cli",
        "python-project-persistence",
        "python-project-validation",
        "python-project-demo",
      ],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("python-project", [
    "python-project-requirements",
    "python-project-decomposition",
    "python-project-cli",
    "python-project-persistence",
    "python-project-validation",
  ]),
});

export const pythonKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-python",
  title: "Python",
  aliases: ["python", "learn python", "python programming", "python developer"],
  category: "Programming",
  description:
    "Canonical Python curriculum covering syntax, control flow, functions, collections, files, exceptions, OOP, modules, testing, and a practical project.",
  topics: [
    syntaxTopic,
    controlFlowTopic,
    functionsTopic,
    collectionsTopic,
    fileHandlingTopic,
    exceptionsTopic,
    oopTopic,
    modulesTopic,
    testingTopic,
    projectTopic,
  ],
});
