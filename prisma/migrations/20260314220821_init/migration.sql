-- CreateEnum
CREATE TYPE "ImportKind" AS ENUM ('UTILIZATION', 'WORKFORCE', 'REPORT_TEMPLATE', 'SUPPORTING_DOCUMENT');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PARSED', 'NEEDS_REVIEW', 'APPROVED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'EXPORTED');

-- CreateEnum
CREATE TYPE "ContractorRole" AS ENUM ('PRIME', 'SUBCONTRACTOR', 'SUPPLIER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DiversityCategory" AS ENUM ('MBE', 'WBE', 'SDVOB', 'NON_MWBE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportPeriod" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "year" INTEGER,
    "quarter" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceFile" (
    "id" TEXT NOT NULL,
    "reportPeriodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "kind" "ImportKind" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "certification" "DiversityCategory" NOT NULL DEFAULT 'UNKNOWN',
    "role" "ContractorRole" NOT NULL DEFAULT 'UNKNOWN',
    "towardGoalPercent" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UtilizationRecord" (
    "id" TEXT NOT NULL,
    "reportPeriodId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "sourceFileId" TEXT,
    "certification" "DiversityCategory" NOT NULL DEFAULT 'UNKNOWN',
    "role" "ContractorRole" NOT NULL DEFAULT 'UNKNOWN',
    "contractValue" DECIMAL(14,2) NOT NULL,
    "towardGoalValue" DECIMAL(14,2) NOT NULL,
    "paidToDate" DECIMAL(14,2) NOT NULL,
    "pendingPayment" DECIMAL(14,2),
    "utilizationPlanReceived" BOOLEAN NOT NULL DEFAULT false,
    "sourceRowRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UtilizationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkforceRecord" (
    "id" TEXT NOT NULL,
    "reportPeriodId" TEXT NOT NULL,
    "contractorId" TEXT,
    "sourceFileId" TEXT,
    "companyName" TEXT NOT NULL,
    "quarter" TEXT,
    "eeoJobTitle" TEXT,
    "raceEthnicity" TEXT,
    "gender" TEXT,
    "employeeCount" INTEGER,
    "hoursWorked" DECIMAL(14,2),
    "sourceRowRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkforceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportRun" (
    "id" TEXT NOT NULL,
    "reportPeriodId" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "templateKey" TEXT NOT NULL,
    "outputPath" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_normalizedName_key" ON "Contractor"("normalizedName");

-- AddForeignKey
ALTER TABLE "ReportPeriod" ADD CONSTRAINT "ReportPeriod_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceFile" ADD CONSTRAINT "SourceFile_reportPeriodId_fkey" FOREIGN KEY ("reportPeriodId") REFERENCES "ReportPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationRecord" ADD CONSTRAINT "UtilizationRecord_reportPeriodId_fkey" FOREIGN KEY ("reportPeriodId") REFERENCES "ReportPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationRecord" ADD CONSTRAINT "UtilizationRecord_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkforceRecord" ADD CONSTRAINT "WorkforceRecord_reportPeriodId_fkey" FOREIGN KEY ("reportPeriodId") REFERENCES "ReportPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkforceRecord" ADD CONSTRAINT "WorkforceRecord_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRun" ADD CONSTRAINT "ReportRun_reportPeriodId_fkey" FOREIGN KEY ("reportPeriodId") REFERENCES "ReportPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
