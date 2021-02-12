var CocreateStripeAPi = function() {
    this.classBtns = ['.getBalanceBtn',
                      '.balanceTransactionBtn',
                      '.createCustomerBtn',
                      '.createCardBtn',
                      '.listCustomersBtn',
                          ];
    this.data_param = 'data-stripe';
    this.req_socket = 'stripe';
    
    this.setResult = function(data) {
        if(typeof(data["type"]) != 'undefined'){
            let type = data["type"];
            switch(type){
                case '.createCustomerBtn':
                    var localstorage = window.sessionStorage;
                    localstorage['customer_id'] = data['response']["id"];
                    if(data['response']){
                        document.dispatchEvent(new CustomEvent('eventRegisterCustomer'));
                    }
                break;
                case '.createCardBtn':
                    document.dispatchEvent(new CustomEvent('eventRegisterCard'));
                break;
                case '.listCustomersBtn':
                    CoCreate.render.data('[data-template_id=abc1]',{
                         render2: {
                            data: data.response.data
                        }
                    });//end Render
                break;
            }
        }
    }
    
    CocreateAPiSocket.call(this);
};

CocreateStripeAPi.prototype = Object.create(CocreateAPiSocket.prototype);
CocreateStripeAPi.prototype.constructor = CocreateStripeAPi;

var cocreateStripeRegisterAPi = new CocreateStripeAPi();