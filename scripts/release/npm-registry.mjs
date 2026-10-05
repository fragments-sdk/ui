import { spawnSync } from "node:child_process";

export const NPM_REGISTRY = "https://registry.npmjs.org/";

export class NpmRegistryCommandError extends Error {
  constructor(args, result) {
    const output = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
    super(`npm ${args.join(" ")} failed with exit ${result.status}: ${output}`);
    this.name = "NpmRegistryCommandError";
    this.args = args;
    this.status = result.status;
    this.stdout = result.stdout;
    this.stderr = result.stderr;
    this.npmCode = detectNpmErrorCode(result.stdout, result.stderr);
  }
}

function jsonErrorCode(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed?.error?.code ?? parsed?.code ?? null;
  } catch {
    return null;
  }
}

export function detectNpmErrorCode(stdout = "", stderr = "") {
  const jsonCode = jsonErrorCode(stdout) ?? jsonErrorCode(stderr);
  if (typeof jsonCode === "string") return jsonCode;
  const combined = `${stderr}\n${stdout}`;
  const lineMatch = combined.match(/(?:^|\n)npm (?:error|ERR!) code ([A-Z0-9]+)/i);
  return lineMatch?.[1]?.toUpperCase() ?? null;
}

export function isNpmNotFoundError(error) {
  return error instanceof NpmRegistryCommandError && error.npmCode === "E404";
}

function sleep(delayMs) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
}

/**
 * Every registry read and write the release makes. Writes authenticate through npm trusted
 * publishing (GitHub OIDC); nothing here reads or passes a token.
 */
export class NpmRegistryClient {
  constructor({
    command = process.env.FRAGMENTS_NPM_COMMAND || "npm",
    registry = NPM_REGISTRY,
    env = process.env,
  } = {}) {
    this.command = command;
    this.registry = registry;
    this.env = env;
  }

  run(args, { cwd, inherit = false } = {}) {
    const result = spawnSync(this.command, args, {
      cwd,
      env: this.env,
      encoding: "utf8",
      stdio: inherit ? ["ignore", "inherit", "inherit"] : ["ignore", "pipe", "pipe"],
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new NpmRegistryCommandError(args, {
        status: result.status,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
      });
    }
    return inherit ? "" : (result.stdout ?? "").trim();
  }

  json(args, options) {
    const output = this.run([...args, "--json", "--registry", this.registry], options);
    if (!output) return null;
    try {
      return JSON.parse(output);
    } catch (error) {
      throw new Error(`npm ${args.join(" ")} returned invalid JSON: ${error.message}`);
    }
  }

  jsonOrNull(args, options) {
    try {
      return this.json(args, options);
    } catch (error) {
      if (isNpmNotFoundError(error)) return null;
      throw error;
    }
  }

  exactPackage(name, version) {
    const metadata = this.jsonOrNull([
      "view",
      `${name}@${version}`,
      "version",
      "dist.integrity",
      "dist.tarball",
    ]);
    if (metadata === null) return null;
    if (typeof metadata === "string") {
      return { version: metadata, integrity: null, tarball: null };
    }
    return {
      version: metadata.version,
      integrity: metadata["dist.integrity"] ?? metadata.dist?.integrity ?? null,
      tarball: metadata["dist.tarball"] ?? metadata.dist?.tarball ?? null,
    };
  }

  // A version npm has accepted can take minutes to become publicly readable. Keep one
  // immutable release run alive through that window instead of forcing a rebuild and retry.
  waitForExactPackage(name, version, { attempts = 120, delayMs = 5000 } = {}) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const metadata = this.exactPackage(name, version);
      if (metadata) return metadata;
      if (attempt < attempts) sleep(delayMs);
    }
    return null;
  }

  distTags(name) {
    const tags = this.jsonOrNull(["view", name, "dist-tags"]);
    return tags === null ? null : tags;
  }

  waitForDistTag(name, tag, version, { attempts = 12, delayMs = 5000 } = {}) {
    let tags = {};
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      tags = this.distTags(name) ?? {};
      if (tags[tag] === version) return tags;
      if (attempt < attempts) sleep(delayMs);
    }
    return tags;
  }

  publishTarball(tarballPath, tag) {
    this.run(
      [
        "publish",
        tarballPath,
        "--ignore-scripts",
        "--tag",
        tag,
        "--access",
        "public",
        "--registry",
        this.registry,
      ],
      { inherit: true }
    );
  }

  addDistTag(name, version, tag) {
    this.run(["dist-tag", "add", `${name}@${version}`, tag, "--registry", this.registry], {
      inherit: true,
    });
  }

  removeDistTag(name, tag) {
    this.run(["dist-tag", "rm", name, tag, "--registry", this.registry], {
      inherit: true,
    });
  }
}
