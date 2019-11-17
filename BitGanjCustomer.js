/* global http, moment */
function BitGanjCustomer(v_server, v_timeShift) {
    this.server = v_server !== undefined ? v_server : 'test.bitganj.website';
    this.customerLibs = ["[S]Customers","MyCustomers"];
    this.timeshift = Number.isInteger(v_timeShift) ? v_timeShift: 7;
    this.currentEnitity = null;
  }

  BitGanjCustomer.prototype.updateCustomerInfoById = function (vId) {
      var vCustomerEntry = this.getCustomerEntryById(vId);
      this.refreshCustomerEntry(vCustomerEntry);
  };

   BitGanjCustomer.prototype.isExists = function (pId) {
        var query = "https://" + this.server + "/api/User?action=getinfo&id=" + pId ;
        log(query);
        var vResult = http().get(query);
        return Result.code === 200  ? true: false;
   }
  

  BitGanjCustomer.prototype.getCustomerLib = function()
  {
    var res = false;
    var count =this.customerLibs.length;
    for (i=0;i<count;i++)
    {
      var cLib = libByName(this.customerLibs[i]);
      if (cLib !== null) { 
        res = cLib;
        break;
      }
    }
    return res;
  };
  
  

  BitGanjCustomer.prototype.getCustomerEntryById = function(vCustomerId)
  {
    var vResult = false;
    if(vCustomerId === null || vCustomerId === '')
    {
        var vErr = 'CustomerId cannot be null or empty!'; 
        log(vErr); message(vErr); cancel();        
    } else {
        log('Try to find customer by id:' + vCustomerId);
        var vO  = this.getCustomerLib();
          if (vO) {
    		    var vCust = vO.find(vCustomerId);
    		    switch (vCust.length) {
                    case 0:
                        var newCustomer = new Object({CustomerId:vCustomerId}); 
                        vResult = vO.create(newCustomer); 
                        log('Customer entry created! Id:' + vCustomerId);
                        break;
                      case 1:
                        vResult = vCust[0];
                        log('Customer entry founded! Id:' + vCustomerId );
                        break;
                    default:
                        message("В библиотеке [S]Customers нарушение уникальности данных! Id:" + vCustomerId);   
                        break;
    		        }
            } else { message("У Вас, не скачанна библиотека [S]Customers!"); }        
    }
    return vResult;
  } 



BitGanjCustomer.prototype.refreshCustomerEntry = function(vCustomerEntry)
  {
    var vResult = false;
    var pId = vCustomerEntry.field("CustomerId");
    log("refreshCustomerEntry with id:" + pId);
    if (pId.length>5) {
        var query = "https://" + this.server + "/api/User?action=getinfo&id=" + pId ;
        log(query);
        var vResult = http().get(query);
        if (vResult.code === 200) {
          log(vResult.body);
          var json = JSON.parse(vResult.body);
          var vRegDate = moment(json.Registered);
          var vIsNew = json.TotalOrdersCount > 0 ? false : true;
          vCustomerEntry.set("RegistrationDate",vRegDate.add( this.timeshift , 'hours').toDate());
          vCustomerEntry.set("CustomerId", json.idCustomer);
          vCustomerEntry.set("Nick",json.Nick);
          vCustomerEntry.set("isBaned",json.isBaned);
          vCustomerEntry.set("OrdersCount",json.TotalOrdersCount);
          vCustomerEntry.set("LostCount",json.LostsCount);
          vCustomerEntry.set("Description", JSON.stringify(json.userIdentifiers));
          vCustomerEntry.set("Bonuses", json.Balance );
          vCustomerEntry.set("isNewCustomer", vIsNew );
          vCustomerEntry.set("LastUpdate", moment().toDate());
          if ( !vIsNew ) {
            var vLastDate = moment(json.LastOrderDate);
            if (vLastDate.isValid()) {
                vCustomerEntry.set("LastOrderDate",vLastDate.add( this.timeshift , 'hours').toDate());    
                };
          };
          log(JSON.stringify(json.userIdentifiers));
          vResult = true;
        }
    }
    return vResult;
};


