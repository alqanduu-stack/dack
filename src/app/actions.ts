"use server";

import { revalidatePath } from "next/cache";
import { ImportKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { storeUpload } from "@/lib/storage";

function valueAsString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function valueAsOptionalDate(formData: FormData, key: string) {
  const value = valueAsString(formData, key);
  return value ? new Date(value) : undefined;
}

export async function createProject(formData: FormData) {
  const name = valueAsString(formData, "name");
  const clientName = valueAsString(formData, "clientName");
  const code = valueAsString(formData, "code");
  const description = valueAsString(formData, "description");

  if (!name) {
    throw new Error("Project name is required.");
  }

  await prisma.project.create({
    data: {
      name,
      clientName: clientName || null,
      code: code || null,
      description: description || null
    }
  });

  revalidatePath("/");
}

export async function createReportPeriod(formData: FormData) {
  const projectId = valueAsString(formData, "projectId");
  const label = valueAsString(formData, "label");
  const yearValue = valueAsString(formData, "year");
  const quarter = valueAsString(formData, "quarter");

  if (!projectId || !label) {
    throw new Error("Project and reporting period label are required.");
  }

  await prisma.reportPeriod.create({
    data: {
      projectId,
      label,
      year: yearValue ? Number(yearValue) : null,
      quarter: quarter || null,
      periodStart: valueAsOptionalDate(formData, "periodStart") ?? null,
      periodEnd: valueAsOptionalDate(formData, "periodEnd") ?? null
    }
  });

  revalidatePath("/");
}

export async function uploadSourceFile(formData: FormData) {
  const reportPeriodId = valueAsString(formData, "reportPeriodId");
  const kindValue = valueAsString(formData, "kind");
  const notes = valueAsString(formData, "notes");
  const file = formData.get("file");

  if (!reportPeriodId || !kindValue) {
    throw new Error("Reporting period and source file kind are required.");
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }

  const kind = ImportKind[kindValue as keyof typeof ImportKind];

  if (!kind) {
    throw new Error("Invalid source file type.");
  }

  const stored = await storeUpload({
    file,
    reportPeriodId
  });

  await prisma.sourceFile.create({
    data: {
      reportPeriodId,
      kind,
      name: stored.savedName,
      originalName: file.name,
      storagePath: stored.storagePath,
      mimeType: file.type || null,
      fileSize: file.size,
      notes: notes || null
    }
  });

  revalidatePath("/");
}
