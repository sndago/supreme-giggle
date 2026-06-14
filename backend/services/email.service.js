const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Core send function
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!to) return;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
};

// ── Notification templates ─────────────────────────────────────────────────

const sendDepositNotification = (customer, amount, balance, reference) =>
  sendEmail({
    to:      customer.email,
    subject: 'Deposit Confirmed — COMPOUND',
    html: `
      <h2>Deposit Confirmed</h2>
      <p>Dear ${customer.firstName},</p>
      <p>A deposit of <strong>${amount}</strong> has been made to your account.</p>
      <table>
        <tr><td>Reference:</td><td><strong>${reference}</strong></td></tr>
        <tr><td>Amount:</td><td><strong>${amount}</strong></td></tr>
        <tr><td>New Balance:</td><td><strong>${balance}</strong></td></tr>
      </table>
      <p>Thank you for banking with COMPOUND.</p>
    `,
  });

const sendWithdrawalNotification = (customer, amount, balance, reference) =>
  sendEmail({
    to:      customer.email,
    subject: 'Withdrawal Processed — COMPOUND',
    html: `
      <h2>Withdrawal Processed</h2>
      <p>Dear ${customer.firstName},</p>
      <p>A withdrawal of <strong>${amount}</strong> has been processed from your account.</p>
      <table>
        <tr><td>Reference:</td><td><strong>${reference}</strong></td></tr>
        <tr><td>Amount:</td><td><strong>${amount}</strong></td></tr>
        <tr><td>New Balance:</td><td><strong>${balance}</strong></td></tr>
      </table>
      <p>If you did not initiate this, contact us immediately.</p>
    `,
  });

const sendLoanApprovalNotification = (customer, loan) =>
  sendEmail({
    to:      customer.email,
    subject: 'Loan Approved — COMPOUND',
    html: `
      <h2>Your Loan Has Been Approved</h2>
      <p>Dear ${customer.firstName},</p>
      <p>We are pleased to inform you that your loan application has been approved.</p>
      <table>
        <tr><td>Loan Number:</td><td><strong>${loan.loanNumber}</strong></td></tr>
        <tr><td>Amount:</td><td><strong>${loan.amount}</strong></td></tr>
        <tr><td>Monthly Payment:</td><td><strong>${loan.monthlyPayment}</strong></td></tr>
        <tr><td>Duration:</td><td><strong>${loan.durationMonths} months</strong></td></tr>
        <tr><td>Total Repayable:</td><td><strong>${loan.totalRepayable}</strong></td></tr>
      </table>
      <p>Thank you for choosing COMPOUND.</p>
    `,
  });

const sendLoanRejectionNotification = (customer, loan) =>
  sendEmail({
    to:      customer.email,
    subject: 'Loan Application Update — COMPOUND',
    html: `
      <h2>Loan Application Update</h2>
      <p>Dear ${customer.firstName},</p>
      <p>We regret to inform you that your loan application <strong>${loan.loanNumber}</strong> was not approved at this time.</p>
      ${loan.rejectionReason ? `<p>Reason: ${loan.rejectionReason}</p>` : ''}
      <p>Please visit your nearest branch for more information.</p>
    `,
  });

const sendRepaymentNotification = (customer, repayment, outstandingBalance) =>
  sendEmail({
    to:      customer.email,
    subject: 'Loan Repayment Received — COMPOUND',
    html: `
      <h2>Repayment Received</h2>
      <p>Dear ${customer.firstName},</p>
      <p>Your loan repayment has been received successfully.</p>
      <table>
        <tr><td>Reference:</td><td><strong>${repayment.reference}</strong></td></tr>
        <tr><td>Amount Paid:</td><td><strong>${repayment.amount}</strong></td></tr>
        <tr><td>Outstanding Balance:</td><td><strong>${outstandingBalance}</strong></td></tr>
      </table>
    `,
  });

module.exports = {
  sendDepositNotification,
  sendWithdrawalNotification,
  sendLoanApprovalNotification,
  sendLoanRejectionNotification,
  sendRepaymentNotification,
};
