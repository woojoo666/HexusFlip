let express = require('express')
let selfSignedHttps = require('self-signed-https')
let logger = require('morgan');
let bodyParser = require('body-parser');

let app = express();
let server = selfSignedHttps(app);
let io = require('socket.io')(server);

// view engine setup
app.set('views', './');
app.set('view engine', 'pug');

// logger setup
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('/'));

app.get('/', (req, res) => {
	res.render('index', { title: 'Camera Web App' });
});

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});

server.listen(443, '0.0.0.0')
