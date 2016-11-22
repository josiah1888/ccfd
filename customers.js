'use strict';
const JsonDB = require('node-json-db');
const customersDB = new JsonDB("customers", true, true);
 
module.exports = (cmd, ...params) => {

  const commands = {
    listCustomers: listCustomers,
    addCustomers: addCustomers,
    getCustomer: getCustomer,
    updateBlockStatus: updateBlockStatus,
  }

  return commands[cmd](...params);

  function listCustomers() {
    const customers = getCustomers();
    if (customers.length) {
      console.log(`Customers: ${customers.join(', ')}.`);
    } else {
      console.log('No customers found')
    }
  }

  function addCustomers(emails) {
    console.log('Add all customers by email addresses', emails.join(' '));
    const customerEmails = new Set([...emails, ...getCustomers().map(i => i.email)]);    
    customersDB.push('customers', [...customerEmails].map(i => new Customer({email: i})))
    listCustomers();
  }

  function getCustomer(email) {
    const customer = new Customer(getCustomers().find(i => i.email === email));

    console.log(customer.email ? `customer: ${customer}` : `No customer found with email ${email}`);
    return customer;
  }

  function updateBlockStatus(email, blockStatus) {
    console.log(`Updating blocked status of ${blockStatus} for ${email}`);
    const customer = getCustomer(email);
    if (!customer.email) {
      return;
    }
    
    updateCustomer(Object.assign(customer, {blocked: blockStatus}));
  }
}

function getCustomers() {
  const raw = customersDB.getData('customers');
  const formatted = Array.isArray(raw) ? raw : [];
  return formatted.map(i => new Customer(i));
}

function updateCustomer(customer) {
  let otherCustomers = getCustomers().filter(i => i.email !== customer.email);
  customersDB.push('customers', [customer, ...otherCustomers]);
}

class Customer {
  constructor({email, blocked}) {
    this.email = email;
    this.blocked = blocked || false;
  }

  toString() {
    return JSON.stringify(this);
  }
}
