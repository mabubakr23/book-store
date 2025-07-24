import { PrismaClient, WalletTransaction } from "@prisma/client";
import { WalletBalanceResponse } from "../types";

const dbClient = new PrismaClient();

export const retrieveAccountBalance =
  async (): Promise<WalletBalanceResponse> => {
    const walletRecord = await dbClient.wallet.findUnique({
      where: { id: 1 },
    });

    if (!walletRecord) {
      throw new Error("Account Wallet not found");
    }

    return {
      balance: walletRecord.balance.toFixed(2),
    };
  };

export const fetchLedgerActivity = async (
  typeFilter?: string,
  reasonFilter?: string
): Promise<WalletTransaction[]> => {
  return dbClient.walletTransaction.findMany({
    where: {
      ...(typeFilter ? { type: typeFilter.toUpperCase() } : {}),
      ...(reasonFilter
        ? {
            reason: {
              contains: reasonFilter,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
