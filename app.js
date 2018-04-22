let express = require('express')
let selfSignedHttps = require('self-signed-https')
let logger = require('morgan');
let bodyParser = require('body-parser');

let app = express();

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

selfSignedHttps(app).listen(443, '0.0.0.0')
