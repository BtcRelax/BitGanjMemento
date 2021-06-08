function BitGanjTelegraph(v_access_token,v_author_name, v_author_url) {
    this.access_token = v_access_token;
    this.author_name =  v_author_name !== undefined ? v_author_name : "god Jah";
    this.author_url = v_author_url !== undefined ? v_author_url : "https://t.me/godjah";
}


BitGanjTelegraph.prototype.createPage = function (pEntry, pTitle) {
    var vCe = pEntry !== undefined ? pEntry : entry();
    var res = false;
    var vTitle = pTitle !== undefined ? pTitle : vCe.field("ContentInfo");
    var vContent = '[{"tag":"p","attrs":{},"children":[{"tag":"br","attrs":{},"children":[]}]},{"tag":"figure","attrs":{},"children":[{"tag":"img","attrs":{"src":"https://telegra.ph/file/2ff9ee4b8b9c9218ca074.jpg"},"children":[]},{"tag":"figcaption","attrs":{},"children":[]}]}]';
    var params = 'title='+vTitle+'&author_name='+this.author_name+'&author_url='+this.author_url+'&content='+vContent;
    var vURI = "https://api.telegra.ph/createPage?access_token="+access_token;
    log (params);
    var vBody = encodeURIComponent(params);
    log (vBody);
    var vResult = http().post(vURI,vBody);
    log("Result code:" + vResult.code + " with body:" + vResult.body);
      if (vResult.code === 200) {
          var json = JSON.parse(vResult.body);
          res = true;
      } else {
          log ("ServerError:" + vResult.code);
      };
    return res;  
}