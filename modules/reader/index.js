var path = require("path"), fs = require("fs");

function sendError(res,msg,st){
  res.writeHead(st, {"Content-Type": "application/json"});
  res.write('{"error":"'+msg+'."}');
  res.end();
}

function func(req, res) {

  var filePath = req.query.filePath;
  if(typeof filePath !== 'string' || !filePath.length){
    return sendError(res,'`filePath` is a required query parameter', 400);
  }

  fs.stat(filePath, function(err, stats) {
    if(err) {
      if(err.code === "ENOENT"){
        return sendError(res, "File Not Found", 404);
      }
      return sendError(res, err.message || err, 400);
    }

    if (!(stats.isFile())) {
      return sendError(res,"The path is a directory. Please provide a path of file", 400);
    }

    fs.readFile(filePath, function(err, file) {
      if(err) {
        return sendError(res, err.message || err, 501);
      }

      var contentType = String(req.query.contentType);
      if(!contentType){
        if(filePath.endsWith('json')){
          contentType = "application/json";
          
        } else if(filePath.endsWith('xml')){
          contentType = "application/xml";
        } else {
          contentType = "application/octet-stream";
        }
      }

      res.writeHead(200, { "Content-Type":  contentType});
      res.write(file);
      res.end();
    });
  });
}

module.exports = func;
