import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(".next", "static", "chunks");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function encodeDynamicSegment(filePath) {
  return filePath.replaceAll("[", "%5B").replaceAll("]", "%5D");
}

async function mirrorDynamicChunkFiles() {
  const files = await walk(ROOT);
  let mirroredCount = 0;

  for (const sourceFile of files) {
    const rel = path.relative(ROOT, sourceFile);
    if (!rel.includes("[") && !rel.includes("]")) {
      continue;
    }

    const encodedRel = encodeDynamicSegment(rel);
    if (encodedRel === rel) {
      continue;
    }

    const destFile = path.join(ROOT, encodedRel);
    await mkdir(path.dirname(destFile), { recursive: true });
    await cp(sourceFile, destFile, { force: true });
    mirroredCount += 1;
  }

  console.log(`[mirror-encoded-next-chunks] mirrored ${mirroredCount} dynamic chunk files.`);
}

async function main() {
  try {
    await mirrorDynamicChunkFiles();
  } catch (error) {
    console.error("[mirror-encoded-next-chunks] failed:", error);
    process.exitCode = 1;
  }
}

await main();
