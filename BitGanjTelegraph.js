/* global http, moment */
function BitGanjTelegraph(v_access_token,v_author_name, v_author_url) {
    this.access_token = v_access_token;
    this.author_name =  typeof v_author_name !== "undefined" ? v_author_name : "god Jah";
    this.author_url = typeof v_author_url !== "undefined" ? v_author_url : "https://t.me/godjah";
}


BitGanjTelegraph.prototype.JSON2Form = function(pJSON)
{
  var res = 'title='+encodeURIComponent(pJSON.title);
  res+='&author_name='+encodeURIComponent(pJSON.author_name);
  res+='&author_url='+encodeURIComponent(pJSON.author_url);
  res+='&content='+encodeURIComponent(pJSON.content);
  res+='&return_content=true';
  return res;
};

BitGanjTelegraph.prototype.createPage = function (pBody) {
  var res = false;
  var httpReq=http();
  var vURI = "https://api.telegra.ph/createPage?access_token="+this.access_token;
  log("Request URI:"+vURI);
  log("Request body:"+pBody);
  httpReq.headers({"Content-Type": "application/x-www-form-urlencoded"}); 
  var vResult = httpReq.post(vURI,pBody);
  log("Result code:" + vResult.code + " with body:" + vResult.body);
  if (vResult.code === 200) {
      res = JSON.parse(vResult.body);
  } else {
      log ("ServerError:" + vResult.code);
  }
  return res;  
};

BitGanjTelegraph.prototype.preparePage = function(pEntry) {
  var vCe = typeof pEntry !== "undefined" ? pEntry : entry();
  var res = false;
  var vTitle = vCe.field("ContentInfo");
  var vContent = '[{"tag":"p","attrs":{},"children":[{"tag":"br","attrs":{},"children":[]}]},{"tag":"figure","attrs":{},"children":[{"tag":"img","attrs":{"src":"https://telegra.ph/file/2ff9ee4b8b9c9218ca074.jpg"},"children":[]},{"tag":"figcaption","attrs":{},"children":[]}]}]';
  var vBody = { title: vTitle,
          author_name: this.author_name, 
          author_url : this.author_url,
          content: vContent,
          return_content:true };
  res = JSON.stringify(vBody);
  return res;
};

BitGanjTelegraph.prototype.domToNode = function(domNode) {
  if (domNode.nodeType == domNode.TEXT_NODE) {
    return domNode.data;
  }
  if (domNode.nodeType != domNode.ELEMENT_NODE) {
    return false;
  }
  var nodeElement = {};
  nodeElement.tag = domNode.tagName.toLowerCase();
  for (var i = 0; i < domNode.attributes.length; i++) {
    var attr = domNode.attributes[i];
    if (attr.name == 'href' || attr.name == 'src') {
      if (!nodeElement.attrs) {
        nodeElement.attrs = {};
      }
      nodeElement.attrs[attr.name] = attr.value;
    }
  }
  if (domNode.childNodes.length > 0) {
    nodeElement.children = [];
    for (var u = 0; u < domNode.childNodes.length; u++) {
      var child = domNode.childNodes[u];
      nodeElement.children.push(domToNode(child));
    }
  }
  return nodeElement;
};

BitGanjTelegraph.prototype.nodeToDom = function(node) {
  if (typeof node === 'string' || node instanceof String) {
    return document.createTextNode(node);
  }
  var domNode;
  if (node.tag) {
    domNode = document.createElement(node.tag);
    if (node.attrs) {
      for (var name in node.attrs) {
        var value = node.attrs[name];
        domNode.setAttribute(name, value);
      }
    }
  } else {
    domNode = document.createDocumentFragment();
  }
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      domNode.appendChild(nodeToDom(child));
    }
  }
  return domNode;
};