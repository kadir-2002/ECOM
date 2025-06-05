-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetOTP" TEXT,
ADD COLUMN     "resetOTPExpiry" TIMESTAMP(3);
