/* global http, moment */
/*eslint-disable no-undef, no-undef-expression, no-new-object*/
function BitGanjProduct(v_server, v_timeShift) {
    this.server = v_server !== undefined ? v_server : 'test.bitganj.website';
    this.timeshift = Number.isInteger(v_timeShift) ? v_timeShift: 7;
  }
  


BitGanjProduct.prototype.registerProduct = function (pEntry) {
  var auth = pEntry.author;
  if (auth !== null) {
    var vProductName = pEntry.field('Title');
    var vProductUrl = pEntry.field('ProductURL');
    var params = encodeURIComponent('[{"ProductName":"' + vProductName + '","ProductURL":"' + vProductUrl + '"}]');
    var vURI = "https://" + this.server + "/api/Product?action=create&author=" + auth + "&params=" + params;
    log(vURI);
    var vResult = http().get(vURI);
    if (vResult.code == 200) {
      log(vResult.body);
      var json = JSON.parse(vResult.body);
      if (json.ProductResult === true) {
        pEntry.set("ProductId", json.ProductState.ProductId);
        pEntry.set("Title", json.ProductState.ProductName);
        pEntry.set("ProductURL", json.ProductState.ProductURL);
        pEntry.set("Owner", auth);
        pEntry.set("ServerError", "");
        pEntry.set("isError", false);
        return true;
      } else {
        pEntry.set("ServerError", json.ProductState);
        pEntry.set("isError", true);
      }
    } else {
      pEntry.set("ServerError", "As a result of call:" + vResult.code);
      pEntry.set("isError", true);
    }
  } else {
    pEntry.set("ServerError", "Upload library to cloud before register prducts at server!");
    pEntry.set("isError", true);
  }
  return false;
}

  
BitGanjProduct.prototype.getProductState = function (pEntry) {
  var cId = pEntry.field("ProductId");
  var params = encodeURIComponent('[{"ProductId":"' + cId + '"}]');
  if (Number.isInteger(cId)) {
    var query = "https://" + this.server + "/api/Product?action=get&params=" + params;
    log(query);
    var vResult = http().get(query);
    if (vResult.code === 200) {

      log(JSON.stringify(vResult.body));
      var json = JSON.parse(vResult.body);
      if (json.ProductResult === true) {
          pEntry.set("ProductId", json.ProductState.ProductId);
          pEntry.set("Title", json.ProductState.ProductName);
          pEntry.set("ProductURL", json.ProductState.ProductURL);
          pEntry.set("ServerError", "");
          pEntry.set("isError", false);
          if (json.ProductState.ProductURL !== null) {
                pEntry.set("Status", "Published");
          } else { pEntry.set("Status", "Registered"); }
        } else {
        pEntry.set("ServerError", json.ProductError);
        pEntry.set("isError", true);
      }
    }
  }
}


BitGanjProduct.prototype.setProductState = function (pEntry) {
  var cId = pEntry.field("ProductId");
  var vNewState = pEntry.field("Status");
    switch (vNewState) {
      case 'Registered':
        if (Number.isInteger(cId) === false) {
          if (this.registerProduct(pEntry) === true) {
            message('Product registered!');
          } else { message('Error registering product'); cancel(); }
        }
        break;
      case 'Published':
        this.products_published = this.products_published + 1;
        break; 
      case 'Created':
         if (this.registerProduct(pEntry) === true) {
            message('Product registered!');
          } else { message('Error registering product'); cancel(); }
          break;
      default:
        message('Unsupported server state!');
        cancel();
        break;
    }
    var vM = moment();
    pEntry.set("StatusChanged", vM.toDate());
}