import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const astroSource = path.resolve(projectDir, "../astro-site/src/data/templates.ts");
const outputFile = path.resolve(projectDir, "src/data/astro-template-catalog.generated.ts");

const source = await readFile(astroSource, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const compiledModule = { exports: {} };
vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports }, { filename: astroSource });

const templates = compiledModule.exports.readyTemplates;
if (!Array.isArray(templates)) {
  throw new Error("Astro templates source did not export readyTemplates.");
}

const catalogTemplates = templates.map(({ slug, name, label, demoPath, style }) => {
  if (![slug, name, label, demoPath, style].every((value) => typeof value === "string" && value.length > 0)) {
    throw new Error(`Invalid published template data for ${slug ?? "unknown"}.`);
  }

  return { slug, name, label, demoPath, style };
});

const output = `// Этот файл генерируется из ../astro-site/src/data/templates.ts. Не редактировать вручную.\n\nexport const astroCatalogTemplates = ${JSON.stringify(catalogTemplates, null, 2)} as const;\n`;
await writeFile(outputFile, output, "utf8");
console.log(`Синхронизировано шаблонов: ${catalogTemplates.length}`);
