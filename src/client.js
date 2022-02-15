import api from "@cocreate/api";

const CoCreateStripe = {
    name: "stripe",
    actions: {
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
};

api.init({
    name: CoCreateStripe.name,
    module: CoCreateStripe,
});

export default CoCreateStripe;
