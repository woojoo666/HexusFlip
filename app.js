let express = require('express')
let selfSignedHttps = require('self-signed-https')
let logger = require('morgan');
let bodyParser = require('body-parser');
let fs = require('fs');
let vision = require('./vision.js');

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

app.get('/visualizer', (req, res) => {
	res.render('visualizer', { title: 'Camera Pose Visualizer' });
});

const index_namespace = '/index';
const visualizer_namespace = '/visualizer';

io.of(index_namespace).on('connection', function (socket) {
	console.log('index connected!!!');
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
	socket.on('cameraDevices', function (data) {
		console.log(data);
	});
	socket.on('captured', function (blob) {
		fs.writeFileSync('image.jpg', new Buffer(blob, 'base64'));
		// var cameraPose = vision.estimateCameraPose('image.jpg');
		// console.log(cameraPose);
		// io.emit('cameraPose', cameraPose);
	});
});

io.of(visualizer_namespace).on('connection', function (socket) {
	console.log('visualizer connected!!!');
	socket.on('visualizer-ready', function () {
		io.of(index_namespace).emit('takeCapture');
	});
})

server.listen(443, '0.0.0.0')
