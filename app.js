var request = require('request');
var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
app.use(cors());
var path = require('path');
var port = process.env.PORT || 8080;
var mongodb=require("mongodb")
var MongoClient = mongodb.MongoClient;
const mongoose = require('mongoose');
const searches = require('./models/searches');
var MongoClient = mongodb.MongoClient;

// this will need to be updated when I add the new document in mongo!!!!!
var MONGODB_URI ='mongodb://isaldbuser:isaldbuserpword@ds121015.mlab.com:21015/isal_history';

//tells it which port to listen to
//app.set('port', (process.env.PORT || 5000));
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

//tells it to start listening to that port
//app.listen(app.get('port'), function() {
//  console.log('The testSearchIAL app is running on port', app.get('port'));
//});

//if the user just hits the page, this returns the main page with instructions
app.get('/', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')) ) ;


app.get('/history', function(req, res) {
  MongoClient.connect(MONGODB_URI,function(err,db){
    if (err) {console.log('Unable to connect to the mongoDB server. Error:', err);}
    else{
      console.log('Connection established to', MONGODB_URI);
      db.collection("history").find({}).limit(10).toArray(function(err,docs){
                if(err){
                    db.close()
                    res.end('error reading db');
                } else {
                    db.close();
                  res.json(docs);
                }
             });
    }
  });
});

//if the user hits the page with '/<some search term>' appended to the url, then
//it connects to the the API, grabs the match, and returns it
app.get('/:search(*)', function(req, res) {
  var google = require('googleapis');
  var customsearch = google.customsearch('v1');

  var CX = '014100434178633792665:16dmn4fzm2c';
  var API_KEY = 'AIzaSyAA33Skfw5BoWFUOkW5ulTzXVrn4_I3vV4';
  var SEARCH = req.params[0];
  var START = 2;
  var responsearray = [];

  customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY, start: START }, function (err, resp) {
    if (err) {
      return console.log('An error occured', err);
    }
    //returns image URLs, alt text, page urls for a given search string
    if (resp.items && resp.items.length > 0) {
      var i = 0;
      while(i < 10)
      {
          var r0snippet = resp.items[i].snippet;
          var r0link = resp.items[i].link;
          var image0 = resp.items[i].pagemap.cse_image[0].src;
          var thumbnail0 = resp.items[i].pagemap.cse_thumbnail[0].src;
          responsearray.push('{snippet}: ' + r0snippet + ' {link}: ' + r0link + ' {image}: ' + image0 + ' {thumnail}: ' + thumbnail0);
          i = i+1;
      }

    MongoClient.connect(MONGODB_URI,function(err,db){
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', MONGODB_URI);
                db.collection("history").insertOne({"term":SEARCH});
              }
          });

        res.send(responsearray);
    }
  })
})
