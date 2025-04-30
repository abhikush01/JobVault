const cron = require("../node_modules/node-cron");
const Referral = require("../models/Referral");

// Run every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running cron job to expire referral posts...");

  try {
    const now = new Date();
    const expiredReferrals = await Referral.updateMany(
      { deadline: { $lt: now }, status: "active" }, // deadline passed and still active
      { $set: { status: "expired" } }
    );
    console.log(`Expired referrals updated: ${expiredReferrals.modifiedCount}`);
  } catch (error) {
    console.error("Error in expiring referrals:", error.message);
  }
});
