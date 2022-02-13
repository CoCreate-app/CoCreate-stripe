'use strict'
const  api = require("@cocreate/api");

class CoCreateStripe {
	constructor(wsManager, config) {
		this.moduleName = 'stripe';
		this.enviroment = 'test'; //'test'
		this.wsManager = wsManager;
		this.init();
	}
	
	init() {
		if (this.wsManager) {
		  this.wsManager.on('stripe',	(socket, data, roomInfo) => this.sendStripe(socket, data, roomInfo));
		}
	}

  async sendStripe(socket, data, roomInfo) {
    let that = this;
    let send_response ='stripe';
    let data_original = {...data};
    const params = data['data'];
    let type = data['type'];
    delete data['type'];
    let url = '';
    let method = '';
    let targets = [];
    let tags = [];
    let stripe = false;
    try{
      let enviroment = typeof params['enviroment'] != 'undefined' ? params['enviroment'] : this.enviroment;
      let org = await api.getOrg(params, this.moduleName);
      let key = org['apis.'+this.moduleName+'.'+enviroment];
      console.log("stripe ", type, key)
      stripe = require('stripe')(key);
    }catch(e){
      console.log(this.moduleName+" : Error Connect to api",e)
      return false;
    }

    switch (type) {
      case 'listCustomers':
          const customers = await stripe.customers.list();
          api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": customers }, this.moduleName)
      break;
      case 'createCharge':
          this.createCharge(socket, type, data["data"], stripe);
      break;
      case 'createCustomer':
          this.createCustomer(socket, type, data["data"], stripe);
      break;
      case 'updateCustomer':
          this.updateCustomer(socket, type, data["data"], stripe);
      break;
      case 'createTokenCard':
          this.createTokenCard(socket, type, data["data"], stripe);
      break;
      case 'getBalance':
          console.log("Response getBalance Before")
          stripe.balance.retrieve((err, balance) => {
              if (!err && balance) {
                api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": balance }, this.moduleName)
              } else if (err) {
                  api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": 0 }, this.moduleName)
              }
            });
          break;
      case 'balanceTransaction':
          const balanceTransaction = await stripe.balanceTransactions.retrieve(
            'txn_1032HU2eZvKYlo2CEPtcnUvl'
          );
          api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": balanceTransaction }, this.moduleName)
      break;
      case 'createCustomer':
          const customer = await stripe.customers.create(data["data"]);
          //console.log(" REspuesta ",customer)
          api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": customer }, this.moduleName)
      break;
      case 'createSourceCustomer':
          let id_customer = data['customer_id'];
          delete data['customer_id'];
          const card = await stripe.customers.createSource(
            id_customer,
            data["data"]
          );
          api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": card }, this.moduleName)
      break;
    } 
	}// end sendStripe
	
	async createCharge(socket, type, params, stripelib) {
	    try {
	        const result = await stripelib.charges.create(params);
	        api.send_response(this.wsManager, socket, { "type": type, "response": result }, this.moduleName);
        } catch (error) {
          this.handleError(socket, type, error)
        }
	}
	
	async updateCustomer(socket, type, params, stripelib) {
	    try {
	        let customer_id = params['customer_id']
	        delete params['customer_id'];
	        const result = await stripelib.customers.update(
              customer_id,
              {...params}
            );
            api.send_response(this.wsManager, socket, { "type": type, "response": result }, this.moduleName);
        } catch (error) {
          this.handleError(socket, type, error)
        }
	}
	async createCustomer(socket, type, params, stripelib) {
        try {
            const result = await stripelib.customers.create(params);
            api.send_response(this.wsManager, socket, { "type": type, "response": result }, this.moduleName);
        } catch (error) {
          this.handleError(socket, type, error)
        }	    
	}
	
	async createTokenCard(socket, type, params, stripelib) {
        try {
            const token = await stripelib.tokens.create({
              card: params,
            });
            api.send_response(this.wsManager, socket, { "type": type, "response": token }, this.moduleName)
    
        } catch (error) {
          this.handleError(socket, type, error)
        }
    }
      
    handleError(socket, type, error) {
        const response = {
          'object': 'error',
          'data':error || error.response || error.response.data || error.response.body || error.message || error,
        };
        api.send_response(this.wsManager, socket, { type, response }, this.moduleName);
    }
}

module.exports = CoCreateStripe;
