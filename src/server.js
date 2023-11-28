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
            this.wsManager.on('stripe', (socket, data) => this.send(socket, data));
        }
    }

    async send(socket, data) {
        let params = data['data'];
        let environment;
        let action = data['action'];
        let stripe = false;

        try {
            let org = await api.getOrganization(data, this.name);
            if (params.environment) {
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
                case 'paymentIntents.create':
                    response = await stripe.paymentIntents.create(data.paymentIntents);
                    break;
                case 'checkout.sessions':
                    response = await stripe.checkout.sessions.retrieve(data.sessionId);

                    // Check if the session has a customer associated with it
                    // if (session.customer) {
                    //     return session.customer; // This is the Customer ID
                    // } else {
                    //     console.log('No customer associated with this session.');
                    //     return null;
                    // }
                    break;
            }
            this.wsManager.send({ socket, method: this.name, action, response })

        } catch (error) {
            this.handleError(socket, action, error)
        }
    }// end send

    async webhooks(req, res) {
        try {
            switch (req.method) {
                case 'POST':
                case 'PUT':
                    // Process the rawData for POST and PUT requests
                    // Example: JSON.parse(rawData) if the data is in JSON format
                    break;
                case 'GET':
                case 'DELETE':
                    // Typically, GET and DELETE don't have a body, handle accordingly
                    break;
                // Add other cases as needed
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Request processed successfully' }));

        } catch (error) {
            this.handleError(socket, action, error)
        }
    }// end sendStripe

    handleError(socket, action, error) {
        const response = {
            'object': 'error',
            'data': error || error.response || error.response.data || error.response.body || error.message || error,
        };
        this.wsManager.send({ socket, method: this.name, action, response })
    }
}

module.exports = CoCreateStripe;
