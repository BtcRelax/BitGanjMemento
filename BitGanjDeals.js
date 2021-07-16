/*eslint-disable no-undef, no-undef, no-undef*/
function BitGanjDeals() {
    this.current_date= moment().toDate();
}

BitGanjDeals.prototype.setEndDate = function(pEntry) {
    var ce = typeof pEntry !== "undefined" ? pEntry : entry();
    var vn = ce.field('State');
    var ct = ce.field('FinishDate');
    if (vn == 'Catched' || vn == 'Canceled') {
        if (ct == null) { entry().set("FinishDate", this.current_date); }
    } else {
        entry().set("FinishDate", null);
    }; 
};

BitGanjDeals.prototype.updateVendor = function(pEntry) {
    var ce = typeof pEntry !== "undefined" ? pEntry : entry();
    if (ce.field("Vendor").length > 0) {
        var vVend = ce.field("Vendor")[0];
        vVend.set("LastTransaction", this.current_date);
        log("Last transaction date for vendor was set to:" + this.current_date);
    };
};

BitGanjDeals.prototype.getCurrencyAmount = function(pEntry) {
        var ce = typeof pEntry !== "undefined" ? pEntry : entry();
        var vps = ce.field("PaymentSystem"); let sca = new Object();
        switch (vps) {
            case 'Bitcoin':
                sca['currency'] = 'btc';
                sca['amount'] = ce.field("BTC amount");
                break;
            case 'EasyPay':
            case 'GlobalMoney':
            case 'KunaCode':
                sca['currency'] = 'uah';
                sca['amount'] = ce.field("UAH amount");
                break;
            case 'USDT (TRC 20)':
                sca['currency'] = 'usd';
                sca['amount'] = ce.field("Invested");
                break;
            default:
                message("Unknown payment system:" + vps);
                cancel();
                break;
        };
        return sca;    
};


