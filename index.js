#!/usr/bin/env node
'use strict';

const path = require('path');
const pkg = require( path.join(__dirname, 'package.json') );
const program = require('commander');
const customers = []

program
	.version(pkg.version)
	.option('--hello', 'Basic Hello World')
  .option('-c --add-customers <customers>', 'Add new customers with emails', list)
  .option('-l --list <customer_email | `customers` | `transactions`>', 'List customer by email')
  .option('-t --add-transaction <customer_email>:<price>')
  .option('-b --update-block-status <customer_email>:<block_result>')
	.parse(process.argv);

if (program.hello) {
  return require('./hello')();
} else if (program.list) {
  switch (program.list.toLowerCase()) {
    case 'customers':
      return require('./customers')('listCustomers');
      break;
    case 'transactions':
      return require('./transactions')('listTransactions');
      break;
    default:
      return require('./customers')('getCustomer', program.list);
  }
  return require('./customers')('listCustomers');
} else if (program.addCustomers) {
  return require('./customers')('addCustomers', program.addCustomers);
} else if (program.addTransaction) {
  return require('./transactions')('addTransaction', ...program.addTransaction.split(':'))
} else if (program.updateBlockStatus) {
  const params = program.updateBlockStatus.split(':');
  return require('./customers')('updateBlockStatus', params[0], params[1] === 'true')
}

function list(val) {
  return val.split(',');
}
