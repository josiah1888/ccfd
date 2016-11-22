const JsonDB = require('node-json-db');
const transactionsDB = new JsonDB("transactions", true, true);
'use strict';
 
module.exports = (cmd, ...params) => {

  const commands = {
    listTransactions: listTransactions,
    addTransaction: addTransaction,
  }

  return commands[cmd](...params);

  function listTransactions() {
    const transactions = getTransactions();
    if (transactions.length) {
      console.log(`Transactions: ${transactions.join(', ')}.`);
    } else {
      console.log('No transactions found')
    }
  }

  function addTransaction(customerEmail, transactionPrice) {
    console.log(`Adding Transaction of ${transactionPrice} for customer ${customerEmail}`);
    const customer = require('./customers')('getCustomer', customerEmail);
    if (!customer.email) {
      return;
    }

    if (customer.blocked) {
      console.log('Customer is blocked from all future transactions. Unblock the user to continue');
      return;
    }

    const approval = approveTransaction(customer, transactionPrice);

    if (!approval.result) {
      console.log('Blocking Transaction. ', approval.message);
      require('./customers')('updateBlockStatus', customerEmail, true);
      return;
    }

    transactionsDB.push('transactions', [new Transaction(transactionPrice, customer.email), ...getTransactions()])
    console.log('Transaction Approved')
  }
}

function getTransactions() {
  const raw = transactionsDB.getData('transactions');
  const formatted = Array.isArray(raw) ? raw : [];
  return formatted.map(i => new Transaction(i.price, i.customer));
}

function approveTransaction(customer, transactionPrice) {
  const pastTransactions = getTransactions().filter(i => i.customer === customer.email);
  if (pastTransactions.length < 3) {
    return {result: true, message: 'Less than 3 historical transactions'};
  }

  const sum = pastTransactions.map(i => i.price).reduce((sum, i) => sum += Number(i), 0);
  const average = sum / pastTransactions.length;

  return transactionPrice < average * 3 ? {result: true, message: 'Transaction is lower than 3 * Average'} : {result:false, message: 'Transaction is higher than 3 * Average'};
}

class Transaction {
  constructor(price, customer) {
    this.price = price;
    this.customer = customer
  }

  toString() {
    return JSON.stringify(this);
  }
}
