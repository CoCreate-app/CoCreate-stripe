import api from '@cocreate/api'


const CoCreateStripe = {
	id: 'stripe',
	actions: [
	  'balanceTransaction',
	  'createSourceCustomer',
	  'createCustomer',
	  'getBalance',
	  'listCustomers',
	  'createTokenCard',
	  'createCustomer',
	  'updateCustomer',
	  'createCharge',
	  'create'
	],
	
	
	render_create: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
	},
	render_createCharge: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
	},
	render_updateCustomer: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
	},
	
	render_createCustomer: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
	},
	
	render_createTokenCard: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("createTokenCard ",data)
       CoCreate.api.render('createTokenCard', data);
	},
	render_balanceTransaction: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
	},
	render_createSourceCustomer: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
	},
	render_getBalance: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
        CoCreate.api.render('getBalance', data);
	},
	render_createCustomer: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
      CoCreate.api.render('createCustomer', data);
	},
	render_listCustomers: function(data) {
       if (data.object == "error") {
            alert(data.data)
        }
       data = {data: data};
       console.log("data ",data)
      CoCreate.api.render('listCustomers', data);
	},
}

api.init({
	name: CoCreateStripe.id, 
	module:	CoCreateStripe,
});

export default CoCreateStripe;