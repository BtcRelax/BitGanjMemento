function BitGanjLibraries(vServer, vTimeShift) {
    this.server = vServer !== undefined ? vServer : 'test.bitganj.website';
    this.timeshift = Number.isInteger(vTimeShift) ? vTimeShift : 7;
    this.currentLibrary = null;
  }
  
BitGanjLibraries.prototype.openLibraryEntry = function(vEntry) {
	var vLN = vEntry.field('LibraryName');
	var vLib = libByName(vLN);
	vLib.show();
};

BitGanjLibraries.prototype.refreshLibraryEntry = function(vEntry) {
	var vFrontShopWeight = 0;
	var vFrontShop = 0;
	var vSaledAmount = 0;
	var vSaledWeight = 0;
	var vOnHandsAmount = 0;
	var vOnHandsWeight = 0;
	this.currentLibrary = vEntry;
	var vBeginigState = vEntry.field('Status');
	var vLN = vEntry.field('LibraryName');
	var vLib = libByName(vLN);
	if (vLib) {
		log("Library " + vLN + " found");
		var vEntrs = vLib.entries();
		var count = vEntrs.length;
		log("Total entries in library:" + count);
		var vPointApi = new BitGanjPoint(this.server, this.timeshift);
		for (var i = 0; i < count; i++) {
			var cEntry = vEntrs[i];
			var pState = cEntry.field("Status");
			log("Processing point id:" + cEntry.field('bookmarkId') + " With state:" + pState);
			switch (pState) {
				case 'Created':
				case 'Preparing':
					vOnHandsAmount = vOnHandsAmount + cEntry.field('TotalPrice');
					vOnHandsWeight = vOnHandsWeight + cEntry.field('TotalWeight');
					this.isAllSaled = false;
					break;
				case 'PreOrdered':
				case 'Published':
					vPointApi.getPointState(cEntry);
					vFrontShop = vFrontShop + cEntry.field('TotalPrice');
					vFrontShopWeight = vFrontShopWeight + cEntry.field('TotalWeight');
					this.isAllSaled = false;
					break;
				case 'Saled':
					vPointApi.getPointState(cEntry);
					vSaledAmount = vSaledAmount + cEntry.field('TotalPrice');
					vSaledWeight = vSaledWeight + cEntry.field('TotalWeight');
					this.processPoint(cEntry);
					break;
				case 'Catched':
					vSaledAmount = vSaledAmount + cEntry.field('TotalPrice');
					vSaledWeight = vSaledWeight + cEntry.field('TotalWeight');
					this.processPoint(cEntry);
					break;
				case 'Lost':
					vSaledWeight = vSaledWeight + cEntry.field('TotalWeight');
					break;
				default:
					break;
			}
		}
	} else {
		message('Library:' + vLN + ' not found');
		exit();
	}
	vEntry.set('OnHands', vOnHandsAmount);
	vEntry.set('OnHandsWeight', vOnHandsWeight);
	vEntry.set('SaledAmount', vSaledAmount);
	vEntry.set('SaledWeight', vSaledWeight);
	vEntry.set('FrontShop', vFrontShop);
	vEntry.set('FrontShopWeight', vFrontShopWeight);
	if ((vOnHandsAmount === 0) && (vFrontShop === 0) && (vBeginigState === "InProgress")) {
			log("All operations was done, so status will be changed to Sailed");
			vEntry.set('Status', "Sailed");
		}
	if ((vOnHandsAmount > 0) || (vFrontShop > 0)) {
			log("Has open actives so status will be changed to InProgress");
			vEntry.set('Status', "InProgress");
		}
	vEntry.recalc();
};

BitGanjLibraries.prototype.processOrder = function(pEntry) {
	var invoiceCnt = pEntry.field("LinkedInvoice").length;    
	for (var i2 = 0; i2 < invoiceCnt; i2++) {
	    var vInvoice = pEntry.field("LinkedInvoice")[i2];
		var vInvoiceState = vInvoice.field("InvoiceState");
		var vInvoiceId = vInvoice.field("InvoiceId");
		var vFinOperationsCount = vInvoice.field("isHasFinoperation");
		log("Order id:" + pEntry.field("OrderId") + " was found. And have invoice id: " + vInvoiceId + " with state" + vInvoiceState + " and fin operations:" + vFinOperationsCount);
		if (((vInvoiceState === "Payed") || (vInvoiceState === "OverPay")) && vFinOperationsCount === false) {
			var vFinOperationEntry = this.createFinOperation();
			if (vFinOperationEntry !== false) {
				message("Create fin operation for invoice id:" + vInvoiceId);
				var vAmount = vInvoice.field("BalanceDelta");
				var vFODate = vInvoice.field("InvoiceEndDate");
				vFinOperationEntry.set("Date", vFODate);
				vFinOperationEntry.set("Amount", vAmount);
				vFinOperationEntry.set("Invoice", vInvoice);
				vInvoice.set("isHasFinoperation", 1);
				vFinOperationEntry.recalc();
				this.addFinOperation(vFinOperationEntry);
			}
		}		
	}
};

BitGanjLibraries.prototype.processPoint = function(pEntry) {
	var vOrderId = pEntry.field("OrderId");
	if (Number.isInteger(vOrderId)) {
		log("Processing point:" + pEntry.field("bookmarkId") + " with order id:" + vOrderId);
		var vOrderApi = new BitGanjOrder(this.server, this.timeshift);
		var vOrder = vOrderApi.getOrderEntryById(vOrderId);
		this.processOrder(vOrder);
	}
};

BitGanjLibraries.prototype.addFinOperation = function(vNewFinOperation) {
	var vFinCollection = this.currentLibrary.field('FinOps');
	vFinCollection.push(vNewFinOperation);
	this.currentLibrary.set('FinOps', vFinCollection);
};

BitGanjLibraries.prototype.createFinOperation = function() {
	var vUtil = new BitGanjUtils(this.server, null, this.timeshift);
	var vFinLib = vUtil.getLibByName("FinOperations");
	if (vFinLib !== false) {
		var vFinOperation = vFinLib.create(new Object({
			FinType: 'Debet',
			OperationType: 'Продажа'
		}));
		return vFinOperation;
	} else return false;
};