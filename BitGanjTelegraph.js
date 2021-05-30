function BitGanjTelegraph(v_access_token,v_author_name, v_author_url) {
    this.access_token = v_access_token;
    this.author_name =  v_author_name !== undefined ? v_author_name : "god Jah";
    this.author_url = v_author_url !== undefined ? v_author_url : "https://t.me/godjah";
}


BitGanjTelegraph.prototype.createPage = function (pEntry) {
    var vCe = pEntry !== undefined ? pEntry : entry();
    var res = false;
    var vTitle = vCe.field("title");
    var vContent = '[{"tag":"p","children":["Hello, world!"]}]';
    var params = 'title='+encodeURIComponent(vTitle)+'&author_name='+encodeURIComponent(this.author_name)+'&author_url='+encodeURIComponent(this.author_url)+'&content=';
    var vURI = "https://api.telegra.ph/createPage?access_token="+access_token;
    var vBody = params+encodeURIComponent(vContent);
    log (vBody);
    var vResult = http().post(vURI,vBody);
    log("Result code:" + vResult.code + " with body:" + vResult.body);
    if (vResult.code === 200) {
        var json = JSON.parse(vResult.body);             
       if (json.ok === true) 
       {    
           res = json.result;
       } else { 
           message("Error"+json.result); }
    };
    return res;
  };