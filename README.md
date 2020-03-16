# Scripts for Momento Database

Authors: godJah, azazello, bitmdma

Define object for communicate from libraries into MementoDatabase to BtcRelax system.

Main Memento documentation : http://wiki.mementodatabase.com/index.php/Memento_JavaScript_Library

Ниже, описания тех событий что могут происходить у нас в Momento. И что бы не получалось что каждый описал понятно для себя, но остальным это не ясно. Мы это место формализуем. А т.е. формат описания должен быть следующий.

---------------------------------------------
[Название библиотеки] - [краткое её описание]

	[1]:[2]
	
	  [3]
	 
Где:
1. Название события в Momento на которое будет наложен скрипт. События у нас бывают, по библиотеке (Library actions) и по текущей записи (Entry action), и триггеры, как то: в момент открытия библиотеки, в момент ДО редактирования записи, или ПОСЛЕ т.е. при попытке сохранения. А т.е. все виды триггеров что есть описанны тут: https://wiki.mementodatabase.com/index.php/Trigger_Examples

2. Название комманды, что мы хотим добавить.
3. Содержимое, что надо вставить по данному событию в поле скриптов в моменто.

---------------------------------------------
## For Library:

1. Orders - Library for manipulate with order entries, such as refresh, or cancel order. 
+ Entry action: Refresh 
	
		RefreshOrder('fastfen.club');
	

2. Points - Library for manipulate with points entries, such as refresh, or set new point state, or get info about customer.
+ Entry action: SetState 

	[Argumet:NewState]: /Lists/NewState.items.csv "Argumet: NewState"
	[Argumet:NewState]

		SetState('fastfen.club');
		

+ Entry action: Refresh

		GetState('fastfen.club');

3.  Invoices - Library for manipulate with invoices, such as check ballance, cancel, or apply discount.

    List item one continued with a second paragraph followed by an
    Indented block.

        $ ls *.sh
        $ mv *.sh ~/tmp

    List item continued with a third paragraph.

