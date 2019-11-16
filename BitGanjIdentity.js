/* global http, moment */
function BitGanjIdentity(v_server, v_timeShift) {
    this.server = v_server !== undefined ? v_server : 'test.bitganj.website';
    this.identityLibs = ["[S]Identity"];
    this.timeshift = Number.isInteger(v_timeShift) ? v_timeShift: 7;
  }

BitGanjIdentity.prototype.updateIdentityInfoById = function (vType,vId) {
      var vIdentityEntry = this.getCustomerEntryById(vId);
      this.refreshCustomerEntry(vCustomerEntry);
  }

BitGanjIdentity.prototype.getIdentityLib = function()
  {
    var res = false;
    var count =this.identityLibs.length;
    for (i=0;i<count;i++)
    {
      var cLib = libByName(this.identityLibs[i]);
      if (cLib !== null) { 
        res = cLib;
        break;
      }
    }
    return res;
  }
  
  BitGanjIdentity.prototype.getIdentityEntryById = function(pIdent)
  {
    var vResult = false;
    var vIdentTitle = pIdent.IdentType +  ': ' + pIdent.IdentKey;
    log('Try to find identity type: ' + vIdentTitle );
    var vO  = this.getIdentityLib();
        if (vO) {
    	   var vIdent = vO.find(vIdentTitle);
    	      switch (vIdent.length) {
                case 0:
                     var newIdentity;
                     switch (pIdent.IdentType) {
                            case 'BitId':
                                newIdentity = new Object({Type:pIdent.IdentType,PublicKey:pIdent.IdentKey }); 
                                break;
                            case 'EmailId':
                                newIdentity = new Object({Type:pIdent.IdentType,Email:pIdent.IdentKey }); 
                                break;
                            case 'TelegramId':
                                newIdentity = new Object({Type:pIdent.IdentType,TelegramId:pIdent.IdentKey}); 
                                break;
                            default:
                                message("Try to create unknown Identity type: " + pIdent.IdentType);   
                                return vResult;
                                break; 
                        }
                    vResult = vO.create(newIdentity);
                    log('Identity entry created!');
                    vResult.recalc();
                    break;
                case 1:
                    vResult = vIdent[0];
                    log('Identity entry founded!');
                    break;
                default:
                    message("В библиотеке [S]Identity нарушение уникальности данных!");   
                    break;
    		}
    } else { message("У Вас, не скачанна библиотека [S]Identity!"); };        
    return vResult;
  } 


