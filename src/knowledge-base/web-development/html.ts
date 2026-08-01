import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","kubernetes pod","sql join","python class"];

const html_document_structureTopic = topic({
  id: "html-document-structure",
  title: "Document Structure",
  aliases: ["html structure","html boilerplate"],
  description: "Build valid HTML documents with doctype, html/head/body, and metadata.",
  learningOrder: 1,
  
  relatedTopicIds: ["html-text-and-media"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "html-doctype",
      title: "DOCTYPE",
      description: "DOCTYPE applied in this topic.",
    }),
    concept({
      id: "html-html-element",
      title: "html Element",
      description: "html Element applied in this topic.",
    }),
    concept({
      id: "html-head-metadata",
      title: "head Metadata",
      description: "head Metadata applied in this topic.",
    }),
    concept({
      id: "html-title",
      title: "title",
      description: "title applied in this topic.",
    }),
    concept({
      id: "html-body",
      title: "body",
      description: "body applied in this topic.",
    }),
    concept({
      id: "html-charset-and-viewport",
      title: "Charset and Viewport",
      description: "Charset and Viewport applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply DOCTYPE correctly","Explain html Element in context"],
  practicalArtifacts: [
    artifact({
      id: "html-document-structure-artifact",
      type: "code",
      title: "Minimal page",
      language: "html",
      content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\" />\n  <title>Lab</title>\n</head>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>",
      expectedOutput: "Browser shows Hello heading",
      explanation: "Valid HTML5 skeleton.",
      conceptIds: ["html-doctype","html-html-element","html-head-metadata","html-title"],
    }),
  ],
  commonMistakes: [
    mistake(
      "html-document-structure-mistake-1",
      "Misapplying DOCTYPE",
      "Skipping hands-on checks in Document Structure",
      "Practice DOCTYPE with a tiny example first.",
      ["html-doctype"],
    ),
    mistake(
      "html-document-structure-mistake-2",
      "Pulling unrelated-domain demos into Document Structure",
      "Defaulting to out-of-domain snippets",
      "Stay inside Document Structure concepts.",
      ["html-html-element"],
    ),
  ],
  exercises: [
    exercise({
      id: "html-document-structure-exercise",
      title: "Document Structure mini exercise",
      instructions: ["Build a small example covering DOCTYPE.","Extend it with html Element.","Verify behavior related to head Metadata."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Document Structure.",
      conceptIds: ["html-doctype","html-html-element","html-head-metadata"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("html-document-structure", ["html-doctype","html-html-element","html-head-metadata","html-title","html-body"],
    ["concept-understanding","code-interpretation","debugging","practical-scenario","configuration-analysis"]),
});

const html_text_and_mediaTopic = topic({
  id: "html-text-and-media",
  title: "Text and Media Elements",
  aliases: ["html images","html lists"],
  description: "Mark up headings, paragraphs, lists, images, and figures.",
  learningOrder: 2,
  prerequisiteIds: ["html-document-structure"],
  relatedTopicIds: ["html-links-and-navigation"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "html-headings",
      title: "Headings",
      description: "Headings applied in this topic.",
    }),
    concept({
      id: "html-paragraphs",
      title: "Paragraphs",
      description: "Paragraphs applied in this topic.",
    }),
    concept({
      id: "html-lists",
      title: "Lists",
      description: "Lists applied in this topic.",
    }),
    concept({
      id: "html-img",
      title: "img",
      description: "img applied in this topic.",
    }),
    concept({
      id: "html-figure-figcaption",
      title: "figure/figcaption",
      description: "figure/figcaption applied in this topic.",
    }),
    concept({
      id: "html-alt-text",
      title: "alt Text",
      description: "alt Text applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Headings correctly","Explain Paragraphs in context"],
  practicalArtifacts: [
    artifact({
      id: "html-text-and-media-artifact",
      type: "code",
      title: "Text and Media Elements worked example",
      
      content: "// Practical example for Text and Media Elements\n// Covers: Headings, Paragraphs, Lists",
      
      explanation: "Demonstrates Headings, Paragraphs, Lists.",
      conceptIds: ["html-headings","html-paragraphs","html-lists","html-img"],
    }),
  ],
  commonMistakes: [
    mistake(
      "html-text-and-media-mistake-1",
      "Misapplying Headings",
      "Skipping hands-on checks in Text and Media Elements",
      "Practice Headings with a tiny example first.",
      ["html-headings"],
    ),
    mistake(
      "html-text-and-media-mistake-2",
      "Pulling unrelated-domain demos into Text and Media Elements",
      "Defaulting to out-of-domain snippets",
      "Stay inside Text and Media Elements concepts.",
      ["html-paragraphs"],
    ),
  ],
  exercises: [
    exercise({
      id: "html-text-and-media-exercise",
      title: "Text and Media Elements mini exercise",
      instructions: ["Build a small example covering Headings.","Extend it with Paragraphs.","Verify behavior related to Lists."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Text and Media Elements.",
      conceptIds: ["html-headings","html-paragraphs","html-lists"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("html-text-and-media", ["html-headings","html-paragraphs","html-lists","html-img","html-figure-figcaption"],
    ["concept-understanding","code-interpretation","debugging","practical-scenario","configuration-analysis"]),
});

const html_links_and_navigationTopic = topic({
  id: "html-links-and-navigation",
  title: "Links and Navigation",
  aliases: ["html links","anchors"],
  description: "Connect pages with anchors, relative URLs, and nav landmarks.",
  learningOrder: 3,
  prerequisiteIds: ["html-text-and-media"],
  relatedTopicIds: ["html-forms"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "html-a-href",
      title: "a href",
      description: "a href applied in this topic.",
    }),
    concept({
      id: "html-relative-urls",
      title: "Relative URLs",
      description: "Relative URLs applied in this topic.",
    }),
    concept({
      id: "html-absolute-urls",
      title: "Absolute URLs",
      description: "Absolute URLs applied in this topic.",
    }),
    concept({
      id: "html-nav",
      title: "nav",
      description: "nav applied in this topic.",
    }),
    concept({
      id: "html-target-and-rel",
      title: "target and rel",
      description: "target and rel applied in this topic.",
    }),
    concept({
      id: "html-fragment-links",
      title: "Fragment Links",
      description: "Fragment Links applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply a href correctly","Explain Relative URLs in context"],
  practicalArtifacts: [
    artifact({
      id: "html-links-and-navigation-artifact",
      type: "code",
      title: "Links and Navigation worked example",
      
      content: "// Practical example for Links and Navigation\n// Covers: a href, Relative URLs, Absolute URLs",
      
      explanation: "Demonstrates a href, Relative URLs, Absolute URLs.",
      conceptIds: ["html-a-href","html-relative-urls","html-absolute-urls","html-nav"],
    }),
  ],
  commonMistakes: [
    mistake(
      "html-links-and-navigation-mistake-1",
      "Misapplying a href",
      "Skipping hands-on checks in Links and Navigation",
      "Practice a href with a tiny example first.",
      ["html-a-href"],
    ),
    mistake(
      "html-links-and-navigation-mistake-2",
      "Pulling unrelated-domain demos into Links and Navigation",
      "Defaulting to out-of-domain snippets",
      "Stay inside Links and Navigation concepts.",
      ["html-relative-urls"],
    ),
  ],
  exercises: [
    exercise({
      id: "html-links-and-navigation-exercise",
      title: "Links and Navigation mini exercise",
      instructions: ["Build a small example covering a href.","Extend it with Relative URLs.","Verify behavior related to Absolute URLs."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Links and Navigation.",
      conceptIds: ["html-a-href","html-relative-urls","html-absolute-urls"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("html-links-and-navigation", ["html-a-href","html-relative-urls","html-absolute-urls","html-nav","html-target-and-rel"],
    ["concept-understanding","code-interpretation","debugging","practical-scenario","configuration-analysis"]),
});

const html_formsTopic = topic({
  id: "html-forms",
  title: "Forms and Inputs",
  aliases: ["html forms","form inputs"],
  description: "Collect user input with forms, labels, and common control types.",
  learningOrder: 4,
  prerequisiteIds: ["html-links-and-navigation"],
  relatedTopicIds: ["html-semantic-structure"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "html-form",
      title: "form",
      description: "form applied in this topic.",
    }),
    concept({
      id: "html-input-types",
      title: "input Types",
      description: "input Types applied in this topic.",
    }),
    concept({
      id: "html-label",
      title: "label",
      description: "label applied in this topic.",
    }),
    concept({
      id: "html-select-textarea",
      title: "select/textarea",
      description: "select/textarea applied in this topic.",
    }),
    concept({
      id: "html-button",
      title: "button",
      description: "button applied in this topic.",
    }),
    concept({
      id: "html-name-value",
      title: "name/value",
      description: "name/value applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply form correctly","Explain input Types in context"],
  practicalArtifacts: [
    artifact({
      id: "html-forms-artifact",
      type: "code",
      title: "Signup form controls",
      language: "html",
      content: "<form action=\"/signup\" method=\"post\">\n  <label>Email <input type=\"email\" name=\"email\" required /></label>\n  <button type=\"submit\">Join</button>\n</form>",
      expectedOutput: "Accessible labeled email field with submit",
      explanation: "label + input association and submit button.",
      conceptIds: ["html-form","html-input-types","html-label","html-select-textarea"],
    }),
  ],
  commonMistakes: [
    mistake(
      "html-forms-mistake-1",
      "Misapplying form",
      "Skipping hands-on checks in Forms and Inputs",
      "Practice form with a tiny example first.",
      ["html-form"],
    ),
    mistake(
      "html-forms-mistake-2",
      "Pulling unrelated-domain demos into Forms and Inputs",
      "Defaulting to out-of-domain snippets",
      "Stay inside Forms and Inputs concepts.",
      ["html-input-types"],
    ),
  ],
  exercises: [
    exercise({
      id: "html-forms-exercise",
      title: "Forms and Inputs mini exercise",
      instructions: ["Build a small example covering form.","Extend it with input Types.","Verify behavior related to label."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Forms and Inputs.",
      conceptIds: ["html-form","html-input-types","html-label"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("html-forms", ["html-form","html-input-types","html-label","html-select-textarea","html-button"],
    ["concept-understanding","code-interpretation","debugging","practical-scenario","configuration-analysis"]),
});

const html_semantic_structureTopic = topic({
  id: "html-semantic-structure",
  title: "Semantic Structure",
  aliases: ["semantic html","sectioning"],
  description: "Choose semantic sectioning elements for meaningful page outlines.",
  learningOrder: 5,
  prerequisiteIds: ["html-forms"],
  relatedTopicIds: ["html-accessibility-basics"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "html-header",
      title: "header",
      description: "header applied in this topic.",
    }),
    concept({
      id: "html-main",
      title: "main",
      description: "main applied in this topic.",
    }),
    concept({
      id: "html-section",
      title: "section",
      description: "section applied in this topic.",
    }),
    concept({
      id: "html-article",
      title: "article",
      description: "article applied in this topic.",
    }),
    concept({
      id: "html-aside",
      title: "aside",
      description: "aside applied in this topic.",
    }),
    concept({
      id: "html-footer",
      title: "footer",
      description: "footer applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply header correctly","Explain main in context"],
  practicalArtifacts: [
    artifact({
      id: "html-semantic-structure-artifact",
      type: "code",
      title: "Semantic Structure worked example",
      
      content: "// Practical example for Semantic Structure\n// Covers: header, main, section",
      
      explanation: "Demonstrates header, main, section.",
      conceptIds: ["html-header","html-main","html-section","html-article"],
    }),
  ],
  commonMistakes: [
    mistake(
      "html-semantic-structure-mistake-1",
      "Misapplying header",
      "Skipping hands-on checks in Semantic Structure",
      "Practice header with a tiny example first.",
      ["html-header"],
    ),
    mistake(
      "html-semantic-structure-mistake-2",
      "Pulling unrelated-domain demos into Semantic Structure",
      "Defaulting to out-of-domain snippets",
      "Stay inside Semantic Structure concepts.",
      ["html-main"],
    ),
  ],
  exercises: [
    exercise({
      id: "html-semantic-structure-exercise",
      title: "Semantic Structure mini exercise",
      instructions: ["Build a small example covering header.","Extend it with main.","Verify behavior related to section."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Semantic Structure.",
      conceptIds: ["html-header","html-main","html-section"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("html-semantic-structure", ["html-header","html-main","html-section","html-article","html-aside"],
    ["concept-understanding","code-interpretation","debugging","practical-scenario","configuration-analysis"]),
});

const html_accessibility_basicsTopic = topic({
  id: "html-accessibility-basics",
  title: "Accessibility Basics",
  aliases: ["html a11y","accessibility"],
  description: "Improve usability with landmarks, alt text, and keyboard-friendly markup.",
  learningOrder: 6,
  prerequisiteIds: ["html-semantic-structure"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "html-accessible-names",
      title: "Accessible Names",
      description: "Accessible Names applied in this topic.",
    }),
    concept({
      id: "html-alt-text-quality",
      title: "alt Text Quality",
      description: "alt Text Quality applied in this topic.",
    }),
    concept({
      id: "html-landmark-roles",
      title: "Landmark Roles",
      description: "Landmark Roles applied in this topic.",
    }),
    concept({
      id: "html-keyboard-focus-order",
      title: "Keyboard Focus Order",
      description: "Keyboard Focus Order applied in this topic.",
    }),
    concept({
      id: "html-aria-label-intro",
      title: "aria-label Intro",
      description: "aria-label Intro applied in this topic.",
    }),
    concept({
      id: "html-heading-hierarchy",
      title: "Heading Hierarchy",
      description: "Heading Hierarchy applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Accessible Names correctly","Explain alt Text Quality in context"],
  practicalArtifacts: [
    artifact({
      id: "html-accessibility-basics-artifact",
      type: "code",
      title: "Accessibility Basics worked example",
      
      content: "// Practical example for Accessibility Basics\n// Covers: Accessible Names, alt Text Quality, Landmark Roles",
      
      explanation: "Demonstrates Accessible Names, alt Text Quality, Landmark Roles.",
      conceptIds: ["html-accessible-names","html-alt-text-quality","html-landmark-roles","html-keyboard-focus-order"],
    }),
  ],
  commonMistakes: [
    mistake(
      "html-accessibility-basics-mistake-1",
      "Misapplying Accessible Names",
      "Skipping hands-on checks in Accessibility Basics",
      "Practice Accessible Names with a tiny example first.",
      ["html-accessible-names"],
    ),
    mistake(
      "html-accessibility-basics-mistake-2",
      "Pulling unrelated-domain demos into Accessibility Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Accessibility Basics concepts.",
      ["html-alt-text-quality"],
    ),
  ],
  exercises: [
    exercise({
      id: "html-accessibility-basics-exercise",
      title: "Accessibility Basics mini exercise",
      instructions: ["Build a small example covering Accessible Names.","Extend it with alt Text Quality.","Verify behavior related to Landmark Roles."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Accessibility Basics.",
      conceptIds: ["html-accessible-names","html-alt-text-quality","html-landmark-roles"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("html-accessibility-basics", ["html-accessible-names","html-alt-text-quality","html-landmark-roles","html-keyboard-focus-order","html-aria-label-intro"],
    ["concept-understanding","code-interpretation","debugging","practical-scenario","configuration-analysis"]),
});

export const htmlKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-html",
  title: "HTML",
  aliases: ["html","learn html","html5","hypertext markup"],
  category: "Web Development",
  description: "HTML starter curriculum covering document structure, text/media, links/navigation, forms, semantics, and accessibility basics.",
  topics: [html_document_structureTopic, html_text_and_mediaTopic, html_links_and_navigationTopic, html_formsTopic, html_semantic_structureTopic, html_accessibility_basicsTopic],
});
