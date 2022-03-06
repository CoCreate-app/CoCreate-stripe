'use strict'
const api = require("@cocreate/api");

class CoCreateStripe {
  constructor(wsManager, config) {
    this.name = 'stripe';
    this.wsManager = wsManager;
    this.init();
  }

  init() {
    if (this.wsManager) {
      this.wsManager.on('stripe', (socket, data, socketInfo) => this.sendStripe(socket, data, socketInfo));
    }
  }

  async sendStripe(socket, data, socketInfo) {
    let params = data['data'];
    let environment;
    let action = data['action'];
    let stripe = false;

    try {
      let org = await api.getOrg(data, this.name);
      if (params.environment){
        environment = params['environment'];
        delete params['environment'];  
      } else {
        environment = org.apis[this.name].environment;
      }
      
      let key = org.apis[this.name][environment];
      stripe = require('stripe')(key);
    } catch (e) {
      console.log(this.name + " : Error Connect to api", e)
    }

    try {
      let response, customer = params.customer;
      switch (action) {
        case 'customers.list':
          response = await stripe.customers.list();
          break;
        case 'customers.create':
          response = await stripe.customers.create(params);
          break;
        case 'customers.update':
          delete params['customer'];
          response = await stripe.customers.update(customer, params);
          break;
        case 'tokens.create':
          response = await stripe.tokens.create(params);
          break;
        case 'charges.create':
          response = await stripe.charges.create(params);
          break;
        case 'balance.retrieve':
          response = await stripe.balance.retrieve();
          break;
        case 'balanceTransactions.retrieve':
          response = await stripe.balanceTransactions.retrieve(
            params.balance_transaction
          );
          break;
        case 'balanceTransactions.list':
          response = await stripe.balanceTransactions.list();
          break;
        case 'createSourceCustomer':
          delete params['customer'];
          response = await stripe.customers.createSource(customer, params);
          break;
      }
      this.wsManager.send(socket, this.name, { action, response })
    
    } catch (error) {
      this.handleError(socket, action, error)
    }
  }// end sendStripe

  handleError(socket, action, error) {
    const response = {
      'object': 'error',
      'data': error || error.response || error.response.data || error.response.body || error.message || error,
    };
    this.wsManager.send(socket, this.name, { action, response })
  }
}

module.exports = CoCreateStripe;
