/*eslint-disable no-undef, no-undef, no-undef*/
function BitGanjPoint(v_server, v_tokenKey, v_timeShift) {
  this.server = v_server !== undefined ? v_server : 'test.bitganj.website';
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
        if (vCustEntry) {vBGCust.refreshCustomerEntry(vCustEntry); };
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


BitGanjPoint.prototype.setNewState = function (pEntry) {
  var vNewState = arg('NewState');
  var vCurrentState = pEntry.field("Status");
  var cId = pEntry.field("bookmarkId");
  var cIsSent = pEntry.field("isSent");
  if (vCurrentState !== vNewState) {
      var vM = moment();  
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
          default:
            this.changeState(pEntry, vNewState);
            break;
        }
      pEntry.set("Status", vNewState);
      pEntry.set("StatusChanged", vM.toDate());
    } else { message("Point already in that state!"); }
};

BitGanjPoint.prototype.changeState = function (pEntry, vNewState) {
            var auth = pEntry.author;
            var cId = pEntry.field("bookmarkId");
            var qry = "https://" + this.server + "/api/Bookmark?action=SetNewState&author=" + auth + "&bookmarkId=" + cId + "&state=" + vNewState;
            log(qry);
            var vResult = http().get(qry);
            if (vResult.code === 200) {
              var json = JSON.parse(vResult.body);
              if (json.BookmarkResult === true) {
                json.BookmarkState.bookmarkState;
                pEntry.set("ServerError", "");
                pEntry.set("isError", false);
              } else {
                pEntry.set("ServerError", json.BookmarkError);
                pEntry.set("isError", true);
              }   
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
  var res = encodeURIComponent('{\"ProductId\":' + vP.field("ProductId") + ',\"Title\":\" - ' + pEntry.field('AdvertiseTitle') + '\"}'); 
  return res;
};

BitGanjPoint.prototype.registerPoint = function (pEntry) {
  var res = false;
  var vLocation = pEntry.field("Loc");
  if (vLocation !== null) {
    var loc = this.getAverageLocation(vLocation);
    var auth = pEntry.author;
    if (auth !== null) {
      var price = pEntry.field('TotalPrice');
      var title = this.getAdvertiseTitle(pEntry);
      log(title);
      var params = encodeURIComponent('[{"title":"' + title + '","price":' + price +
        ',"location":{"latitude":' + loc.lat + ',"longitude":' + loc.lng + '}}]');
      var vURI = "https://" + this.server + "/api/Bookmark?action=CreateNewPoint&author=" + auth + "&params=" + params;
      log(vURI);
      var vResult = http().get(vURI);
      if (vResult.code === 200) {
        log(vResult.body);
        var json = JSON.parse(vResult.body);
        if (json.BookmarkResult === true) {
          
          pEntry.set("isSent", true);
          pEntry.set("BookmarkId", json.BookmarkState.bookmarkId);
          //pEntry.set("Status", json.BookmarkState.bookmarkState);
          pEntry.set("Latitude", loc.lat);
          pEntry.set("Longitude", loc.lng);
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
  } else {
    pEntry.set("ServerError", "Location is not set. Set location before sync!");
    pEntry.set("isError", true);
  }
  return res;
};

BitGanjPoint.prototype.updatePoint = function (pEntry) {
  var vStateStart = pEntry.field("Status");
  if (vStateStart === 'Preparing') {
    var auth = pEntry.author;
    var vLink = pEntry.field("URLToPhoto");
    var vDescr = pEntry.field("Description");
    var vPointId = pEntry.field("BookmarkId");
    var vRegionTitle = this.getRegionTitle(pEntry);
    var params = encodeURIComponent('[{"region":"' + vRegionTitle + '","link":"' + vLink + '","description":"' + vDescr + '"}]');
    var vRequest = "https://" + this.server + "/api/Bookmark?action=UpdatePoint&author=" + auth + "&bookmarkId=" + vPointId + "&params=" + params;
    log(vRequest);
    var vResult = http().get(vRequest);
    if (vResult.code === 200) {
      log(vResult.body);
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
  }
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
               };
	};    
    };
};

BitGanjPoint.prototype.setOrderToPoint = function (pEntry, pOrder) {
    var vOrderLink = pEntry.field("OrderLink");  
    var vBGOrder = new BitGanjOrder(this.server, this.timeshift);
    var vOrder = pOrder.order;
  	var vOrderEntry = vBGOrder.updateOrderEntry(vOrder);
  	var vBGInvoice = new BitGanjInvoice(this.server, this.timeshift);
  	var vInvoice = pOrder.invoice;
    var vInvoiceEntry = vBGInvoice.updateInvoiceEntry(vInvoice);
    if (vOrderEntry && vInvoiceEntry) { vOrderEntry.set("LinkedInvoice", vInvoiceEntry); };
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
   	};
 };