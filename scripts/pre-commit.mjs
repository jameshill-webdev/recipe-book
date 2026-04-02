#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

const packages = ["ui", "api", "shared"];
const steps = [
	{
		name: "Typecheck",
		run: (pkg) => ["run", "-w", pkg, "typecheck"],
	},
	{
		name: "Lint (ESLint)",
		run: (pkg) => ["run", "-w", pkg, "lint"],
	},
	{
		name: "Format (Prettier --write)",
		run: () => [],
	},
	{
		name: "Unit tests",
		run: (pkg) => ["run", "-w", pkg, "test"],
	},
];

function runNpm(args) {
	const result = spawnSync("npm", args, {
		stdio: "inherit",
		env: process.env,
	});

	if (result.error) {
		throw result.error;
	}

	return result.status ?? 1;
}

function runGit(args) {
	const result = spawnSync("git", args, {
		stdio: "inherit",
		env: process.env,
	});

	if (result.error) {
		throw result.error;
	}

	return result.status ?? 1;
}

function getStagedFiles() {
	const result = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
		encoding: "utf8",
		env: process.env,
	});

	if (result.error) {
		throw result.error;
	}

	if ((result.status ?? 1) !== 0) {
		return [];
	}

	return result.stdout
		.split("\n")
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function toPackageScopedFileList(pkg, stagedFiles) {
	const prefix = `${pkg}/`;
	return stagedFiles.filter((file) => file.startsWith(prefix));
}

function formatStagedFilesForPackage(pkg, stagedFiles) {
	const packageFiles = toPackageScopedFileList(pkg, stagedFiles);
	if (packageFiles.length === 0) {
		console.log(`[${pkg}] No staged files to format.`);
		return 0;
	}

	const fileArgs = packageFiles.map((file) => path.normalize(file));
	const prettierExitCode = runNpm(["exec", "--", "prettier", "--write", ...fileArgs]);
	if (prettierExitCode !== 0) {
		return prettierExitCode;
	}

	return runGit(["add", "--", ...fileArgs]);
}

console.log("\nRunning pre-commit checks for ui, api, and shared...\n");

for (const pkg of packages) {
	console.log(`========== ${pkg} ==========`);

	for (const step of steps) {
		console.log(`\n[${pkg}] ${step.name}`);
		const exitCode =
			step.name === "Format (Prettier --write)"
				? formatStagedFilesForPackage(pkg, getStagedFiles())
				: runNpm(step.run(pkg));
		if (exitCode !== 0) {
			console.error(`\n[pre-commit] Failed at ${pkg} -> ${step.name}. Commit aborted.`);
			process.exit(exitCode);
		}
	}

	console.log(`\n[${pkg}] All checks passed.`);
}

console.log("\nAll pre-commit checks passed. Proceeding with commit.\n");
