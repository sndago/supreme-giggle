/**
 * Notification Service
 *
 * Single entry point for all customer notifications.
 * Respects customer opt-in preferences (notifyBySMS, notifyByEmail).
 * Fires both channels concurrently — a failure in one never blocks the other.
 */

const email = require('./email.service');
const sms   = require('./sms.service');

const notify = {
  deposit: async (customer, amount, balance, reference) => {
    const tasks = [];
    if (customer.notifyByEmail && customer.email)
      tasks.push(email.sendDepositNotification(customer, amount, balance, reference));
    if (customer.notifyBySMS && customer.phone)
      tasks.push(sms.sendDepositSMS(customer, amount, balance, reference));
    await Promise.allSettled(tasks);
  },

  withdrawal: async (customer, amount, balance, reference) => {
    const tasks = [];
    if (customer.notifyByEmail && customer.email)
      tasks.push(email.sendWithdrawalNotification(customer, amount, balance, reference));
    if (customer.notifyBySMS && customer.phone)
      tasks.push(sms.sendWithdrawalSMS(customer, amount, balance, reference));
    await Promise.allSettled(tasks);
  },

  loanApproved: async (customer, loan) => {
    const tasks = [];
    if (customer.notifyByEmail && customer.email)
      tasks.push(email.sendLoanApprovalNotification(customer, loan));
    if (customer.notifyBySMS && customer.phone)
      tasks.push(sms.sendLoanApprovalSMS(customer, loan));
    await Promise.allSettled(tasks);
  },

  loanRejected: async (customer, loan) => {
    const tasks = [];
    if (customer.notifyByEmail && customer.email)
      tasks.push(email.sendLoanRejectionNotification(customer, loan));
    if (customer.notifyBySMS && customer.phone)
      tasks.push(sms.sendLoanRejectionSMS(customer, loan));
    await Promise.allSettled(tasks);
  },

  repayment: async (customer, repayment, outstandingBalance) => {
    const tasks = [];
    if (customer.notifyByEmail && customer.email)
      tasks.push(email.sendRepaymentNotification(customer, repayment, outstandingBalance));
    if (customer.notifyBySMS && customer.phone)
      tasks.push(sms.sendRepaymentSMS(customer, repayment, outstandingBalance));
    await Promise.allSettled(tasks);
  },
};

module.exports = notify;
