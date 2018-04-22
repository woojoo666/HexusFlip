let express = require('express')
let selfSignedHttps = require('self-signed-https')
let logger = require('morgan');
let bodyParser = require('body-parser');
let fs = require('fs');
let vision = require('./vision.js');
let totems = require('./totems.js');

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

const spells_namespace = '/spells';

var lastPosition; // used for moving totems

io.of(index_namespace).on('connection', function (socket) {
	console.log('index connected!!!');
	socket.on('cameraDevices', function (data) {
		console.log(data);
	});
	socket.on('captured', function (blob) {
		fs.writeFileSync('image.jpg', new Buffer(blob, 'base64'));
		var cameraPose = vision.estimateCameraPose('image.jpg');
		//console.log(cameraPose);
		lastPosition = cameraPose.center;
		var activeTotem = totems.getActiveTotem(cameraPose);
		socket.emit('activeTotem', activeTotem);
		io.of(visualizer_namespace).emit('cameraPose', { cameraPose, activeTotem });
	});
	socket.on('initiateCommand', function (data) {
		console.log(data);
		io.of(spells_namespace).emit('command', data);
	});
	socket.on('movedTotem', function (moved) {
		totem = totems.totems.filter(t => t.target == moved.target)[0];
		totem.x = lastPosition.x;
		totem.y = lastPosition.y;
		console.log("moved " + totem.target + " to " + totem.x + ", " + totem.y);
		io.of(visualizer_namespace).emit('totems', totems.totems);
	})
});

io.of(visualizer_namespace).on('connection', function (socket) {
	console.log('visualizer connected!!!');
	socket.emit('totems', totems.totems);
	socket.on('visualizer-ready', function () {
		io.of(index_namespace).emit('takeCapture');
	});
});

io.of(spells_namespace).on('connection', function (socket) {
	console.log('spells connected!!!');
});

server.listen(443, '0.0.0.0')
