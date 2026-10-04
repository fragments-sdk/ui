#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const packageRoot = resolve(dirname(scriptPath), "..");
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  ".output",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  "storybook-static",
]);
const privateScope = ["@repo", "/"].join("");
const cliPackage = "@usefragments/cli";
const dependencyFields = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
  "bundledDependencies",
  "bundleDependencies",
];
const forbiddenText = [
  ["private repository URL", /github\.com\/fragments-sdk\/fragments\b/],
  ["private decision ID", /CW-D\d+/],
  ["internal task reference", /\bbrief[\s-]+\d+[a-z]?\b/i],
  ["private documentation path", /docs\/(?:fragments-v1|release)(?:\/|\b)/],
  ["private app path", /apps\/cloud\b/],
  ["private package specifier", new RegExp(privateScope)],
];
const secretPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],
  ["GitHub credential", /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})\b/],
  ["npm credential", /\bnpm_[A-Za-z0-9]{36,}\b/],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  [
    "literal credential",
    /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password)\s*[:=]\s*(?:["'][A-Za-z0-9_+/=-]{20,}["']|[A-Za-z0-9_+/=-]{20,}(?=\s|$))/i,
  ],
];

function trackedFiles(root) {
  try {
    return execFileSync("git", ["ls-files", "-z", "--", "."], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\0")
      .filter(Boolean);
  } catch {
    // Without Git, a kit folder in the supplied source tree has no proven exclusion.
    return null;
  }
}

function bannedPath(path) {
  if (/(?:^|\/)drift[^/]*\.cjs$/i.test(path)) return "private script path";
  if (/(?:^|\/)\.fragments\/drift[^/]*(?:\/|$)/i.test(path)) return "private state path";
  if (/(?:^|\/)tools\/drift(?:\/|$)/i.test(path)) return "private tooling path";
  return null;
}

/** Scan source and built files without printing matching secret values. */
export function scanPublicBoundary(root = packageRoot) {
  root = resolve(root);
  const findings = [];
  const tracked = trackedFiles(root);
  for (const path of tracked ?? []) {
    if (path.startsWith("fragments/")) {
      findings.push({ path, reason: "tracked generated kit file" });
    }
  }

  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      const path = relative(root, absolute).split(sep).join("/");
      if (entry.name === ".git") continue;
      if (
        entry.isDirectory() &&
        ignoredDirectories.has(entry.name) &&
        !(tracked ?? []).some((file) => file.startsWith(`${path}/`))
      )
        continue;
      const pathReason = bannedPath(path);
      if (pathReason) {
        findings.push({ path, reason: pathReason });
        continue;
      }
      if (directory === root && entry.name === "fragments" && entry.isDirectory()) {
        if (tracked === null) findings.push({ path, reason: "unexcluded generated kit folder" });
        continue;
      }
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      if (entry.isSymbolicLink()) {
        findings.push({ path, reason: "source symlink requires review" });
        continue;
      }
      if (!entry.isFile()) continue;
      const bytes = readFileSync(absolute);
      if (bytes.includes(0)) continue;
      const content = bytes.toString("utf8");
      if (entry.name === "package.json") {
        try {
          const manifest = JSON.parse(content);
          for (const field of dependencyFields) {
            const dependencies = manifest[field] ?? {};
            const names = Array.isArray(dependencies) ? dependencies : Object.keys(dependencies);
            for (const name of names) {
              const specifier = Array.isArray(dependencies) ? "" : String(dependencies[name]);
              if (
                name.startsWith(privateScope) ||
                name === cliPackage ||
                name.startsWith(`${cliPackage}/`) ||
                specifier.includes(privateScope) ||
                specifier.includes(cliPackage)
              ) {
                findings.push({ path, reason: `forbidden dependency in ${field}` });
              }
            }
          }
        } catch {
          findings.push({ path, reason: "invalid package manifest" });
        }
      }
      content.split("\n").forEach((line, index) => {
        for (const [reason, pattern] of [...forbiddenText, ...secretPatterns]) {
          if (pattern.test(line)) findings.push({ path, line: index + 1, reason });
        }
      });
    }
  }

  walk(root);
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 2 || args[0] !== "--root")) {
    console.error("Usage: node scripts/check-public-boundary.mjs [--root <source folder>]");
    process.exitCode = 2;
  } else {
    const findings = scanPublicBoundary(args[1] ?? packageRoot);
    for (const { path, line, reason } of findings) {
      console.error(`${path}${line ? `:${line}` : ""}: ${reason}`);
    }
    if (findings.length === 0) console.log("Public package boundary passed.");
    process.exitCode = findings.length === 0 ? 0 : 1;
  }
}
