var express = require('express');
var router = express.Router();
const cheerio = require('cheerio');
var Crawler = require('crawler');
var mysql = require('./database');
var array = [];

/* GET home page. */
router.get('/', function (req, res, next) {
  var c = new Crawler({
    maxConnections: 5,
    callback: function (error, res, done) {
      if (error) {
        console.log(error);
      } else {
        $ = cheerio.load(JSON.stringify(res));
        links = $('a'); //jquery get all hyperlinks
        $(links).each(function (i, link) {
          var urls = link.attribs.href;
          var hyperlinks = urls.slice(2, urls.length);
          var testing = hyperlinks.split('?')[0];
          array.push(testing);
        });
        console.log(array);
        var sql = 'select * from hyperlinks';
        mysql.query(sql, function (error, results, fields) {
          if (error) throw error;
          var largest = Math.max(results.length,array.length);
          for (var p = 0; p<largest; p++){
            if(results[p]){
              var intersection = array.filter(element => results[p].urls.includes(element));
              var notintersected = array.filter(hello => !results[p].urls.includes(hello));
              if (intersection) {
                for (var j = 0; j < intersection.length; j++) {
                  var primarykey = results[j].hyperlinksId;
                  var updateQuery = `UPDATE hyperlinks SET reference_count = (${results[j].reference_count + intersection.length}) where hyperlinksId = (${primarykey});`
                  mysql.query(updateQuery, function (error, results, fields) {
                    if (error) throw error;
                    console.log('Successfully Updated');
                    return;
                  })
                }
              }
              if (notintersected) {
                for(var k =0; k < notintersected.length; k++){
                  var insertQuery = `Insert into hyperlinks (urls) values ("${notintersected[k]}")`
                  mysql.query(insertQuery, function(err) {
                  if (err) throw err;
                  console.log('SuccessFully inserted')
                  return;
              });
              }
            }
            }
            else {
              var intersection = array[p];
              // var notintersected = array.filter(hello => !results[p].urls.includes(hello));
              if (intersection) {
                for(var k =0; k < intersection.length; k++){
                  var insertQuery = `Insert into hyperlinks (urls) values ("${intersection}")`
                  mysql.query(insertQuery, function(err) {
                  if (err) throw err;
                  console.log('SuccessFully inserted')
                  return;
                  })
                }
              }
            
              console.log('Not found');
