/*eslint-disable no-undef, no-undef, no-undef*/
function BitGanjPoint(v_server, v_tokenKey, v_timeShift) {
  this.server = v_server !== undefined ? v_server : 'tnf.fastfen.club';
  this.tokenKey = v_tokenKey !== null ? v_tokenKey : null;
  this.registered = 0;
  this.saled = 0;
  this.catched = 0;
  this.timeshift = Number.isInteger(v_timeShift) ? v_timeShift: 0 ;
}

BitGanjPoint.prototype.tryToCancelOrder = function (pEntry) {
    var vIsBanCustomer = arg('IsBanCustomer');
    var auth = pEntry.author;
    var cId = pEntry.field("bookmarkId");
    var qry = "https://" + this.server + "/api/Bookmark?action=CancelFromOrder&author=" + auth + "&bookmarkId=" + cId + "&IsBanCustomer=" + vIsBanCustomer;
    log(qry);
    var vResult = http().get(qry);
    log("Result code:" + vResult.code + " with body:" + vResult.body);
    if (vResult.code === 200) {
        var json = JSON.parse(vResult.body);
        if (json.BookmarkResult === true) {
            this.getPointState(pEntry);
            pEntry.set("ServerError", "");
            pEntry.set("isError", false);
        } else {
            pEntry.set("ServerError", json.BookmarkError);
            pEntry.set("isError", true);
        }   
    }
};

BitGanjPoint.prototype.tryToGetOrderClientInfo = function (pEntry) {
    var vEntry = pEntry !== undefined ? pEntry : entry();
    var vOrderId = vEntry.field("OrderId");
    if (Number.isInteger(vOrderId)) {
        var vBGOrder = new BitGanjOrder(this.server, this.timeshift);
  	    var vOrderEntry = vBGOrder.getOrderEntryById(vOrderId);
  	    var vIdCustomer = vOrderEntry.field("CustomerId");
  	    var vBGCust = new BitGanjCustomer(this.server, this.timeshift);
  	    var vCustEntry = vBGCust.getCustomerEntryById(vIdCustomer);
        if (vCustEntry) {vBGCust.refreshCustomerEntry(vCustEntry); }
        return vCustEntry;
    }
};

BitGanjPoint.prototype.LinkningToOrder = function (pEntry) {
  var vEntry = pEntry !== undefined ? pEntry : entry();
  var vOrderId = vEntry.field("OrderId");    
  if (Number.isInteger(vOrderId))  {
  	var vOrderLink = vEntry.field("OrderLink");  
  	var vBGOrder = new BitGanjOrder(this.server, this.timeshift);
  	var vOrderEntry = vBGOrder.getOrderEntryById(vOrderId);
  	if ((vOrderLink.length === 0) && (vOrderEntry !== false))  {
            vEntry.set("OrderLink", vOrderEntry);
  	}
  }
};

BitGanjPoint.prototype.setNewState = function (pEntry,pSkipRegister) {
  var vNewState = arg('NewState');
  var vCurrentState = pEntry.field("Status");
  var vIsSkipServer = pSkipRegister === undefined ? false: pSkipRegister;
  if (vCurrentState !== vNewState) {
  	  if (vIsSkipServer === true) { pEntry.set("Status", vNewState);  }
  	  else {
  	      var vM = moment();  
  	      var cId = pEntry.field("bookmarkId");
		  var cIsSent = pEntry.field("isSent");
	      switch (vNewState) {
	         case 'Preparing':
		            if (cId === null && cIsSent === false) {
		                var vRes =  this.registerPoint(pEntry);        
		                if (vRes) {
		                    pEntry.set("DropDate", vM.toDate());
		                    pEntry.set("ServerError", "");
		                    pEntry.set("isError", false);                
		                    }
	            	} else { this.changeState(pEntry, vNewState);}
	            break;
	         case 'Published':
	            this.updatePoint(pEntry); 
	        	this.changeState(pEntry, vNewState);
	        	break;
	         case 'Catched':
	         	if (vCurrentState === 'Created') {
	         		// Manual sale, so need to create finoperation by hands
	         		message("Manual operation");
	         	} else { this.changeState(pEntry, vNewState); }
	         	break;
	         case 'Lost':
	         	if (this.changeState(pEntry, vNewState)) {
	         		var vLostOrderId = pEntry.field("OrderId");
	         		if (Number.isInteger(vLostOrderId)) {
	         			var vBGOrder = new BitGanjOrder(this.server, this.timeshift);
	         			var vOrder = vBGOrder.getOrderEntryById(vLostOrderId);
	         			vOrder.set("isHasLosts", true);
	         		} 
	         	}
	         	break;
	         default:
	            this.changeState(pEntry, vNewState);
	            break;
	        }
	      if (pEntry.field("isError") !== true) { pEntry.set("StatusChanged", vM.toDate());
	      } else { message("State not changed! Because error happend."); }	
  	  }
    } else { message("Point already in that state!"); }
};

BitGanjPoint.prototype.changeState = function (pEntry, vNewState) {
            var auth = pEntry.author;
            if (auth !== null) {
	            var cId = pEntry.field("bookmarkId");
	            var qry = "https://" + this.server + "/api/Bookmark?action=SetNewState&author=" + auth + "&bookmarkId=" + cId + "&state=" + vNewState;
	            log(qry);
	            var vResult = http().get(qry);
	            log("Result code:" + vResult.code + " with body:" + vResult.body);
	            if (vResult.code === 200) {
	              var json = JSON.parse(vResult.body);
	              if (json.BookmarkResult === true) {
	                pEntry.set("Status", json.BookmarkState.bookmarkState);
	                pEntry.set("ServerError", "");
	                pEntry.set("isError", false);
	                return true;
	              } else {
	                pEntry.set("ServerError", json.BookmarkError);
	                pEntry.set("isError", true);
	                return false;
	              }   
	            }
            } else {
		      pEntry.set("ServerError", "Upload library to cloud before register points at server!");
		      pEntry.set("isError", true);
    		}
};

BitGanjPoint.prototype.getRegionTitle = function (pEntry) {
  var cReg = pEntry.field("Region");
  var vRegCounts = cReg.length;
  var vRegion = null;
  if (vRegCounts > 0) {
    vRegion = this.getRegionPath(cReg[0]);
  }
  return vRegion;
};

BitGanjPoint.prototype.getRegionPath = function (pEntry) {
  var res;
  res = pEntry.field("RegionTitle");
  var parCnt = pEntry.field("ParentRegion").length;
  if (parCnt > 0) {
    res = res + ", " + this.getRegionPath(pEntry.field("ParentRegion")[0]);
  }
  return res;
};

BitGanjPoint.prototype.getAverageLocation = function (vLocation) {
  var nLat = vLocation.lat;
  var nLng = vLocation.lng;
  var i = 1;
  while (vLocation.hasNext) {
    vLocation = vLocation.next;
    nLat = nLat + vLocation.lat;
    nLng = nLng + vLocation.lng;
    i = i + 1;
  }
  return {
    lat: Math.round(nLat / i * 1000000) / 1000000,
    lng: Math.round(nLng / i * 1000000) / 1000000
  };
};

BitGanjPoint.prototype.getAdvertiseTitle = function (pEntry) {
  var inbox = pEntry.field('InBox');
  var result = '';
  for (var i2 = 0; i2 < inbox.length; i2++) {
    var linkedEntry = inbox[i2];
    if (result === '') {
      result =  "[" + this.getProductJson(linkedEntry);
    } else {
      result = result + " , " + this.getProductJson(linkedEntry);
    }
  }
  return result + "]";
};

BitGanjPoint.prototype.getProductJson  = function (pEntry) {
  var vP = pEntry.field('Product')[0];
  var res = '{\"ProductId\":' + vP.field("ProductId") + ',\"Title\":\"';
  if (pEntry.field("AdvertiseTitle") === '') {
		var ty=pEntry.field("CountType");
		if (ty==='weigth') { res = res + ' -'+pEntry.field("Weight")+' грамм'; } 
		else { res = res +' -'+pEntry.field("Quantity")+' шт.'; }
	} else { res = res + ' -' + pEntry.field("AdvertiseTitle"); }
  return encodeURIComponent(res + '\"}' );
};


BitGanjPoint.prototype.getOrderParam = function(pEntry) {
	var result = this.preparePreorderInfo(pEntry);
	return result;
};


BitGanjPoint.prototype.preparePreorderInfo = function (pEntry) {
	var res = '';
	var vOrders = pEntry.field('OrderLink');
	  for (var i2 = 0; i2 < vOrders.length; i2++) {
	    var linkedEntry = vOrders[i2];
		if (linkedEntry.field('isHasLosts') === true) {
	    		vOrderId = linkedEntry.field('OrderId');
	    		log("Assign order id:" + vOrderId );
	    		pEntry.set("OrderId", vOrderId);
	    		res = ',"orderid":' + vOrderId;
	    		break;
	    }
	  }
	 return res;
};


BitGanjPoint.prototype.getLocationParam = function (pEntry) {
    var res = '';
    var pLocation = pEntry.field("Loc");
    if (pLocation !== null) {
    	var loc = this.getAverageLocation(pLocation);
    	res = ',"location":{"latitude":' + loc.lat + ',"longitude":' + loc.lng + '}';
    }
    return res;
};


BitGanjPoint.prototype.getTitleParam = function (pEntry) {
    var res = '"title":"' + this.getAdvertiseTitle(pEntry) + '"';
    return res;
};


BitGanjPoint.prototype.getPriceParam = function (pEntry) {
    var res = ',"price":' + pEntry.field('TotalPrice');
    return res;
};

BitGanjPoint.prototype.registerPoint = function (pEntry) {
  var res = false;
  var auth = pEntry.author;
    if (auth !== null) {
	  var vTitle = this.getTitleParam(pEntry);
      var vPrice = this.getPriceParam(pEntry);
	  var vLocation = this.getLocationParam(pEntry);
      var vOrder = this.getOrderParam(pEntry); 
      var params = '[{'+ vTitle + vPrice + vLocation + vOrder + '}]';
      log (params);
      var vURI = "https://" + this.server + "/api/Bookmark?action=CreateNewPoint&author=" + auth + "&params=" + encodeURIComponent(params);
      log(vURI);
      var vResult = http().get(vURI);
      log("Result code:" + vResult.code + " with body:" + vResult.body);
      if (vResult.code === 200) {
        var json = JSON.parse(vResult.body);
        if (json.BookmarkResult === true) {
          pEntry.set("isSent", true);
          pEntry.set("BookmarkId", json.BookmarkState.bookmarkId);
          pEntry.set("ServerError", "");
          pEntry.set("isError", false);
          this.setPointState(pEntry, json.BookmarkState.bookmarkState); 
          this.registered = this.registered + 1;
          res = true;
        } else {
          pEntry.set("ServerError", json.BookmarkError);
          pEntry.set("isError", true);
        }
      } else {
        pEntry.set("ServerError", "As a result of call:" + vResult.code);
        pEntry.set("isError", true);
      }
    } else {
      pEntry.set("ServerError", "Upload library to cloud before register points at server!");
      pEntry.set("isError", true);
    }
  return res;
};

BitGanjPoint.prototype.updatePoint = function (pEntry) {
  var vStateStart = pEntry.field("Status");
  if ((vStateStart === 'Preparing') || (vStateStart === 'Saled')) {
    var auth = pEntry.author;
    var vLink = pEntry.field("URLToPhoto");
    var vDescr = pEntry.field("Description");
    var vPointId = pEntry.field("BookmarkId");
    var vRegionTitle = this.getRegionTitle(pEntry);
    var price = pEntry.field('TotalPrice');
    var title = this.getAdvertiseTitle(pEntry);
    var params = encodeURIComponent('[{"title":"' + title + '","price":' + price + ',"region":"' + vRegionTitle + '","link":"' + vLink + '","description":"' + vDescr + '"}]');
    var vRequest = "https://" + this.server + "/api/Bookmark?action=UpdatePoint&author=" + auth + "&bookmarkId=" + vPointId + "&params=" + params;
    log(vRequest);
    var vResult = http().get(vRequest);
    log("Result code:" + vResult.code + " with body:" + vResult.body);
    if (vResult.code === 200) {
      var json = JSON.parse(vResult.body);
      if (json.BookmarkResult === true) {
        pEntry.set("Latitude", json.BookmarkState.bookmarkLatitude);
        pEntry.set("Longitude", json.BookmarkState.bookmarkLongitude);
        pEntry.set("URLToPhoto", json.BookmarkState.bookmarkPhotoLink);
        pEntry.set("Description", json.BookmarkState.bookmarkDescription);
        pEntry.set("ServerError", "");
        pEntry.set("isError", false);
        } else {
            pEntry.set("ServerError", json.BookmarkError);
            pEntry.set("isError", true);
        }
      } else {
      message(vResult.code);
    }
  } else { message ("Point can be updated at server, only in Preparing or Saled state!");}
};

BitGanjPoint.prototype.setPointState = function (pEntry, pState) {
  var vStateStart = pEntry.field("Status");
  if (vStateStart !== pState) {
    var vM = moment();  
    pEntry.set("Status", pState);
    switch (pState) {
      case 'Saled':
        this.saled = this.saled + 1;
        break;
      case 'Catched':
        this.catched = this.catched + 1;
        break;
      case 'Preparing':
        pEntry.set("DropDate", vM.toDate());
        break;
      case 'Lost':
        break;
      default:
        break;
    }
    pEntry.set("StatusChanged", vM.toDate());
  }
};

BitGanjPoint.prototype.getPointState = function (pEntry) {
  var cId = pEntry.field("bookmarkId");
  var cIsSent = pEntry.field("isSent");
  if (Number.isInteger(cId) && cIsSent === true) {
    try {
        var query = "https://" + this.server + "/api/Bookmark?action=GetPointState&bookmarkId=" + cId + "&author=" + pEntry.author;
          log(query);
          var vResult = http().get(query);
          log("Result code:" + vResult.code + " with body:" + vResult.body);
        switch (vResult.code) {
          case 200:
            var json = JSON.parse(vResult.body);
            if (json.BookmarkResult === true) {
                var vState = json.BookmarkState;
                this.setPointState(pEntry, vState.bookmarkState);
                var vEndRaw = vState.bookmarkEndDate;
                var vOrderId = vState.bookmarkOrderId;
                if (Number.isInteger(vOrderId))  {
                        pEntry.set("OrderId", vOrderId);
                        var vOrder = vState.bookmarkOrder;
                        this.setOrderToPoint(pEntry, vOrder);
                        if (vState.bookmarkState === 'PreOrdered') {
                            var vIdInvoice = vOrder.invoice.idInvoices;
                            var vBGInvoice = new BitGanjInvoice(this.server, this.timeshift);
                            vBGInvoice.refreshInvoiceById(vIdInvoice, true);
                        }
                    } else { pEntry.set("OrderId", null); }
                if (vEndRaw !== undefined) {
                    var vEndDate = moment(vEndRaw.date).add( this.timeshift , 'hours');
                    pEntry.set("EndDate", vEndDate.toDate());
                } else {   pEntry.set("EndDate", null); }
                if (cId === vState.bookmarkId) {          
                    pEntry.set("ServerError", "");
                    pEntry.set("isError", false);
                }
            } else {
                    pEntry.set("ServerError", json.BookmarkError);
                    pEntry.set("isError", true);
                   }
            pEntry.recalc();             
            break;
         case 403:
            break;
          default:
            break;
        }
    } catch (err) {
               log(err);
               var vErrorMessage = err.message;
               var vIsCryptoError = vErrorMessage.search("master password not set");
               if ( vIsCryptoError > 0 ) {
                 pEntry.show();
                 exit();
               } else {
    	           message("Error while refresh, point Id:" + cId );
    	           message("Error message:" + vErrorMessage);                   
               }
	}    
    }
};

BitGanjPoint.prototype.setOrderToPoint = function (pEntry, pOrder) {
    var vOrderLink = pEntry.field("OrderLink");  
    var vBGOrder = new BitGanjOrder(this.server, this.timeshift);
    var vOrder = pOrder.order;
  	var vOrderEntry = vBGOrder.updateOrderEntry(vOrder);
  	var vBGInvoice = new BitGanjInvoice(this.server, this.timeshift);
  	var vInvoice = pOrder.invoice;
    var vInvoiceEntry = vBGInvoice.updateInvoiceEntry(vInvoice);
    if (vOrderEntry && vInvoiceEntry) { vOrderEntry.set("LinkedInvoice", vInvoiceEntry); }
  	if ((vOrderLink.length === 0) && (vOrderEntry !== false))  { pEntry.set("OrderLink", vOrderEntry); } 
      	else {  var isExists = false;
  	             if (vOrderLink.length > 0) 
  	             {
  	                var count = vOrderLink.length;
                    for (i = 0; i < count; i++) {
                    var cEntry = vOrderLink[i];
                    if (cEntry.field("OrderId") === vOrderEntry.field("OrderId")) {
                        isExists = true;
                        break;
                      }
  	                }
  	              }
  	    if (!isExists) { pEntry.link("OrderLink",vOrderEntry);}
   	}
 };














