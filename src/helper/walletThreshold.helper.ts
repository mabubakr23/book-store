import { PrismaClient } from "@prisma/client";
import { sendMail as dispatchSignal } from "../common/nodemailer";

const dbClient = new PrismaClient();

export const monitorVaultThreshold = async (): Promise<void> => {
  try {
    const vaultState = await dbClient.wallet.findUnique({ where: { id: 1 } });

    if (
      vaultState &&
      vaultState.balance >= 2000 &&
      !vaultState.isMilestoneSent
    ) {
      console.log(`[ALERT] Threshold breach confirmed: $2000+`);

      await dispatchSignal(
        "management@dummy-library.com",
        "💰 Vault Milestone Crossed",
        "📢 The system wallet has exceeded the $2000 threshold."
      );

      await dbClient.wallet.update({
        where: { id: 1 },
        data: {
          isMilestoneSent: true,
        },
      });
    }
  } catch (exception) {
    console.error(`[FAILURE] Vault milestone evaluation failed:`, exception);
  }
};
