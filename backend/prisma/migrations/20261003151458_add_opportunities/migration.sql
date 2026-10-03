-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('INTERNSHIP', 'JOB', 'HACKATHON', 'SCHOLARSHIP', 'COMPETITION', 'WORKSHOP', 'FELLOWSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "OpportunityMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company" TEXT,
    "organization" TEXT,
    "type" "OpportunityType" NOT NULL,
    "mode" "OpportunityMode" NOT NULL DEFAULT 'REMOTE',
    "location" TEXT,
    "skills" TEXT,
    "salary" TEXT,
    "stipend" TEXT,
    "deadline" TIMESTAMP(3),
    "applicationUrl" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Opportunity_type_idx" ON "Opportunity"("type");

-- CreateIndex
CREATE INDEX "Opportunity_mode_idx" ON "Opportunity"("mode");

-- CreateIndex
CREATE INDEX "Opportunity_deadline_idx" ON "Opportunity"("deadline");

-- CreateIndex
CREATE INDEX "Opportunity_isActive_idx" ON "Opportunity"("isActive");

-- CreateIndex
CREATE INDEX "Opportunity_createdBy_idx" ON "Opportunity"("createdBy");

-- CreateIndex
CREATE INDEX "OpportunityBookmark_userId_idx" ON "OpportunityBookmark"("userId");

-- CreateIndex
CREATE INDEX "OpportunityBookmark_opportunityId_idx" ON "OpportunityBookmark"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityBookmark_userId_opportunityId_key" ON "OpportunityBookmark"("userId", "opportunityId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityBookmark" ADD CONSTRAINT "OpportunityBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityBookmark" ADD CONSTRAINT "OpportunityBookmark_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
