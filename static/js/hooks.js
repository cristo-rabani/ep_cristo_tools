
exports.aceEditorCSS = function(){
  return ['ep_cristo_tools/static/font-awesome/css/font-awesome.min.css'];
};

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + "\n<link href='/static/plugins/ep_cristo_tools/static/font-awesome/css/font-awesome.min.css' rel='stylesheet'>";
  args.content = args.content + "\n<link href='/static/plugins/ep_cristo_tools/static/css/cristo.css' rel='stylesheet'>";

  return cb();
};

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  var eejs = require("ep_etherpad-lite/node/eejs");
  args.content = eejs.require("ep_cristo_tools/templates/clientsScript.ejs", {}, module) + args.content;
  return cb();
};

exports.aceInitialized = function(hook, context){
    Cristo.documentAttributeManager = context.documentAttributeManager;
    Cristo.rep = context.rep;
    Cristo.editorInfo = context.editorInfo;
};

