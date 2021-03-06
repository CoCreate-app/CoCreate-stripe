/* global Y */
'use strict'
// var utils= require('@cocreate/api/src/server/');
const  api = require("@cocreate/api");
// const { getOrg } = require("@cocreate/api/src/server/crud.js");

class CoCreateStripe {
	constructor(wsManager, config) {
		this.module_id = 'stripe';
		this.enviroment = 'test'; //'test'
		this.wsManager = wsManager;
		this.init();

	}
	
	init() {
		if (this.wsManager) {
		//	this.wsManager.on('stripe',		(socket, data) => this.sendStripe(socket, data));
		this.wsManager.on('stripe',		(socket, data, roomInfo) => this.sendStripe(socket, data, roomInfo));
		}
	}
	async sendStripe(socket, data,roomInfo) {
	    console.log("Data Stripe ",data)
	    let that = this;
	    let send_response ='stripe';
	    let data_original = {...data};
	    const params = data['data'];
	    //console.log("Stripe ",data_original);
        let type = data['type'];
        console.log("Type ",type)
        delete data['type'];
        let url = '';
        let method = '';
        let targets = [];
        let tags = [];
    	 let stripe = false;
      	 try{
      	       console.log("after")
      	       let enviroment = typeof params['enviroment'] != 'undefined' ? params['enviroment'] : this.enviroment;
               let org_row = await api.getOrg(params,this.module_id);
               let key = org_row['apis.'+this.module_id+'.'+enviroment];
               console.log("key stripe "+key)
               stripe = require('stripe')(key);
      	 }catch(e){
      	   	console.log(this.module_id+" : Error Connect to api",e)
      	   	return false;
      	 }
        /*Address*/
        console.log("Swift -=> ",type =='listCustomers' )
        switch (type) {
            
            case 'listCustomers':
                console.log("CAse listCustomers ")
                const customers = await stripe.customers.list({limit: 3,});
                console.log("customer ",customers)
                api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": customers }, this.module_id)
            break;
            case 'createCharge':
                this.createCharge(socket,type,data["data"],stripe);
            break;
            case 'createCustomer':
                this.createCustomer(socket,type,data["data"],stripe);
            break;
            case 'updateCustomer':
                this.updateCustomer(socket,type,data["data"],stripe);
            break;
            case 'createTokenCard':
                this.createTokenCard(socket,type,data["data"],stripe);
            break;
            case 'getBalance':
                // stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');                   //// use platform key
                console.log("Response getBalance Before")
                stripe.balance.retrieve((err, balance) => {
                    if (!err && balance) {
                      api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": balance }, this.module_id)
                    } else if (err) {
                        api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": 0 }, this.module_id)
                    }
                  });
                break;
            case 'balanceTransaction':
                const balanceTransaction = await stripe.balanceTransactions.retrieve(
                  'txn_1032HU2eZvKYlo2CEPtcnUvl'
                );
                api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": balanceTransaction }, this.module_id)
            break;
            case 'createCustomer':
                const customer = await stripe.customers.create(data["data"]);
                //console.log(" REspuesta ",customer)
                api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": customer }, this.module_id)
            break;
            case 'createSourceCustomer':
                let id_customer = data['customer_id'];
                delete data['customer_id'];
                const card = await stripe.customers.createSource(
                  id_customer,
                  data["data"]
                );
                api.send_response(this.wsManager, socket, { "type": data_original["type"], "response": card }, this.module_id)
            break;
        }
        
          
        
        
        //api.req(this.url_wilddock+url,method,data,this.wsManager,socket,'Stripe',data_original);
        
        //api.send_response=(wsManager,socket,obj,send_response)
	    
	}// end sendStripe
	
	async createCharge(socket, type, params, stripelib) {
	    try {
	        const result = await stripelib.charges.create(params);
	        api.send_response(this.wsManager, socket, { "type": type, "response": result }, this.module_id);
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
            api.send_response(this.wsManager, socket, { "type": type, "response": result }, this.module_id);
        } catch (error) {
          this.handleError(socket, type, error)
        }
	}
	async createCustomer(socket, type, params, stripelib) {
        try {
            const result = await stripelib.customers.create(params);
            api.send_response(this.wsManager, socket, { "type": type, "response": result }, this.module_id);
        } catch (error) {
          this.handleError(socket, type, error)
        }	    
	}
	
	async createTokenCard(socket, type, params, stripelib) {
        try {
            const token = await stripelib.tokens.create({
              card: params,
            });
            api.send_response(this.wsManager, socket, { "type": type, "response": token }, this.module_id)
    
        } catch (error) {
          this.handleError(socket, type, error)
        }
    }
      
    handleError(socket, type, error) {
        const response = {
          'object': 'error',
          'data':error || error.response || error.response.data || error.response.body || error.message || error,
        };
        api.send_response(this.wsManager, socket, { type, response }, this.module_id);
    }
	
}//end Class 
module.exports = CoCreateStripe;
