"use strict";

var AWS = require("aws-sdk");
const uuidV4 = require("uuid/v4");
const songLibrary = require("./lyrics");
const phraseBook = require("./phrases");

const lang = "en";

AWS.config.region = "us-east-1";

var polly = new AWS.Polly();
var s3 = new AWS.S3();

exports.handler = (event, context, callback) => {

    var phrases = phraseBook.phrases.find(phrase => phrase.lang === lang);
    var lyrics = songLibrary.lyrics[Math.floor(Math.random() * (songLibrary.lyrics.length))];

    var now = new Date();

    var script = ""
        + "<speak>"
        + "<p>"
        + phrases.greeting
        + "</p>"
        + "<p>"
        + phrases.currentTimePrefix
        + "<say-as interpret-as='time'>"
        + now.getUTCHours() + ":" + ("00" + now.getUTCMinutes()).substr(-2, 2)
        + "</say-as>"
        + phrases.currentTimePostfix
        + "</p>";

    if (lyrics.song === "Never Gonna Give You Up"){
        script +=
            "<p>"
            + phrases.prank
            + "</p>";
    } else {
        script +=
            "<p>"
            + phrases.songTag
            + " '" + lyrics.song + "' "
            + phrases.albumTag
            + " '" + lyrics.album + "'."
            + "</p>";
    }

    script +=
        "<p>"
        + lyrics.lyric
        + "</p>"
        + "<break time='2s'/>"
        + phrases.outro
        + "</speak>";

    var pollyParams = {
        OutputFormat: "mp3",
        Text: script,
        VoiceId: phrases.voiceId,
        SampleRate: "16000",
        TextType: "ssml"
    };

    polly.synthesizeSpeech(pollyParams, function (err, data) {
        if (err) callback(err);
        else {

            const mp3Key = phrases.s3KeyPrefix + uuidV4() + ".mp3";

            var s3Params = {
                Bucket: phrases.s3Bucket,
                Key: mp3Key,
                ACL: "public-read",
                Body: data.AudioStream,
                ContentType: "audio/mpeg"
            };

            s3.putObject(s3Params, function (err) {
                if (err) callback(err);
                else {
                    var twilioInstruction = "https://s3.amazonaws.com/" + phrases.s3Bucket + "/" + mp3Key;
                    callback(null, { "response": twilioInstruction });
                }
            });
        }
    });
};
