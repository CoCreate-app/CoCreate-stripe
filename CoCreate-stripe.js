// function connectStripeAccount(accInfo) {
  
//   // here will check connect mode first
  
//   let stripe_mode = accInfo['livemode'] ? 'live': 'test';  // like this
  
//   /// and then get keys
//   let sk, pk, accId;
  
//   sk = accInfo['access_token'];
//   pk = accInfo['stripe_publishable_key'];
//   accId = accInfo['stripe_user_id'];
  
//   let json;
  
//   if (stripe_mode == 'live') {
    
//     json = {
//       "apiKey": config.apiKey,
//       "securityKey": config.securityKey,
//       "organization_id": config.organization_Id,
//       "data-collection": 'organizations',
//       "id": config.organization_Id,
//       data: {
//         stripe_live_sk: sk,
//         stripe_live_pk: pk,
//         stripe_live_acc_id: accId
//       }
//     }
    
//   } else {
//     json = {
//       "apiKey": config.apiKey,
//       "securityKey": config.securityKey,
//       "organization_id": config.organization_Id,
//       "data-collection": 'organizations',
//       "id": config.organization_Id,
//       data: {
//         tripe_test_sk: sk,
//         stripe_test_pk: pk,
//         stripe_test_acc_id: accId
//       }
//     }
//   }
  
//   console.log(json);
  
  
//   socket.emit('updateDocument', json);
    
// }

let customerBtns = document.querySelectorAll('.stripeCustomerBtn');
let cardTokenBtns = document.querySelectorAll('.stripeCardTokenBtn');
let cardBtns = document.querySelectorAll('.stripeCardBtn');
let chargeBtns = document.querySelectorAll('.stripeChargeBtn');
let transferBtns = document.querySelectorAll('.stripeTransferBtn');

let stripeBtns = document.querySelectorAll('.stripeBtn');


for (let customerBtn of customerBtns) {
  if (customerBtn.form) initStripeCustomerBtn(customerBtn.form, customerBtn);
}

for (let cardTokenBtn of cardTokenBtns) {
  if (cardTokenBtn.form) initStripeCardTokenBtn(cardTokenBtn.form, cardTokenBtn);
}

for (let cardBtn of cardBtns) {
  if (cardBtn.form) initStripeCardBtn(cardBtn.form, cardBtn);
}

for (let chargeBtn of chargeBtns) {
  if (chargeBtn.form) initStripeChargeBtn(chargeBtn.form, chargeBtn);
}


for (let stripeBtn of stripeBtns) {
  if (stripeBtn.form) initStripeBtn(stripeBtn.form, stripeBtn);
}

for (let transferBtn of transferBtns) {
  if (transferBtn.form) initStripeTransferBtn(transferBtn.form, transferBtn);
}


/// ****** define stripe btns functions ********* ////

//// define stripeCustomerBtn, this btn will use createStripeCustomer function (core function)
function initStripeCustomerBtn(form, btn) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    let customerIdInput = form.querySelector("[data-stripe_customer='customerId']");
    
    if (customerIdInput && customerIdInput.value) {        //// update
      updateStripeCustomer(customerIdInput.value, form, (res, err) => {
        console.log(res);
        console.log(err);
      })
    
    } else {
      createStripeCustomer(form, (res, err) => {
        if (res) {
          console.log(res);
          
          let customerInput = form.querySelector("[data-stripe_customer='customerId']");
          if (customerInput) {
            customerInput.value = res.id;
            customerInput.dispatchEvent(new Event('input', {'bubbles': true}));
          }
          
          
        } else {
          console.log(err)
        }
      })  
    }
  
    
  })
}

//// define stripeCardTokenBtn, this btn will use createStripeCardToken function (core function)
function initStripeCardTokenBtn(form, btn) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    createStripeCardToken(form, (res, err) => {
      console.log(res);
      
      if (res) {
        let cardTokenInput = form.querySelector("[data-stripe_cardtoken='tokenId']");
        
        if (cardTokenInput) {
          cardTokenInput.value =  res.id;
          cardTokenInput.dispatchEvent(new Event('input', {'bubbles': true})) ;
        }
      }
      
      console.log(err);
    })
  })
}

/// define stripeCardBtn, this btn will use createStripeCard function (core function)
function initStripeCardBtn(form, btn) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    let customerIdInput = form.querySelector("[data-stripe_customer='customerId']");
    
    if (customerIdInput && customerIdInput.value) {       
    
      let customerId = customerIdInput.value;
      
      let cardIdInput = form.querySelector("[data-stripe_card='cardId']");
      if (cardIdInput && cardIdInput.value) {        //// update card
      
        updateStripeCard(customerId, cardIdInput.value, form, (res, err) => {
          console.log(res);
          console.log(err);
        })
      } else {         /// create card
        
         createStripeCard(form, (res, err) => {
          if (res) {
            let cardIdInput = form.querySelector("[data-stripe_card='cardId']");
            
            if (cardIdInput) {
              cardIdInput.value =  res.id;
              cardIdInput.dispatchEvent(new Event('input', {'bubbles': true})) ;
            }
          } else {
            console.log(err)
          }
        })  
      
      }
    
    }
      
  })
}

/// define stripeChargeBtn, this btn will use createStripeCharge function(core function), and will use customerId and cardid
function initStripeChargeBtn(form, btn) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    let chargeIdInput = form.querySelector("[data-stripe_charge='chargeId']");
        
    if (chargeIdInput && chargeIdInput.value) {
      
      updateStripeCharge(chargeIdInput.value, form, (res, err) => {
        
      })
      
    } else {           ///   create stripe charge
      
      createStripeCharge(form, (res, err) => {
        console.log(res);
        
        if (res) {
          let chargeIdInput = form.querySelector("[data-stripe_charge='chargeId']");
          
          if (chargeIdInput) {
            chargeIdInput.value = res.id;
            chargeIdInput.dispatchEvent(new Event('input', {'bubbles': true}));
          }
        }
        
        console.log(err);
      })  
    }
    
    
  })
}

function initStripeTransferBtn(form, btn) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    createStripeTransfer(form, (res, err) => {
      console.log(res);
    })
  })
}




//********** core functions from here, core functions require form param   ************* ////

//// createCustomer function will pass params to server function and return created customer info
function createStripeCustomer(form, callback) {
  let customerParam = {};
  
  let inputs = form.querySelectorAll("[data-stripe_customer]");
  
  inputs.forEach(input => {
    let param = input.getAttribute('data-stripe_customer');
    let value = input.value;
    if (input.type == 'checkbox') value = input.checked;
    
    if (param && param!== 'customerId') {
      customerParam[param] = value;
    }
  })
  
  axios.post('/stripe/createCustomer', {
    param: customerParam
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
}

function updateStripeCustomer(customer, form, callback) {
  let customerParam = {};
  
  let inputs = form.querySelectorAll("[data-stripe_customer]");
  
  inputs.forEach(input => {
    let param = input.getAttribute('data-stripe_customer');
    let value = input.value;
    if (input.type == 'checkbox') value = input.checked;
    
    if (param && param!== 'customerId') {
      customerParam[param] = value;
    }
  })
  
  axios.post('/stripe/updateCustomer', {
    param: {
      customer: customer,
      customerParam: customerParam
    }
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
}

//// createStripeCardToken function will pass card detail param to server function and return created token info
function createStripeCardToken(form, callback) {
  
  let cardTokenParam = {};
  
  let inputs = form.querySelectorAll('[data-stripe_cardtoken]');
  
  inputs.forEach(input => {
    let param = input.getAttribute('data-stripe_cardtoken');
    let value = input.value;
    if (input.type == 'checkbox') value = input.checked;
    
    
    if (param && param!= 'tokenId') {
      cardTokenParam[param] = value;
    }
  })
  
  console.log(cardTokenParam);
  
  axios.post('/stripe/createToken', {
    param: {
      card: cardTokenParam
    }
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
}

function createStripeCard(form, callback) {
  let customerInput = form.querySelector("[data-stripe_customer='customerId']");
  let cardTokenInput = form.querySelector("[data-stripe_cardtoken='tokenId']");
  
  if (!customerInput || !customerInput.value) {
    alert('require customerId');
    callback(null, 'require customerid');
    return;
  }
  
  if (!cardTokenInput || !cardTokenInput.value) {
    alert('require cardTokenId');
    callback(null, 'require cardTokenId');
    return;
  }
  
  let customerId = customerInput.value;
  let cardTokenId = cardTokenInput.value;
  
  console.log(customerId, cardTokenId);

  axios.post('/stripe/createCard', {
    param: {
      customerId: customerId,
      tokenId: cardTokenId
    }
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
}

function updateStripeCard(customer, card, form, callback) {
  let cardParam = {};
  
  let inputs = form.querySelectorAll('[data-stripe_card]');
  
  inputs.forEach(input => {
    let param = input.getAttribute('data-stripe_card');
    let value = input.value;
    if (input.type == 'checkbox') value = input.checked;
    
    
    if (param && param!= 'cardId') {
      cardParam[param] = value;
    }
  })
  
  axios.post('/stripe/updateCard', {
    param: {
      customerId: customer,
      cardId: card,
      cardParam: cardParam
    }
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
}

/// this function will pass customerId, cardId and charge detail to server function, and get created charge info
function createStripeCharge(form, callback) {
  
  let chargeParam = {}, param = {}, stripe_account, destination;
  
  let inputs = form.querySelectorAll("[data-stripe_charge]");
  inputs.forEach(input => {
    let param = input.getAttribute('data-stripe_charge');
    
    let value = input.value;
    if (input.type == 'checkbox') value = input.checked;
    
    if (param && param!= 'chargeId' && param != 'stripe_account' && param != 'destination') {
      chargeParam[param] = value;
    } else if (param == 'stripe_account') {
      stripe_account = value;
    } else if (param == 'destination') {
      destination = value;
    }
  })
  
  let customerInput = form.querySelector("[data-stripe_customer='customerId']");
  let cardIdInput = form.querySelector("[data-stripe_card='cardId']");
  let tokenIdInput = form.querySelector("[data-stripe_cardtoken='tokenId']")
  
  if (cardIdInput && cardIdInput.value) {
    
    if (!customerInput || !customerInput.value) {
      alert('require customerId');
      callback(null, 'require customerid');
      return
    }    

    param = {
      charge: {
        customer: customerInput.value,
        source: cardIdInput.value,
        ...chargeParam,
      },
      stripe_account: stripe_account,
      destination: destination
    }
    
    console.log(param);
    
  } else if (tokenIdInput && tokenIdInput.value)  {
    param = {
      charge: {
        source: tokenIdInput.value,
      ...chargeParam,  
      },
      stripe_account: stripe_account,
      destination: destination
    }
    
    console.log(param);
    
  } else {
    return;
  }
  
  
  
  axios.post('/stripe/createCharge', {
    param: param
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
}

function updateStripeCharge(charge, form, callback) {
  let chargeParam = {};
  
  let inputs = form.querySelectorAll("[data-stripe_charge]");
  inputs.forEach(input => {
    let param = input.getAttribute('data-stripe_charge');
    
    let value = input.value;
    if (input.type == 'checkbox') value = input.checked;
    
    if (param && param!= 'chargeId') {
      chargeParam[param] = value;
    }
  })
  
  axios.post('/stripe/updateCharge', {
    param: {
      chargeId: charge,
      chargeParam: chargeParam
    }
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
}

function createStripeTransfer(form, callback) {
  let transferParam = {};
  
  let inputs = form.querySelectorAll('[data-stripe_transfer');
  
  inputs.forEach(input => {
    let param = input.getAttribute('data-stripe_transfer');
    let value = input.value;
    if (input.type == 'checkbox') value = input.checked;
    
    
    if (param && param!= 'cardId') {
      transferParam[param] = value;
    }
  })
  
  console.log(transferParam);
  
  axios.post('/stripe/createTransfer', {
    param: transferParam
  }).then(res => {
    if (res.data.success) {      //// successfully created
      callback(res.data.data, null);
    } else {
      callback(null, 'error')    /// return error
    }
    
  }).catch(err => {
    
  })
  
}



function initStripeBtn(form, btn) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    
    /// firststep, check if customerId attribute exists
    let customerIdInput = form.querySelector("[data-stripe_customer='customerId']");
    
    if (customerIdInput) {      /// charge by customer
      let customerId = customerIdInput.value
      
      /// check if customerId has value
      if (customerId) {    /// use existing customer
      
        /// check if cardId has value
        let cardIdInput = form.querySelector("[data-stripe_card='cardId']");
        if (cardIdInput && cardIdInput.value) {   /// use the cardId for charge
          
          createStripeCharge(form, (charge, err) => {         /// create charge using customerId, cardId
            console.log(charge);
          })
          
          
        } else {   /// create cardId using card detail
          createStripeCardToken(form, (cardToken, err) => {
            if (!cardToken) return;
          
            
            let cardTokenInput = form.querySelector("[data-stripe_cardtoken='tokenId']");
            if (!cardTokenInput) {
              cardTokenInput = document.createElement('input');
              cardTokenInput.setAttribute('data-stripe_cardtoken', 'tokenId');
              cardTokenInput.setAttribute("type", "hidden");
              form.appendChild(cardTokenInput);
            }
            cardTokenInput.value = cardToken.id;
              
            createStripeCard(form, (card, err) => {
              if (!card) return;
              
              if (!cardIdInput) {          /// if there isn't cardId input, create new input
                cardIdInput = document.createElement('input');
                cardIdInput.setAttribute('data-stripe_card', 'cardId');
                cardIdInput.setAttribute("type", "hidden");
                form.appendChild(cardIdInput);
              }
              cardIdInput.value = card.id;
              
              
              createStripeCharge(form, (charge, err) => {
                console.log(charge);
              })
              
            })
              
          })
          
        }
        
      } else {           /// create customer
        createStripeCustomer(form, (customer, err) => {
          if (!customer) return;
          
          customerIdInput.value = customer.id;
          
          createStripeCardToken(form, (cardToken, err) => {
            
            if (!cardToken) return;
            
            
            let cardTokenInput = form.querySelector("[data-stripe_cardtoken='tokenId']");
            if (!cardTokenInput) {
              cardTokenInput = document.createElement('input');
              cardTokenInput.setAttribute('data-stripe_cardtoken', 'tokenId');
              cardTokenInput.setAttribute("type", "hidden");
              form.appendChild(cardTokenInput);
            }
            
            cardTokenInput.value = cardToken.id;
              
            createStripeCard(form, (card, err) => {
              if (!card) return;
              
              let cardIdInput = form.querySelector("[data-stripe_card='cardId']");
              if (!cardIdInput) {          /// if there isn't cardId input, create new input
                cardIdInput = document.createElement('input');
                cardIdInput.setAttribute('data-stripe_card', 'cardId');
                cardIdInput.setAttribute("type", "hidden");
                form.appendChild(cardIdInput);
              }
              cardIdInput.value = card.id;
              
              
              createStripeCharge(form, (charge, err) => {
                console.log(charge);
              })
              
            })
              
          })
        })
        
      }
    } else {                    /// charge by card token
      createStripeCardToken(form, (cardToken, err) => {
        if (!cardToken) return;
        let cardTokenInput = form.querySelector("[data-stripe_cardtoken='tokenId']");
        if (!cardTokenInput) {
          cardTokenInput = document.createElement('input');
          cardTokenInput.setAttribute('data-stripe_cardtoken', 'tokenId');
          cardTokenInput.setAttribute("type", "hidden");
          form.appendChild(cardTokenInput);
        }
        cardTokenInput.value = cardToken.id;
        
        createStripeCharge(form, (charge, err) => {
          console.log(charge);
        })
        
        
      })
    }
  })
}

var transferBtn = document.querySelector('#transferBtn');

transferBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  // axios.post('/stripe/createTransfer', function(res) {
  //   console.log(res);
  // })
  
  axios.post('/stripe/getBalance', function(res) {
    console.log(res);
  })
})



