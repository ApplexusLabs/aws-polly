var AWS = require('aws-sdk');
const uuidV4 = require('uuid/v4');
const songLibrary = require('./lyrics');

AWS.config.region = 'us-east-1';

var polly = new AWS.Polly();
var s3 = new AWS.S3();

exports.handler = (event, context, callback) => {

    var now = new Date();

    var index = Math.floor(Math.random() * (songLibrary.lyrics.length))
    var currentTime = now.getUTCHours().toString() + ":" + ("00" + now.getUTCMinutes()).substr(-2, 2);

    var greeting = "<p>Yeah boy ease. Its the Public Enemy, lyric line.</p>"
    var sayTime = "<p>The current time is <say-as interpret-as='time'>" + currentTime + "</say-as>coordinated universal time.</p>";
    var outro = "<p><break time='2s'/>We hope you have enjoyed these words of wisdom.  Thank you and good day.<break time='3s'/>  I said<break strength='weak'/>good day!</p>"

    var script = "<speak>" + greeting + sayTime + songLibrary.lyrics[index].intro + songLibrary.lyrics[index].lyric + outro + "</speak>";

    var pollyParams = {
        OutputFormat: 'mp3',
        Text: script,
        VoiceId: 'Brian',
        SampleRate: "16000",
        TextType: 'ssml'
    };

    polly.synthesizeSpeech(pollyParams, function (err, data) {
        if (err) callback(err);
        else {

            const mp3Key = "polly/" + uuidV4() + ".mp3";

            var s3Params = {
                Bucket: "aplx.us",
                Key: mp3Key,
                //  Key : "polly/test.mp3",
                ACL: "public-read",
                Body: data.AudioStream,
                ContentType: "audio/mpeg"
            };

            s3.putObject(s3Params, function (err, data) {
                if (err) callback(err);
                else {
                    var twilioInstruction = "https://s3.amazonaws.com/aplx.us/" + mp3Key;
                    callback(null, { "response": twilioInstruction });
                }
            })
        }
    });
};