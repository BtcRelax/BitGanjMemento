/* global http, moment */
function BitGanjKunaApi(v_access_token,v_secret) {
    this.server = "api.kuna.io";
    this.access_token = typeof v_access_token !== "undefined" ? v_access_token : null;
    this.secret = typeof v_secret !== "undefined" ? v_secret : null;
}

BitGanjKunaApi.prototype.getExchangeRates = function(pInCurrency) {
    var qry = "https://" + this.server + "/v3/exchange-rates/" + pInCurrency ;
    log(qry);
    var vResult = http().get(qry);
    log("Result code:" + vResult.code + " with body:" + vResult.body);
    if (vResult.code === 200) {
        var json = JSON.parse(vResult.body);
        return json;
    }
}