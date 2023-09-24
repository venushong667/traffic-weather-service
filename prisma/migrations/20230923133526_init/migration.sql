-- CreateTable
CREATE TABLE "Camera" (
    "id" INTEGER NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "area" TEXT NOT NULL,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Camera_latitude_key" ON "Camera"("latitude");

-- CreateIndex
CREATE UNIQUE INDEX "Camera_longitude_key" ON "Camera"("longitude");
