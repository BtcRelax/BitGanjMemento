function BitGanjUtils(v_server, v_tokenKey, v_timeShift) {
  this.server = v_server !== undefined ? v_server : 'test.bitganj.website';
  this.tokenKey = v_tokenKey !== null ? v_tokenKey : null;
  this.timeshift = Number.isInteger(v_timeShift) ? v_timeShift: 7 ;
}

BitGanjUtils.prototype.getLibByName = function(pName) {
    var res = false;
    var cLib = libByName(pName);
    if (cLib !== null) { 
        res = cLib;
    }
    return res;
}


BitGanjUtils.prototype.getVersion = function () {
  var vResult= false;
  try {
      var result = http().get("https://" + this.server + "/api/Info?action=getver");
      if (result.code === 200) {
        var vGetVerResult = JSON.parse(result.body);
        vResult = vGetVerResult.Core;
      }      
  }
  catch (err) {
          message("Error getting version info about server :" + this.server);
          message("Error message:" + err.message);
  };
  return vResult;
}

BitGanjUtils.prototype.getProxiesList = function() {
  var vResult= false;
  try {
      var result = http().get("https://www.proxy-list.download/api/v1/get?country=UA&type=http");
      if (result.code === 200) {
        var vProxies = JSON.parse(result.body);
        vResult = vProxies;
      }      
  }
  catch (err) {
          message("Error getting proxies list!");
          message("Error message:" + err.message);
  };
  return vResult;
}


BitGanjUtils.prototype.isArray = function(x) {
  return x.constructor.toString().indexOf("Array") > -1;
}