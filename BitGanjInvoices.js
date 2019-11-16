// global http, moment
function BitGanjInvoice(v_server, v_timeShift) {
    this.server = v_server !== undefined ? v_server : 'test.bitganj.website';
    this.invoicesLibs = ["[S]Invoices","MyInvoices"];
    this.timeshift = Number.isInteger(v_timeShift) ? v_timeShift: 0;
  }

  BitGanjInvoice.prototype.getInvoiceLib = function()
  {
    var res = false;
    var count =this.invoicesLibs.length;
    for (i=0;i<count;i++)
    {
      var cLib = libByName(this.invoicesLibs[i]);
      if (cLib !== null) { 
        res = cLib;
        break;
      }
    }
    return res;
  }

  BitGanjInvoice.prototype.getInvoiceEntryById = function(vInvoiceId)
  {
    var vResult = false;
    if (Number.isInteger(vInvoiceId)) {
	      var vI  = this.getInvoiceLib();
          if (vI) {
            var vInvoice = vI.find(vInvoiceId);
		    var vFounded = vInvoice.length;
		    switch (vFounded) {
                    case 0:
		                log ("Invoice Id:" + vInvoiceId + " not found. And will be created.");
		                var newInvoice = new Object({InvoiceId:vInvoiceId}); 
			            vResult = vI.create(newInvoice); 
                        break;
                      case 1:
                        vResult = vInvoice[0];
                        log('Invoice entry founded!');
                        break;
                    default:
                        log ("For search InvoiceId:" + vInvoiceId + " founded " + vFounded );
                        for (var i=0 ; i < vFounded ; i++) {
                            var cInv = vInvoice[i];                        
                              if (!cInv.deleted) {
                                 	if (cInv.field("InvoiceId") === vInvoiceId) {
                                    vResult = cInv;
                                };                        
    
                             }
	                    };
                        if (vResult === false) {
                             log("Invoice id: " + vInvoiceId + " not found after search. And will be created now."); 
                             var newInvoice = new Object({InvoiceId:vInvoiceId}); 
			                         vResult = vI.create(newInvoice); 
                        }
                        break;
    		        }			    
        } else { message("У Вас, не скачанна библиотека [S]Invoices"); }
    }  else { message("Не корректный, номер счёта!");  }
    return vResult;
  } 

  BitGanjInvoice.prototype.refreshInvoiceEntry = function(vInvoiceEntry, isCheckBalance)
  {
    var pId = vInvoiceEntry.field("InvoiceId");
    var vIsCheckBalance = isCheckBalance !== undefined ? isCheckBalance : 0;
    if (Number.isInteger(pId)) {
        var query = "https://" + this.server + "/api/Statistics?action=getInvoice&id=" + pId + "&isNeedCheckBalance=" + vIsCheckBalance;
        log(query);
        var vResult = http().get(query);
        if (vResult.code === 200) {
          log(vResult.body);
          var json = JSON.parse(vResult.body);
          this.updateInvoiceEntry(json.invoice);          
        }
    }
  } 
  
  BitGanjInvoice.prototype.refreshInvoiceById = function(vIdInvoice, isCheckBalance)
  {
    var vIsCheckBalance = isCheckBalance !== undefined ? isCheckBalance : 0;
    var query = "https://" + this.server + "/api/Statistics?action=getInvoice&id=" + vIdInvoice + "&isNeedCheckBalance=" + vIsCheckBalance;
    log(query);
    var vResult = http().get(query);
    if (vResult.code === 200) {
        log(vResult.body);
        var json = JSON.parse(vResult.body);
        this.updateInvoiceEntry(json.invoice);          
    }
  } 
  
  
  BitGanjInvoice.prototype.updateInvoiceEntry = function(pInvoice) {
      var vId = pInvoice.idInvoices;
      var vInvoiceEntry = this.getInvoiceEntryById(vId);
      if (vInvoiceEntry !== false) {
          var vRegDate = moment(pInvoice.Registered);      
          vInvoiceEntry.set("Registered",vRegDate.add( this.timeshift , 'hours').toDate());    
          vInvoiceEntry.set("OrderId",pInvoice.IdOrder);
          vInvoiceEntry.set("ClientId",pInvoice.ClientId);
          vInvoiceEntry.set("PointId",pInvoice.IdPoint);
          vInvoiceEntry.set("SallerId",pInvoice.SallerId);
          vInvoiceEntry.set("InvoiceState",pInvoice.InvoiceState);
          vInvoiceEntry.set("Currency",pInvoice.Currency);
          vInvoiceEntry.set("Price",pInvoice.Price);
          vInvoiceEntry.set("InitialBallance",pInvoice.InitialBallance);
          vInvoiceEntry.set("InvoiceAddress",pInvoice.InvoiceAddress);
          vInvoiceEntry.set("InvoiceBalance",pInvoice.InvoiceBalance);
          if (pInvoice.InvoiceEndDate !== null) 
          {
            var vEndDate = moment(pInvoice.InvoiceEndDate);
            vInvoiceEntry.set("InvoiceEndDate",vEndDate.add(this.timeshift, 'hours').toDate());        
          }
          var vBalanceDate = moment(pInvoice.BalanceDate);
          vInvoiceEntry.set("BalanceDate",vBalanceDate.add(this.timeshift,'hours').toDate());
          var vPricingDate = moment(pInvoice.PricingDate);
          vInvoiceEntry.set("PricingDate",vPricingDate.add(this.timeshift,'hours').toDate());          
         vInvoiceEntry.recalc();
      }
      return vInvoiceEntry;
  }
