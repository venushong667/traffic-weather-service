-- CreateTable
CREATE TABLE "Camera" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "route" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Camera_latitude_key" ON "Camera"("latitude");

-- CreateIndex
CREATE UNIQUE INDEX "Camera_longitude_key" ON "Camera"("longitude");
