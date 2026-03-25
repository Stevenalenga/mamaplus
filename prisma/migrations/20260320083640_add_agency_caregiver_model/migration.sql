-- CreateTable
CREATE TABLE "agency_caregivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "rating" INTEGER,
    "reviewComment" TEXT,
    "recruiterNotes" TEXT,
    "recruitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agency_caregivers_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "agency_caregivers_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "agency_caregivers_agencyId_idx" ON "agency_caregivers"("agencyId");

-- CreateIndex
CREATE INDEX "agency_caregivers_caregiverId_idx" ON "agency_caregivers"("caregiverId");

-- CreateIndex
CREATE UNIQUE INDEX "agency_caregivers_agencyId_caregiverId_key" ON "agency_caregivers"("agencyId", "caregiverId");
