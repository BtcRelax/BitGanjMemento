/* global http, moment */
/*eslint-disable no-undef, no-undef-expression, no-new-object*/
function BitGanjOrder(v_server, v_timeShift) {
    this.server = v_server !== undefined ? v_server : 'test.bitganj.website';
    this.ordersLibs = ["[S]Orders","MyOrders"];
    this.timeshift = Number.isInteger(v_timeShift) ? v_timeShift: 0;
  }

  BitGanjOrder.prototype.getOrderLib = function()
  {
    var res = false;
    var count =this.ordersLibs.length;
    for (i=0;i<count;i++)
    {
      var cLib = libByName(this.ordersLibs[i]);
      if (cLib !== null) { 
        res = cLib;
        break;
      }
    }
    return res;
  };

  BitGanjOrder.prototype.getOrderEntryById = function(vOrderId)
  {
    var vResult = false;
    if (Number.isInteger(vOrderId)) {
	      var vO  = this.getOrderLib();
          if (vO) {
		    var vOrder = vO.find(vOrderId);
		    var vFounded = vOrder.length;
		    switch (vFounded) {
                    case 0:
                        log ("Order Id:" + vOrderId + " not found. And will be created.");
		                var newOrder = new Object({OrderId:vOrderId}); 
                        vResult = vO.create(newOrder); 
                        break;
                    case 1:
                        vResult = vOrder[0];
                        log('Order entry founded! Id:' + vOrderId );
                        break;
                    default:
                        log ("For search OrderId:" + vOrderId + " founded " + vFounded );
                        for (var i=0 ; i < vFounded ; i++) {
                            var cOrd = vOrder[i];                        
                              if (!cOrd.deleted) {
                                 	if (cOrd.field("OrderId") === vOrderId) {
                                    vResult = cOrd;
                                };                        
                             };
	                    };
                        if (vResult === false) {
                             message("Order id: " + vOrderId + "Not found"); 
                             //var newOrder = new Object({OrderId:vOrderId}); 
			                 //vResult = vO.create(newOrder); 
                        }
                        break;
    		        }
        } else { message("У Вас, не скачанна библиотека [S]Orders!"); }
    }  else { message("Не корректный, номер заказа!");  }
    return vResult;
  };
  
  BitGanjOrder.prototype.updateOrderEntry = function(pOrder){
      var vId = pOrder.IdOrder;
      var vOrderEntry = this.getOrderEntryById(vId);
      if (vOrderEntry !== false) {
          var vRegDate = moment(pOrder.Registered);
          vOrderEntry.set("OrderStartDate",vRegDate.add( this.timeshift , 'hours').toDate());
          var islinked = vOrderEntry.field("isLinked");  
          if (islinked === false) {
                var vCustomerLink = vOrderEntry.field("LinkedCustomer");  
                var vBGCust = new BitGanjCustomer(this.server, this.timeshift);
                var vCustomerEntry = vBGCust.getCustomerEntryById(pOrder.ClientId);
                if ((vCustomerLink.length === 0) && (vCustomerLink !== false))  {
                    vOrderEntry.set("LinkedCustomer", vCustomerEntry);
                    vOrderEntry.set("isLinked", true);
                  }
                vOrderEntry.set("CustomerId",pOrder.ClientId);    
             }          
         vOrderEntry.set("OrderState",pOrder.OrderState);
         if (pOrder.OrderEndDate !== null) {
                 var vEndDate  = moment(pOrder.OrderEndDate);
                 vOrderEntry.set("OrderEndDate",vEndDate.add( this.timeshift , 'hours').toDate());}           
      };
      return vOrderEntry;
  };
  
  BitGanjOrder.prototype.isOrderExist = function(pId){
    var query = "https://" + this.server + "/api/Statistics?action=getOrder&id=" + pId;
    log(query); 
    var vCallResult = false;
    vResult = http().get(query);
    if (vResult.code === 200) {
      log(vResult.body);
      var json = JSON.parse(vResult.body);
      if (json.order !== null) { vCallResult = true; } 
    }     
    return vCallResult;
  };

  BitGanjOrder.prototype.getMaxId = function() {
    var res = false;
    var query = "https://" + this.server + "/api/Statistics?action=getmaxorderid";
    log(query);
    var vResult = http().get(query);
    if (vResult.code === 200) {
        log(vResult.body);
        var res = JSON.parse(vResult.body);           
    }
    return res;
  };

  BitGanjOrder.prototype.refreshOrderEntry = function(vOrderEntry)
  {
    var pId = vOrderEntry.field("OrderId");
    if (Number.isInteger(pId)) {
        var query = "https://" + this.server + "/api/Statistics?action=getOrder&id=" + pId;
        log(query);
        var vResult = http().get(query);
        if (vResult.code === 200) {
          log(vResult.body);
          var json = JSON.parse(vResult.body);
          var vOrderEnt = this.updateOrderEntry(json.order);
          var vBGI = new BitGanjInvoice(this.server,this.timeshift);
          if (json.invoice !== null) {
             var vInvoiceEnt = vBGI.updateInvoiceEntry(json.invoice);
             if (vOrderEnt && vInvoiceEnt) { vOrderEnt.set("LinkedInvoice", vInvoiceEnt); }
          }
        }
    }
  }; 


