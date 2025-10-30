import fs from "fs";
import path from "path";

export function saveToJson(filePath: string, key: string, value: string) {
  const resolvedPath = path.resolve(filePath);
  let data: Record<string, any> = {};
  if (fs.existsSync(resolvedPath)) {
    const raw = fs.readFileSync(resolvedPath, "utf-8");
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }
  }
  else {
    console.log(`⚠️ File not found: ${resolvedPath}`);
    return;
  }

  data[key] = value;

  fs.writeFileSync(resolvedPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Saved [${key}: ${value}] to ${path.basename(resolvedPath)}`);
}

export function readFromJson(filePath: string, key?: string): any {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.log(`⚠️ File not found: ${resolvedPath}`);
    return null;
  }

  const raw = fs.readFileSync(resolvedPath, "utf-8");
  let data: Record<string, any> = {};
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`❌ Error parsing JSON file: ${resolvedPath}`, e);
    return null;
  }

  if (key) {
    return data[key] ?? null;
  }
  return data;
}

export function saveToEnv(fileName: string, key: string, value: string) {
  const resolvedPath = path.resolve(process.cwd(), fileName);

  if (!fs.existsSync(resolvedPath)) {
    console.log(`⚠️ .env file not found: ${resolvedPath}`);
    return;
  }

  let content = fs.readFileSync(resolvedPath, "utf-8").split("\n");

  let found = false;
  content = content.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    content.push(`${key}=${value}`);
  }

  fs.writeFileSync(resolvedPath, content.join("\n"), "utf-8");
  console.log(`✅ Saved [${key}=${value}] to ${fileName}`);
}