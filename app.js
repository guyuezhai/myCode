
const Koa = require('koa');
let bodyParser = require('koa-bodyparser');

const config = require('./config');

//const index = require('./routes/index');
const sign = require('./routes/sign');



let app = new Koa();

app.use(bodyParser({
	jsonLimit: '1mb',
    formLimit: '1mb'
}));

//app.use( index.routes(), index.allowedMethods() );
app.use( sign.routes(), sign.allowedMethods() );


let port = config.port;

app.listen(port,function(){
    console.log('Service is running on port ' + port);
});
