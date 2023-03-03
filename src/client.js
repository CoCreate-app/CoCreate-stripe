import api from "@cocreate/api";

api.init({
    name: "stripe",
    endPoints: {
        'balance.retrieve': {},
        'balanceTransactions.retrieve': {},
        'balanceTransactions.list': {},
        createSourceCustomer: {},
        'customers.create': {},
        'customers.list': {},
        'customers.update':{},
        'charges.create':{},
        'tokens.create':{},
        create:{}
    }
});
