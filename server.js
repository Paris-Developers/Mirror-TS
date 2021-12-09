var http = require("http");

http.createServer(function(request,response){
    response.writeHead(200,{"Content-Type" : "text/plain"});
    response.write("hello stupid spotify server");
    response.end();
}).listen(8888);

