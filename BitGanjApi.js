// Public methods
// {Points} operaions

function updateCustomerBanState(pServer,pEntry) {
    var vCe = pEntry !== undefined ? pEntry : entry();
    var vApi = new BitGanjCustomer(pServer);
    vApi.setUserBan(pEntry);
}

function checkCustomerInfo(pServer, pCustomerId) {
     var vCustApi = new BitGanjCustomer(pServer);
     var isExists = vCustApi.isExists(pCustomerId);
     if (isExists  === false) {
        message("Invalid customer id");
        cancel();
    } else {
      var ce = vCustApi.getCustomerEntryById(pCustomerId);
      ce.show();
    }
}

function validateLibraryName(pServer,pTimeshift) {
    var vApi = new BitGanjUtils();
    var vE = entry();
    var vName = vE.field("LibraryName");
    var vR = vApi.getLibByName(vName);
    if (vR === false) {
        message("Библиотека не найденна");
        cancel();
    } else {
        var vLibApi = new BitGanjLibraries(pServer,pTimeshift)
        vLibApi.refreshLibraryEntry(vE);
    }
}


function setAverageLocation() {
    var vE = entry();
    var vL = vE.field("Loc");
    var vApi = new BitGanjPoint();
    var vAL = vApi.getAverageLocation(vL);
    var JSGeolocation = {address:"", hasNext:false, lat:vAL.lat , lng:vAL.lng , next:null};
    vE.set("Loc", JSGeolocation);
}

function refreshProxies() {
    var vA = new BitGanjUtils();
    var vL = vA.getProxiesList();
    log(vL);
    
}

function RefreshLibraries(pServer) {
    var vL = lib();
    var vEntrs = vL.entries();
    var count = vEntrs.length;
    for (var i = 0; i < count; i++) {
	var cL = vEntrs[i];
    	if ((cL.field("Status") === 'InProgress') || (cL.field("Status") === 'NotStarted') ) 
    	{
    		RefreshLibrary(pServer, cL);
    	}
    }        
}

function OpenLibrary(pServer, vEntry) {
    var vCe = vEntry !== undefined ? vEntry : entry();
    var vApi = new BitGanjLibraries(pServer);
    vApi.openLibraryEntry(vCe);
}

function RefreshLibrary(pServer, vEntry) {
    var vCe = vEntry !== undefined ? vEntry : entry();
    var vApi = new BitGanjLibraries(pServer);
    vApi.refreshLibraryEntry(vCe);
    if (vApi.isAllSaled) {
        vCe.set("Status","Sailed");
    }
}


function SyncLibrary(pServer) {
  var cLib = lib();
  var entries = cLib.entries();
  var count = entries.length;
  var vApi = new BitGanjPoint(pServer); 
  for (var i = 0; i < count; i++) {
       var cEntry = entries[i];
       var cId = cEntry.field("BookmarkId");
       try {
            if ((cEntry.field("Status") !== "Catched") || (cEntry.field("Status") !== "Lost")
            || cEntry.field("Status") !== "Created")  {
                vApi.getPointState(cEntry); 
            }
       } catch (err) {
          message("Error update info about point:" + cId);
          message("Error message:" + err.message);
       }
    message("Process:" + i + " of " + count); 
  }
  var vResultMsg = 'Registered:' + vApi.registered + '\n Saled:' + vApi.saled + '\n Catched:' + vApi.catched;
  message(vResultMsg);
}

function CancelOrder(pServer,pEntry) {
    var vEntry = pEntry !== undefined ? pEntry : entry();
    var vApi = new BitGanjPoint(pServer);
    vApi.tryToCancelOrder(vEntry);  
}

function GetCustomerInfo(pServer, pEntry) {
    var vEntry = pEntry !== undefined ? pEntry : entry();
    var vApi = new BitGanjPoint(pServer);
    var vCustomerEntry =  vApi.tryToGetOrderClientInfo(vEntry);
    if (vCustomerEntry) { vCustomerEntry.show(); } 
}

function SetState(pServer,pEntry) {
  var vEntry = pEntry !== undefined ? pEntry : entry();
  var vApi = new BitGanjPoint(pServer);
  vApi.setNewState(vEntry);
}


function GetState(pServer,pEntry) {
  var vEntry = pEntry !== undefined ? pEntry : entry();
  var vApi = new BitGanjPoint(pServer);
  vApi.getPointState(vEntry);
}

function UpdatePoint(pServer,pEntry, pTimeShift) {
  var vEntry = pEntry !== undefined ? pEntry : entry();
  var vApi = new BitGanjPoint(pServer, null, pTimeShift);
  vApi.updatePoint(vEntry);
}



// {Products} operaions
function SyncProducts(pServer) {
  var cLib = lib();
  var entries = cLib.entries();
  var count = entries.length;
  var vAPI = new BitGanjProduct(pServer);
  for (i = 0; i < count; i++) {
    var cEntry = entries[i];
    vAPI.getProductState(cEntry);
    message("Process:" + i + " of " + count);
  }
}

function SetProductState(pServer) {
  var vEntry = entry();
  if (vEntry !== null) {
    var vApi = new BitGanjProduct(pServer);
    vApi.setProductState(vEntry);
  }
}

function GetProductState(pServer) {
  var vEntry = entry();
  var vApi = new BitGanjProduct(pServer);
  vApi.getProductState(vEntry);
}

//// {Versions} operaions

function SyncVersions() {
  var clib = lib(); var entries = clib.entries();
  for (var i = 0; i < entries.length; i++) {
    var cEntry = entries[i];
    var vHost = cEntry.field("Hostname");
    var vAPI = new BitGanjUtils(vHost);
    var v = vAPI.getVersion();
    if (v !== false) {
        cEntry.set("responce", v);
        cEntry.set("isActive", true);
    } else {
        cEntry.set("isActive", false);
        cEntry.set("responce", "Unknown");
        cEntry.set("Version", null);
    }
  }
}

/// Global 
function setAuthor(pEntry) {
  var cE = pEntry !== undefined ? pEntry : entry();
  var vAuth = cE.author;
  cE.set("owner",vAuth);
}

function fillOwners() {
  var clib = lib();
  var entries = clib.entries();
  for (var i = 0; i < entries.length; i++) {
    var cEntry = entries[i];
    setAuthor(cEntry);
  }
}

function RefreshCustomer(pServer, pEntry) {
    var vEntry = pEntry !== undefined ? pEntry : entry();
    var vBGCust = new BitGanjCustomer(pServer);
    vBGCust.refreshCustomerEntry(vEntry);
    vEntry.show();
}

function RefreshCustomers(pServer) {
    var vBGCust = new BitGanjCustomer(pServer);
    var vCustLib = vBGCust.getCustomerLib();
    if (vCustLib ) {
       var pEs = vCustLib.entries();
        for (var ent = 0; ent < pEs.length; ent++) {   // Loop through all entries
            RefreshCustomer(pServer, pEs[ent]);
        }
    } else { message("У Вас, не скачанна библиотека [S]Customers!"); }  
}

function LinkningToCustomer(pServer,pEntry) {
  var vEntry = pEntry !== undefined ? pEntry : entry();
  var vCustomerId = vEntry.field("CustomerId");    
  var vCustomerLink = vEntry.field("LinkedCustomer");  
  var vBGCust = new BitGanjCustomer(pServer);
  var vCustomerEntry = vBGCust.getCustomerEntryById(vCustomerId);
  if ((vCustomerLink.length === 0) && (vCustomerLink !== false))  {
            vEntry.set("LinkedCustomer", vCustomerEntry);
            vEntry.set("isLinked", true);
            message("Linking customer:"+vCustomerId);
  }
}

function RefreshInvoice(pServer, pEntry) {
    var vEntry = pEntry !== undefined ? pEntry : entry();
    var vIsCheckBalance = arg('CheckBalance');
    var vBGInvoice = new BitGanjInvoice(pServer);
    vBGInvoice.refreshInvoiceEntry(vEntry,vIsCheckBalance);
}

function RefreshInvoices(pServer) {
    var vBGInvoice = new BitGanjInvoice(pServer);
    var InvoiceLib = vBGInvoice.getInvoiceLib();
    if (InvoiceLib) {
       var pEs = InvoiceLib.entries();
       for (var ent = 0; ent < pEs.length; ent++) {   // Loop through all entries
            RefreshInvoice(pServer, pEs[ent]);
        }
    } else { message("У Вас, не скачанна библиотека [S]Invoice!"); }  
}

function LinkningToInvoice(pEntry) {
  var vEntry = pEntry !== undefined ? pEntry : entry();
  var vInvoiceId = vEntry.field("InvoiceId");    
  if (Number.isInteger(vInvoiceId))  {
  	var vInvoiceLink = vEntry.field("InvoiceLink");  
  	var vBGInvoice = new BitGanjInvoice();
  	var vInvoiceEntry = vBGInvoice.getInvoiceEntryById(vInvoiceId);
  	if ((vInvoiceLink.length === 0) && (vInvoiceLink !== false))  {
            vEntry.set("InvoiceLink", vInvoiceLink);
  	}
  } else { vEntry.set("InvoiceLink", null); }
}

/// For Orders library 
function RefreshOrder(pServer, pEntry) {
   var vEntry = pEntry !== undefined ? pEntry : entry();
   var vBGOrder = new BitGanjOrder(pServer);
   vBGOrder.refreshOrderEntry(vEntry);
}

function RefreshOrders(pServer) {
    var vBGOrder = new BitGanjOrder(pServer);    
    var ordersLib = vBGOrder.getOrderLib();
    var pRealMaxId = vBGOrder.getMaxId();
	var msg = "Real server max order id is:" + pRealMaxId;
	log(msg); message(msg);
    if (ordersLib) {
       var pMaxId = 0;
       var pEs = ordersLib.entries();
        for (var ent = 0; ent < pEs.length; ent++) {   // Loop through all entries
            var cEnt = pEs[ent];
            if (cEnt.field("OrderId") > pMaxId) 
            { pMaxId =  cEnt.field("OrderId"); 
              log("Max Order Id set to:" + pMaxId); }
            try {
                var vState = cEnt.field("OrderState");
                if ((vState === 'Confirmed') || (vState === 'WaitForPay')
                    || (vState === 'Paid')) {
                    log("Refreshing order id:" + cEnt.field("OrderId"));
                    RefreshOrder(pServer, cEnt ); }
                } catch (err) {
	           message("Error while refresh, order Id:" + cEnt.field("OrderId")  );
	           message("Error message:" + err.message);
	        }
	   }
	   if (pRealMaxId > pMaxId) {
        var vLen = pRealMaxId - pMaxId;              
	        for (var i = 1; i <= vLen ; i++) {
	               var vNewOrderId = pMaxId + i;
	               if (vBGOrder.isOrderExist(vNewOrderId)) {
	                 var vOE = vBGOrder.getOrderEntryById(vNewOrderId);
	                 vBGOrder.updateOrderEntry(vOE);
	                 message("Order id:" + vNewOrderId + " created" );
	               }
	            }
	        }
    } else { message("У Вас, не скачанна библиотека [S]Orders!"); }  
}

function LinkningToOrder(pEntry) {
  var vEntry = pEntry !== undefined ? pEntry : entry();
  var vOrderId = vEntry.field("OrderId");    
  if (Number.isInteger(vOrderId))  {
  	var vOrderLink = vEntry.field("OrderLink");  
  	var vBGOrder = new BitGanjOrder();
  	var vOrderEntry = vBGOrder.getOrderEntryById(vOrderId);
  	if ((vOrderLink.length === 0) && (vOrderEntry !== false))  
  	{ vEntry.set("OrderLink", vOrderEntry); }
  }
}
