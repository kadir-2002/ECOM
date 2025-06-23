-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'ALERT', 'SYSTEM');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'ORDER';
