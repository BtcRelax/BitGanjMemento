# scripts
Authors: godJah, azazello, bitmdma

Define object for communicate from libraries into MementoDatabase to BtcRelax system.

Main documentation : http://wiki.mementodatabase.com/index.php/Memento_JavaScript_Library

For Library:
--------- [S]Customers - set next actions:
Trigger after update:
updateCustomerBanState('shop.fastfen.club');

 -------- [S]Products ---------- 
Add Entry action: SetProductState()
For refresh item state: GetProductState()
For refresh all library: SyncProducts()
Add trigger after open: GetProductState()

[P]Producs - Library with products.
			Entry action: Register
				SetProductState('fastfen.club');

MyDeals  -	Library action:
				RefreshLibraries('fastfen.club',0);
			Entry action:
				RefreshLibrary('fastfen.club',entry(),0);
				OpenLibrary('fastfen.club',entry());

RefreshLibrary - method, to collect info about actual library.

[S]Points - Library action: 
            SyncLybrary();
            Entry action: SetState();
            Trigger, after open: GetState();
            Trigger, after update: UpdatePoint();

Customers - Library action:
			Entry action: RefreshCustomer('fastfen.club',entry());
			

