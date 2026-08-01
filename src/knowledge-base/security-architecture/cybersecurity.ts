import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["react hooks", "jsx", "python class", "sql join"];

const ciaTopic = topic({
  id: "cyber-cia-and-threats",
  title: "CIA Triad and Threat Models",
  aliases: ["cia triad", "threat modeling", "security goals"],
  description: "Frame security goals with confidentiality, integrity, availability, and basic threat modeling.",
  learningOrder: 1,
  relatedTopicIds: ["cyber-authn-authz"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "cyber-confidentiality", title: "Confidentiality", description: "Ensure only authorized parties can read sensitive data." }),
    concept({ id: "cyber-integrity", title: "Integrity", description: "Detect and prevent unauthorized modification of data or systems." }),
    concept({ id: "cyber-availability", title: "Availability", description: "Keep systems usable for legitimate users when needed." }),
    concept({ id: "cyber-asset", title: "Assets", description: "People, data, systems, and processes that need protection." }),
    concept({ id: "cyber-threat-actor", title: "Threat Actors", description: "Entities that may exploit weaknesses for gain or disruption." }),
    concept({ id: "cyber-stride", title: "STRIDE Overview", description: "Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation." }),
  ],
  learningObjectives: [
    "Map risks to CIA properties",
    "Sketch a simple STRIDE threat list for an app",
  ],
  practicalArtifacts: [
    artifact({
      id: "cyber-cia-threat-table",
      type: "case-study",
      title: "Login service threat table",
      content:
        "Asset: password database\n- Confidentiality: credential dump\n- Integrity: silent password rewrite\n- Availability: lockout/DoS on auth API\nSTRIDE samples: Spoofing(session), Tampering(token), Info disclosure(logs)",
      expectedOutput: "CIA + STRIDE rows for the login asset",
      explanation: "Concrete mapping from goals to threat categories.",
      conceptIds: ["cyber-confidentiality", "cyber-integrity", "cyber-availability", "cyber-stride"],
    }),
  ],
  commonMistakes: [
    mistake(
      "cyber-cia-only-c",
      "Focusing only on confidentiality",
      "Equating security with encryption alone",
      "Check integrity and availability impacts too.",
      ["cyber-confidentiality", "cyber-integrity", "cyber-availability"],
    ),
    mistake(
      "cyber-cia-no-asset",
      "Listing threats without naming assets",
      "Generic checklists",
      "Start from concrete assets and data flows.",
      ["cyber-asset", "cyber-stride"],
    ),
  ],
  exercises: [
    exercise({
      id: "cyber-cia-exercise",
      title: "Threat model a notes app",
      instructions: [
        "List three assets (account, notes data, sync API).",
        "For each, write one CIA risk and one STRIDE category.",
      ],
      hints: ["Think about shared devices", "Include denial of sync"],
      expectedOutcome: "Nine mapped risks across assets.",
      conceptIds: ["cyber-asset", "cyber-confidentiality", "cyber-stride"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "cyber-cia",
    ["cyber-confidentiality", "cyber-integrity", "cyber-availability", "cyber-asset", "cyber-stride"],
    ["concept-understanding", "architecture-reasoning", "practical-scenario", "debugging", "configuration-analysis"],
  ),
});

const authTopic = topic({
  id: "cyber-authn-authz",
  title: "Authentication and Authorization",
  aliases: ["authn", "authz", "rbac", "mfa"],
  description: "Verify identity and grant least-privilege access with MFA and RBAC patterns.",
  learningOrder: 2,
  prerequisiteIds: ["cyber-cia-and-threats"],
  relatedTopicIds: ["cyber-network-security"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "cyber-authentication", title: "Authentication", description: "Prove an identity with something you know/have/are." }),
    concept({ id: "cyber-authorization", title: "Authorization", description: "Decide which actions an authenticated identity may perform." }),
    concept({ id: "cyber-mfa", title: "Multi-Factor Authentication", description: "Combine independent factors to reduce credential-only risk." }),
    concept({ id: "cyber-rbac", title: "RBAC", description: "Assign permissions to roles, then roles to users." }),
    concept({ id: "cyber-session", title: "Sessions and Tokens", description: "Maintain authenticated state with cookies/tokens and expiry." }),
    concept({ id: "cyber-least-privilege", title: "Least Privilege", description: "Grant only the minimum access required for a task." }),
  ],
  learningObjectives: [
    "Separate authentication from authorization decisions",
    "Design a minimal RBAC matrix with MFA for admins",
  ],
  practicalArtifacts: [
    artifact({
      id: "cyber-auth-rbac-matrix",
      type: "configuration",
      title: "RBAC matrix snippet",
      language: "yaml",
      content:
        "roles:\n  viewer: [notes:read]\n  editor: [notes:read, notes:write]\n  admin: [notes:read, notes:write, users:manage]\npolicy:\n  admin_mfa: required\n  session_ttl_minutes: 30",
      expectedOutput: "Role permissions + MFA requirement for admin",
      explanation: "Least-privilege roles with stronger admin controls.",
      conceptIds: ["cyber-rbac", "cyber-mfa", "cyber-least-privilege", "cyber-session"],
    }),
  ],
  commonMistakes: [
    mistake(
      "cyber-auth-conflate",
      "Treating login success as authorization",
      "Authn/authz conflation",
      "Check permissions on every sensitive action.",
      ["cyber-authentication", "cyber-authorization"],
    ),
    mistake(
      "cyber-auth-long-lived",
      "Issuing never-expiring sessions",
      "Convenience over risk",
      "Set TTL and revoke on logout/password change.",
      ["cyber-session"],
    ),
  ],
  exercises: [
    exercise({
      id: "cyber-auth-exercise",
      title: "Permission check list",
      instructions: [
        "For endpoints GET /notes, POST /notes, DELETE /users/{id}, assign roles.",
        "Mark which require MFA.",
      ],
      hints: ["Admin-only user deletion", "Editors write notes"],
      expectedOutcome: "Clear role mapping with MFA flags.",
      conceptIds: ["cyber-rbac", "cyber-authorization", "cyber-mfa"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "cyber-auth",
    ["cyber-authentication", "cyber-authorization", "cyber-mfa", "cyber-rbac", "cyber-least-privilege"],
    ["concept-understanding", "architecture-reasoning", "practical-scenario", "configuration-analysis", "debugging"],
  ),
});

const networkTopic = topic({
  id: "cyber-network-security",
  title: "Network Security Basics",
  aliases: ["firewall", "tls", "segmentation"],
  description: "Segment networks, filter traffic, and protect data in transit with TLS.",
  learningOrder: 3,
  prerequisiteIds: ["cyber-cia-and-threats"],
  relatedTopicIds: ["cyber-cryptography-essentials"],
  contaminationTerms: [...CONTAMINATION, "vpc subnet"],
  concepts: [
    concept({ id: "cyber-firewall", title: "Firewalls", description: "Allow/deny traffic based on rules at host or network edges." }),
    concept({ id: "cyber-segmentation", title: "Segmentation", description: "Isolate tiers so a breach in one zone cannot freely reach others." }),
    concept({ id: "cyber-tls", title: "TLS", description: "Encrypt and authenticate network sessions in transit." }),
    concept({ id: "cyber-ports", title: "Ports and Services", description: "Expose only required listening services." }),
    concept({ id: "cyber-ids", title: "IDS/IPS Awareness", description: "Detect or block suspicious network patterns." }),
    concept({ id: "cyber-zero-trust-lite", title: "Verify Explicitly", description: "Authenticate and authorize every request path, not just the perimeter." }),
  ],
  learningObjectives: [
    "Propose a segmented layout for web/app/data tiers",
    "Require TLS for external and sensitive internal traffic",
  ],
  practicalArtifacts: [
    artifact({
      id: "cyber-network-rules",
      type: "configuration",
      title: "Host firewall allowlist",
      language: "text",
      content:
        "INBOUND allow 443/tcp from any  # public HTTPS\nINBOUND allow 22/tcp from bastion-net\nINBOUND deny all\nOUTBOUND allow 443/tcp\nOUTBOUND deny all",
      expectedOutput: "Only HTTPS public + SSH from bastion",
      explanation: "Default-deny with explicit allows.",
      conceptIds: ["cyber-firewall", "cyber-ports", "cyber-segmentation"],
    }),
  ],
  commonMistakes: [
    mistake(
      "cyber-net-any-any",
      "any/any firewall rules in production",
      "Temporary debug rules left behind",
      "Default deny; tighten sources and ports.",
      ["cyber-firewall", "cyber-ports"],
    ),
    mistake(
      "cyber-net-http-only",
      "Serving credentials over cleartext HTTP",
      "Local-dev habits in prod",
      "Terminate TLS and redirect HTTP to HTTPS.",
      ["cyber-tls"],
    ),
  ],
  exercises: [
    exercise({
      id: "cyber-network-exercise",
      title: "Tier allow matrix",
      instructions: [
        "Define web, app, and data tiers.",
        "List which tier may initiate connections to which, and on which ports.",
      ],
      hints: ["Data tier should not be public", "Web talks to app only"],
      expectedOutcome: "Allow matrix with no public data-tier exposure.",
      conceptIds: ["cyber-segmentation", "cyber-ports", "cyber-firewall"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "cyber-network",
    ["cyber-firewall", "cyber-segmentation", "cyber-tls", "cyber-ports", "cyber-zero-trust-lite"],
    ["architecture-reasoning", "configuration-analysis", "practical-scenario", "concept-understanding", "debugging"],
  ),
});

const cryptoTopic = topic({
  id: "cyber-cryptography-essentials",
  title: "Cryptography Essentials",
  aliases: ["hashing", "encryption", "hmac", "password hashing"],
  description: "Choose hashing, symmetric/asymmetric encryption, and password hashing appropriately.",
  learningOrder: 4,
  prerequisiteIds: ["cyber-cia-and-threats"],
  relatedTopicIds: ["cyber-vulnerability-management"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "cyber-hashing", title: "Cryptographic Hashing", description: "One-way fingerprints for integrity checks." }),
    concept({ id: "cyber-symmetric", title: "Symmetric Encryption", description: "Same key encrypts and decrypts (e.g. AES)." }),
    concept({ id: "cyber-asymmetric", title: "Asymmetric Encryption", description: "Key pairs for encryption/signatures (e.g. RSA/ECC)." }),
    concept({ id: "cyber-hmac", title: "HMAC", description: "Keyed message authentication codes for integrity+authenticity." }),
    concept({ id: "cyber-password-hash", title: "Password Hashing", description: "Slow adaptive hashes (bcrypt/argon2) with salt." }),
    concept({ id: "cyber-key-management", title: "Key Management Basics", description: "Store, rotate, and scope keys outside source code." }),
  ],
  learningObjectives: [
    "Pick hash vs encrypt vs MAC for a given goal",
    "Store passwords with a modern password hash",
  ],
  practicalArtifacts: [
    artifact({
      id: "cyber-crypto-decision",
      type: "workflow",
      title: "Crypto decision checklist",
      content:
        "1) Need secrecy? encrypt\n2) Need integrity of a file? hash (+ signature if trust matters)\n3) Need API request authenticity? HMAC or signed JWT\n4) Storing passwords? password hash + unique salt\n5) Keys live in a secrets manager, not git",
      expectedOutput: "Correct primitive chosen for each scenario",
      explanation: "Separates common crypto jobs.",
      conceptIds: ["cyber-hashing", "cyber-symmetric", "cyber-hmac", "cyber-password-hash"],
    }),
  ],
  commonMistakes: [
    mistake(
      "cyber-crypto-md5-password",
      "Hashing passwords with MD5/SHA1 once",
      "Confusing checksums with password hashing",
      "Use bcrypt/argon2/scrypt with salt.",
      ["cyber-password-hash", "cyber-hashing"],
    ),
    mistake(
      "cyber-crypto-key-in-repo",
      "Committing encryption keys to git",
      "Convenience during demos",
      "Load keys from a secrets manager or env vault.",
      ["cyber-key-management"],
    ),
  ],
  exercises: [
    exercise({
      id: "cyber-crypto-exercise",
      title: "Choose the primitive",
      instructions: [
        "For (a) download integrity, (b) chat secrecy, (c) password storage, name the right primitive.",
        "Write one misuse to avoid for each.",
      ],
      hints: ["Hash ≠ password hash", "Symmetric for bulk secrecy"],
      expectedOutcome: "Three correct primitive choices with misuses.",
      conceptIds: ["cyber-hashing", "cyber-symmetric", "cyber-password-hash"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "cyber-crypto",
    ["cyber-hashing", "cyber-symmetric", "cyber-asymmetric", "cyber-hmac", "cyber-password-hash"],
    ["concept-understanding", "practical-scenario", "debugging", "architecture-reasoning", "configuration-analysis"],
  ),
});

const vulnTopic = topic({
  id: "cyber-vulnerability-management",
  title: "Vulnerability Management",
  aliases: ["cve", "patching", "owasp", "scanning"],
  description: "Discover, prioritize, and remediate vulnerabilities with a repeatable process.",
  learningOrder: 5,
  prerequisiteIds: ["cyber-authn-authz", "cyber-network-security"],
  relatedTopicIds: ["cyber-incident-response"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "cyber-cve", title: "CVE", description: "Common identifiers for publicly disclosed vulnerabilities." }),
    concept({ id: "cyber-cvss", title: "CVSS Awareness", description: "Severity scoring that informs prioritization (not the only factor)." }),
    concept({ id: "cyber-scanning", title: "Vulnerability Scanning", description: "Automated discovery of known weaknesses in systems/deps." }),
    concept({ id: "cyber-patch", title: "Patch Management", description: "Plan, test, and deploy fixes on a defined cadence." }),
    concept({ id: "cyber-owasp", title: "OWASP Top Risks", description: "Common application risk classes such as injection and broken access control." }),
    concept({ id: "cyber-dependency", title: "Dependency Risk", description: "Third-party libraries can import known CVEs into your app." }),
  ],
  learningObjectives: [
    "Triage a CVE with exploitability and asset exposure",
    "Outline a weekly patch/scan cadence",
  ],
  practicalArtifacts: [
    artifact({
      id: "cyber-vuln-triage",
      type: "case-study",
      title: "CVE triage card",
      content:
        "CVE-YYYY-NNNN | CVSS 9.8 | Affects libX@1.2\nExposed? public internet service uses libX\nExploit? public PoC exists\nAction: upgrade to 1.2.4 within 48h; add WAF rule interim\nVerify: scanner clean + smoke tests",
      expectedOutput: "Prioritized remediation with verification step",
      explanation: "Severity + exposure + exploitability drive urgency.",
      conceptIds: ["cyber-cve", "cyber-cvss", "cyber-patch", "cyber-dependency"],
    }),
  ],
  commonMistakes: [
    mistake(
      "cyber-vuln-score-only",
      "Patching strictly by CVSS number alone",
      "Ignoring exposure context",
      "Weight internet exposure and business impact.",
      ["cyber-cvss", "cyber-patch"],
    ),
    mistake(
      "cyber-vuln-scan-ignore",
      "Running scanners without remediation owners",
      "Compliance theater",
      "Assign owners and SLAs per severity.",
      ["cyber-scanning", "cyber-patch"],
    ),
  ],
  exercises: [
    exercise({
      id: "cyber-vuln-exercise",
      title: "Dependency CVE plan",
      instructions: [
        "Given three CVEs in transitive deps, rank remediation order.",
        "Write the verify step for the top item.",
      ],
      hints: ["Public-facing services first", "Include rollback note"],
      expectedOutcome: "Ordered list with verification for #1.",
      conceptIds: ["cyber-dependency", "cyber-cve", "cyber-patch"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "cyber-vuln",
    ["cyber-cve", "cyber-cvss", "cyber-scanning", "cyber-patch", "cyber-owasp"],
    ["practical-scenario", "architecture-reasoning", "concept-understanding", "debugging", "configuration-analysis"],
  ),
});

const irTopic = topic({
  id: "cyber-incident-response",
  title: "Incident Response Basics",
  aliases: ["incident response", "ir process", "containment"],
  description: "Prepare, detect, contain, eradicate, recover, and learn from security incidents.",
  learningOrder: 6,
  prerequisiteIds: ["cyber-vulnerability-management", "cyber-authn-authz"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "cyber-ir-prepare", title: "Preparation", description: "Runbooks, contacts, logging, and access ready before an incident." }),
    concept({ id: "cyber-ir-detect", title: "Detection & Analysis", description: "Spot and triage anomalous signals with enough context." }),
    concept({ id: "cyber-ir-contain", title: "Containment", description: "Limit blast radius while preserving evidence." }),
    concept({ id: "cyber-ir-eradicate", title: "Eradication", description: "Remove attacker footholds and root causes." }),
    concept({ id: "cyber-ir-recover", title: "Recovery", description: "Restore services safely and monitor for reinfection." }),
    concept({ id: "cyber-ir-lessons", title: "Lessons Learned", description: "Post-incident review that improves controls and runbooks." }),
  ],
  learningObjectives: [
    "Walk an incident through containment to recovery",
    "Write a one-page runbook for stolen credentials",
  ],
  practicalArtifacts: [
    artifact({
      id: "cyber-ir-cred-runbook",
      type: "workflow",
      title: "Stolen API key runbook",
      content:
        "1) Detect: anomalous calls from new geo\n2) Contain: revoke key; block IP set\n3) Eradicate: rotate related secrets; audit roles\n4) Recover: issue new key via secure channel\n5) Lessons: add anomaly alert + shorter key TTL",
      expectedOutput: "Ordered IR actions with a prevention follow-up",
      explanation: "Maps NIST-style IR steps to a concrete credential incident.",
      conceptIds: ["cyber-ir-detect", "cyber-ir-contain", "cyber-ir-eradicate", "cyber-ir-recover"],
    }),
  ],
  commonMistakes: [
    mistake(
      "cyber-ir-wipe-first",
      "Reimaging systems before collecting evidence",
      "Rushing to restore availability",
      "Contain thoughtfully; preserve volatile evidence when feasible.",
      ["cyber-ir-contain", "cyber-ir-detect"],
    ),
    mistake(
      "cyber-ir-no-comms",
      "Skipping stakeholder communication",
      "Engineering-only response",
      "Follow the comms tree in the runbook.",
      ["cyber-ir-prepare", "cyber-ir-lessons"],
    ),
  ],
  exercises: [
    exercise({
      id: "cyber-ir-exercise",
      title: "Phishing mailbox compromise",
      instructions: [
        "Draft IR steps for a mailbox takeover that sent spam.",
        "Include containment, user recovery, and a lessons-learned action.",
      ],
      hints: ["Reset sessions/tokens", "Check forwarding rules"],
      expectedOutcome: "Six-step mini runbook covering IR phases.",
      conceptIds: ["cyber-ir-contain", "cyber-ir-recover", "cyber-ir-lessons"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "cyber-ir",
    ["cyber-ir-prepare", "cyber-ir-detect", "cyber-ir-contain", "cyber-ir-eradicate", "cyber-ir-recover"],
    ["practical-scenario", "architecture-reasoning", "concept-understanding", "debugging", "configuration-analysis"],
  ),
});

export const cybersecurityKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-cybersecurity",
  title: "Cybersecurity",
  aliases: ["cybersecurity", "infosec", "security+", "learn cybersecurity", "information security"],
  category: "Cybersecurity",
  description:
    "Starter cybersecurity curriculum covering CIA/threats, authn/authz, network security, cryptography, vulnerability management, and incident response.",
  topics: [ciaTopic, authTopic, networkTopic, cryptoTopic, vulnTopic, irTopic],
});
