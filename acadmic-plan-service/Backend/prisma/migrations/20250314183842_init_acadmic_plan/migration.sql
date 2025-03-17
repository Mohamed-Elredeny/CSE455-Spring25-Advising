/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AcademicPlan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AcademicPlan` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CourseToSemester` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `semesterId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AcademicPlan" DROP CONSTRAINT "AcademicPlan_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Semester" DROP CONSTRAINT "Semester_academicPlanId_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToSemester" DROP CONSTRAINT "_CourseToSemester_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToSemester" DROP CONSTRAINT "_CourseToSemester_B_fkey";

-- AlterTable
ALTER TABLE "AcademicPlan" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "semesterId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_CourseToSemester";

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_academicPlanId_fkey" FOREIGN KEY ("academicPlanId") REFERENCES "AcademicPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
