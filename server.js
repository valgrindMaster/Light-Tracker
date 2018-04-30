let admin          = require('firebase-admin'),
    bodyParser     = require('body-parser'),
    serviceAccount = require('./iste-458-final-project-d0d5d9866456.json'),
    express        = require('express'),
    app            = express(),
    port           = process.env.PORT || 5000;

var Particle = require('particle-api-js');
var particle = new Particle();
var token;

app.set('views', __dirname);
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname));

app.listen(port);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://iste-458-final-project.firebaseio.com/'
});

app.get('/', function(req, res) {
  let db = admin.database()
  let ref = db.ref("zoo/lightreadings")
  var temp = []

  //Retrieve 10 most recent light readings.
  ref.limitToLast(10).on("value", function(readings) {
    if (readings.val() != null) {
      for (var key in readings.val()) {
        var obj = readings.val()[key]
        temp.push({
          "reading": obj.reading,
          "date_and_time": obj.date_and_time
        })
      }
    }
  })

  res.render('index', {"readings": temp})
})

app.post('/addreading', function(req, res) {
  var lightreading = JSON.parse(req.body.data)

  if (lightreading !== 'undefined') {
    let db = admin.database()
    let ref = db.ref("zoo/lightreadings")

    let currTime = new Date()

    ref.push().set({
      date_and_time: currTime.toISOString(),
      reading: lightreading
    })
  }

  res.end()
})

app.post('/setrange', function(req, res) {
  var rangelow = req.body.rangelow
  var rangehigh = req.body.rangehigh

  particle.login({username: 'olihaynes.dev@gmail.com', password: 'NationalMuseum3'}).then(
    function(data) {
      token = data.body.access_token
      var fnPr = particle.callFunction({
        deviceId: '330030001051363036373538',
        name: 'setrange',
        argument: rangelow + '|' + rangehigh,
        auth: token
      })

      fnPr.then(function(data) {
        console.log('Function called succesfully:', data);
      }, function(err) {
        console.log('An error occurred:', err);
      })

    }, function (err) {
      console.log('Could not log in.', err);
    }
  )

  res.redirect("/");
})
