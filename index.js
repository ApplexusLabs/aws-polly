var AWS = require('aws-sdk');
const uuidV4 = require('uuid/v4');
const songLibrary = require('./lyrics');

AWS.config.region = 'us-east-1';

var polly = new AWS.Polly();
var s3 = new AWS.S3();

exports.handler = (event, context, callback) => {



var now = new Date();


var index = Math.floor(Math.random() * (songLibrary.lyrics.length + 1))  
var currentTime = now.getUTCHours().toString() + ":" + ("00" + now.getUTCMinutes()).substr(-2,2);


var sayTime = "<p>The current time is <say-as interpret-as='time'>" + currentTime + "</say-as>universal coordinated time.</p>";

var greeting = "<p>Yeah boy ease. Its the Public Enemy, lyric line.</p>"

console.log(currentTime, index);

var script = "<speak>" + greeting + sayTime + songLibrary.lyrics[index].intro + songLibrary.lyrics[index].lyric + "</speak>";


    var pollyParams = {
        OutputFormat: 'mp3',
        Text: script,
        VoiceId: 'Brian',
        TextType: 'ssml'
    };

    polly.synthesizeSpeech(pollyParams, function(err,data){
        if (err) callback(err);
        else {

            const mp3Key = "polly/" + uuidV4() + ".mp3";

            var s3Params = {
                Bucket : "aplx.us",
                Key : mp3Key,
              //  Key : "polly/test.mp3",
                ACL: "public-read",
                Body : data.AudioStream,
                ContentType : "audio/mpeg"
            };
            
            s3.putObject(s3Params, function(err,data){
                if (err) callback(err);
                else callback(null,data);
            })
        }
    });
};