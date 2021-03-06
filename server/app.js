var express = require('express');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var mongoose = require('mongoose');
var config = require('./config');

var grass = require('./routes/grass');
var sessions = require('./routes/sessions');
var users = require('./routes/users');
var gt = require('./plugins/gtalker')

var app = express();
var db = mongoose.connect(config.mongo.host);

app.configure(function(){
  app.set('port', process.env.PORT || 4532);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser(config.cookieSecret));
  app.use(express.session({
      secret: config.sessionSecret,
      cookie: {
          maxAge: null
      },
      store: new MongoStore({
          db: 'momy',
          collection: 'cookieSessions'})
  }));
  app.use(express.methodOverride());
  app.use(function(req,res,next){
    if(req.session.err) res.locals.err = req.session.err;
    if(req.session.msg) res.locals.msg = req.session.msg;
    delete req.session.err;
    delete req.session.msg;
    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.post('/saveLog', grass.saveLog);
app.post('/saveActiveLog', grass.saveActiveLog);

app.get('/logout', users.logout);
app.get('/login', users.loginForm);
app.post('/login', users.authenticate);

/* Restricted to user */
app.get('/', users.restrict, users.showDashboard);
app.get('/dashboard', users.restrict, users.showDashboard);
app.get('/system', 
        users.restrict, 
        sessions.loadSystem,
        sessions.showSystem);
app.get('/active', 
        users.restrict,
        sessions.loadActive,
        sessions.showActive);
app.get('/gtalker', 
        users.restrict,
        sessions.loadGtalker,
        sessions.showGtalker);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
