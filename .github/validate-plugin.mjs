// Checks this repository against a small, hand-picked subset of Agent
// Plugins 1.0.0, the Agent Skills specification, and Claude Code's own
// .claude-plugin/ plugin format — the structural invariants below, not full
// schema conformance (no additionalProperties enforcement, no type-checking
// of optional fields). Run it anywhere: `node .github/validate-plugin.mjs`
//
// Why this exists: the failure it catches is silent. If a skill directory is
// renamed and the `name:` in its SKILL.md is not, or a skill is nested one
// level too deep, a client does not error — it just never loads the skill.
// The skill then never fires, and the only symptom is that nothing happens.
//
// It lives under .github/ rather than in a top-level scripts/ directory so
// that the plugin's own namespace (plugin.json, skills/, mcp.json) stays
// exactly as the specification describes it.
//
// No dependencies, on purpose: nothing to install, nothing to keep updated.

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
const root = fileURLToPath(new URL("..", import.meta.url))

const findings = []
const finding = (file, detail) => findings.push({ file, detail })

// --- plugin.json (Agent Plugins 1.0.0) -------------------------------------

let plugin
try {
	plugin = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"))
} catch (err) {
	finding("plugin.json", `not readable as JSON: ${err.message}`)
}

if (plugin) {
	// $schema is how a client knows which version of the format this targets.
	if (plugin.$schema !== PLUGIN_SCHEMA) {
		finding("plugin.json", `$schema must be "${PLUGIN_SCHEMA}", found ${JSON.stringify(plugin.$schema)}`)
	}
	// name: 1-64 characters, lowercase alphanumerics, hyphens and periods.
	if (typeof plugin.name !== "string" || !/^[a-z0-9.-]{1,64}$/.test(plugin.name)) {
		finding("plugin.json", `name must be 1-64 chars of [a-z0-9.-], found ${JSON.stringify(plugin.name)}`)
	}
}

// --- .claude-plugin/ (Claude Code's own plugin format) ----------------------

// Claude Code doesn't read root-level plugin.json (that's Agent Plugins
// 1.0.0) — it looks for .claude-plugin/plugin.json and
// .claude-plugin/marketplace.json instead. Both live alongside the Agent
// Plugins manifest so this repo installs directly in either client.

let claudePlugin
try {
	claudePlugin = JSON.parse(readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8"))
} catch (err) {
	finding(".claude-plugin/plugin.json", `not readable as JSON: ${err.message}`)
}
if (claudePlugin && typeof claudePlugin.name !== "string") {
	finding(".claude-plugin/plugin.json", `name must be a string, found ${JSON.stringify(claudePlugin.name)}`)
}

let marketplace
try {
	marketplace = JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"))
} catch (err) {
	finding(".claude-plugin/marketplace.json", `not readable as JSON: ${err.message}`)
}
if (marketplace) {
	if (typeof marketplace.name !== "string") {
		finding(".claude-plugin/marketplace.json", `name must be a string, found ${JSON.stringify(marketplace.name)}`)
	}
	if (!marketplace.owner || typeof marketplace.owner.name !== "string") {
		finding(".claude-plugin/marketplace.json", "owner.name must be a string")
	}
	if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
		finding(".claude-plugin/marketplace.json", "plugins must be a non-empty array")
	}
	for (const [i, entry] of (marketplace.plugins ?? []).entries()) {
		const label = `.claude-plugin/marketplace.json plugins[${i}]`
		if (typeof entry.name !== "string") {
			finding(label, `name must be a string, found ${JSON.stringify(entry.name)}`)
		}
		// source is required. Relative-path sources are checked fully — the
		// ones that can silently point at nothing, or outside the repo entirely.
		// github/url/npm/etc. sources are objects, fetched at install time and
		// out of reach of a static check like this one, so only their shape (an
		// object) is confirmed here, not their contents.
		const rootNoTrailingSep = root.replace(/[/\\]+$/, "")
		if (entry.source === undefined) {
			finding(label, "source is required")
		} else if (typeof entry.source === "string") {
			if (!entry.source.startsWith("./")) {
				finding(label, `relative source "${entry.source}" must start with "./"`)
			} else {
				// Resolve and confirm containment before touching the filesystem —
				// "./.." starts with "./" but escapes root, and join() alone (used
				// previously here) doesn't catch that.
				const resolved = resolve(root, entry.source)
				if (resolved !== rootNoTrailingSep && !resolved.startsWith(rootNoTrailingSep + sep)) {
					finding(label, `source "${entry.source}" resolves outside the repository root`)
				} else {
					try {
						if (!statSync(resolved).isDirectory()) {
							finding(label, `source "${entry.source}" is not a directory`)
						}
					} catch {
						finding(label, `source "${entry.source}" does not resolve to an existing path in the repo`)
					}
				}
			}
		} else if (typeof entry.source !== "object" || entry.source === null) {
			finding(label, `source must be a relative path string or a source object, found ${JSON.stringify(entry.source)}`)
		}
	}
}

// --- skills/ (Agent Skills specification) ----------------------------------

// A skill is only recognised in a *direct* subdirectory of skills/. Anything
// deeper is invisible to clients, which is one of the silent failures above.
const skillsDir = join(root, "skills")
let entries = []
try {
	entries = readdirSync(skillsDir, { withFileTypes: true })
} catch {
	finding("skills/", "directory is missing — a plugin with no skills loads nothing")
}

const skillDirs = entries.filter((e) => e.isDirectory())
if (entries.length > 0 && skillDirs.length === 0) {
	finding("skills/", "contains no skill directories")
}

for (const dir of skillDirs) {
	const path = join(skillsDir, dir.name, "SKILL.md")
	const rel = `skills/${dir.name}/SKILL.md`

	let text
	try {
		text = readFileSync(path, "utf8")
	} catch {
		finding(rel, "missing — a skill directory without SKILL.md is not a skill")
		continue
	}

	const block = text.match(/^---\n([\s\S]*?)\n---\n/)
	if (!block) {
		finding(rel, "no YAML frontmatter delimited by --- at the top of the file")
		continue
	}

	const fields = parseFrontmatter(block[1], rel)

	// The single highest-value check: name must match the parent directory.
	// These drift apart whenever a directory is renamed.
	if (fields.name !== dir.name) {
		finding(rel, `name is ${JSON.stringify(fields.name)} but the directory is "${dir.name}" — they must match`)
	}
	// 1-64 chars, lowercase alphanumerics and hyphens, no leading/trailing
	// hyphen, no consecutive hyphens.
	if (typeof fields.name !== "string" || fields.name.length > 64 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.name)) {
		finding(rel, `name must be 1-64 chars, lowercase a-z0-9 and single hyphens, found ${JSON.stringify(fields.name)}`)
	}
	// description is what makes a skill fire at all. An empty one means the
	// skill is installed and never invoked.
	const description = typeof fields.description === "string" ? fields.description.trim() : ""
	if (description.length < 1) {
		finding(rel, "description is required — without it the skill will not be invoked automatically")
	} else if (description.length > 1024) {
		finding(rel, `description is ${description.length} characters, the limit is 1024`)
	}
}

// A SKILL.md anywhere other than skills/<name>/SKILL.md will not be loaded.
for (const stray of findStraySkillFiles(skillsDir)) {
	finding(relative(root, stray), "SKILL.md is not directly inside skills/<skill-name>/ — clients will not find it")
}

// --- report ----------------------------------------------------------------

if (findings.length === 0) {
	console.log(`OK — plugin.json and ${skillDirs.length} skill(s) pass these checks (not a full spec validator — see the comment at the top of this file)`)
	process.exit(0)
}

console.error(`FAIL — ${findings.length} finding(s):\n`)
for (const f of findings) {
	console.error(`  ${f.file}: ${f.detail}`)
}
process.exit(1)

// --- helpers ---------------------------------------------------------------

/**
 * Reads `key: value` pairs from a frontmatter block.
 *
 * Deliberately not a YAML parser — this repository only ever uses single-line
 * scalar values, and a dependency-free approximation that reports what it
 * cannot handle is more honest than one that quietly guesses.
 *
 * The catch is that "what it cannot handle" has to include the constructs a
 * real parser *rejects*, not just the ones this code cannot read. An earlier
 * version read a plain scalar containing ": " without complaint; every real
 * YAML parser refuses that line, so the frontmatter was invalid and this
 * checker still passed it. The rules below exist for that class: a value that
 * needs quoting must be quoted.
 */
function parseFrontmatter(block, rel) {
	const fields = {}
	for (const line of block.split("\n")) {
		const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
		if (!match) continue
		const [, key, raw] = match

		const quoted = /^"[^"]*"$/.test(raw) || /^'[^']*'$/.test(raw)
		if (!quoted) {
			if (raw.startsWith("|") || raw.startsWith(">")) {
				finding(rel, `${key} uses a YAML block scalar, which this checker does not read — inline it on one line`)
				continue
			}
			// ": " ends the key in YAML's eyes, so a plain scalar containing one
			// is parsed as a nested mapping and rejected.
			if (raw.includes(": ")) {
				finding(rel, `${key} contains ": " but is not quoted — YAML rejects this; wrap the whole value in double quotes`)
				continue
			}
			if (raw.endsWith(":")) {
				finding(rel, `${key} ends with ":" but is not quoted — YAML rejects this; wrap the whole value in double quotes`)
				continue
			}
			// " #" starts a comment, silently truncating the value.
			if (raw.includes(" #")) {
				finding(rel, `${key} contains " #" but is not quoted — YAML would treat the rest as a comment`)
				continue
			}
			// Leading indicator characters change the value's type or are errors.
			if (/^[[\]{}&*!%@`,?]/.test(raw)) {
				finding(rel, `${key} starts with the YAML indicator ${JSON.stringify(raw[0])} but is not quoted — wrap the value in double quotes`)
				continue
			}
		}
		if (/^"/.test(raw) && !quoted) {
			finding(rel, `${key} opens with a double quote but does not close cleanly — check for an unescaped " inside the value`)
			continue
		}

		fields[key] = quoted ? raw.slice(1, -1) : raw
	}
	return fields
}

/** Every SKILL.md under skills/ that is not at skills/<name>/SKILL.md. */
function findStraySkillFiles(dir, depth = 0, out = []) {
	let listing
	try {
		listing = readdirSync(dir, { withFileTypes: true })
	} catch {
		return out
	}
	for (const entry of listing) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) {
			findStraySkillFiles(full, depth + 1, out)
		} else if (entry.name === "SKILL.md" && depth !== 1) {
			out.push(full)
		}
	}
	return out
}
