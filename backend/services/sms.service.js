/**
 * SMS Service — Twilio
 *
 * Install Twilio when ready:  npm install twilio
 * Then uncomment the Twilio client block below.
 *
 * For development, messages are logged to the console instead.
 */

let twilioClient = null;

const initTwilio = () => {
  if (twilioClient) return twilioClient;
  try {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch {
    // twilio not installed — fall through to console logging
  }
  return twilioClient;
};

/**
 * Core send function
 */
const sendSMS = async (to, message) => {
  if (!to) return;

  // Normalise phone: ensure it starts with +
  const phone = to.startsWith('+') ? to : `+${to}`;

  const client = initTwilio();

  if (client) {
    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to:   phone,
      });
    } catch (err) {
      console.error(`[SMS] Failed to send to ${phone}:`, err.message);
    }
  } else {
    // Development fallback — log instead of send
    console.log(`[SMS DEV] To: ${phone} | Message: ${message}`);
  }
};

// ── Notification templates ─────────────────────────────────────────────────

const sendDepositSMS = (customer, amount, balance, reference) =>
  sendSMS(
    customer.phone,
    `COMPOUND: Deposit of ${amount} confirmed. Ref: ${reference}. New balance: ${balance}. Thank you.`
  );

const sendWithdrawalSMS = (customer, amount, balance, reference) =>
  sendSMS(
    customer.phone,
    `COMPOUND: Withdrawal of ${amount} processed. Ref: ${reference}. New balance: ${balance}. Contact us if unauthorised.`
  );

const sendLoanApprovalSMS = (customer, loan) =>
  sendSMS(
    customer.phone,
    `COMPOUND: Your loan ${loan.loanNumber} of ${loan.amount} has been APPROVED. Monthly payment: ${loan.monthlyPayment}. Visit your branch for disbursement.`
  );

const sendLoanRejectionSMS = (customer, loan) =>
  sendSMS(
    customer.phone,
    `COMPOUND: Your loan application ${loan.loanNumber} was not approved. Please visit your branch for details.`
  );

const sendRepaymentSMS = (customer, repayment, outstandingBalance) =>
  sendSMS(
    customer.phone,
    `COMPOUND: Repayment of ${repayment.amount} received. Ref: ${repayment.reference}. Outstanding balance: ${outstandingBalance}.`
  );

module.exports = {
  sendDepositSMS,
  sendWithdrawalSMS,
  sendLoanApprovalSMS,
  sendLoanRejectionSMS,
  sendRepaymentSMS,
};
