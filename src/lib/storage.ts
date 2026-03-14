import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadRoot = process.env.UPLOAD_DIR || "./uploads";

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").toLowerCase();
}

export async function storeUpload({
  file,
  reportPeriodId
}: {
  file: File;
  reportPeriodId: string;
}) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name);
  const basename = path.basename(file.name, extension);
  const savedName = `${Date.now()}-${safeSegment(basename)}${extension}`;
  const relativeDir = path.join(safeSegment(reportPeriodId));
  const targetDir = path.join(uploadRoot, relativeDir);
  const targetPath = path.join(targetDir, savedName);

  await mkdir(targetDir, { recursive: true });
  await writeFile(targetPath, bytes);

  return {
    savedName,
    storagePath: targetPath
  };
}
