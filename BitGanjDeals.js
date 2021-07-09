/*eslint-disable no-undef, no-undef, no-undef*/
function BitGanjDeals() {
}

BitGanjDeals.prototype.setEndDate = function(pEntry) {
    var ce= typeof pEntry !== "undefined" ? pEntry : entry();
    var vn = ce.field('State');
    var ct = ce.field('FinishDate');
    var cdt=moment().toDate();

    if (vn=='Catched' || vn=='Canceled'){
        if (ct==null) { entry().set("FinishDate",cdt); } 
    } else {
            entry().set("FinishDate",null);
    }
}