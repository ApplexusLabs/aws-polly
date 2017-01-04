var AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.region = 'us-west-2';

var polly = new AWS.Polly();


var param = {
    OutputFormat: "mp3",
    Text: "Let me tell you a story to chill the bones. About a thing that I saw. One night wandering in the everglades. I'd one drink but no more",
    VoiceId: "Brian",

}

polly.synthesizeSpeech(param, function(err,data){
    if (err) console.log(err,err.stack);
    else {
        //var base = data.AudioStream.toString('base64');
        //console.log(base);


        fs.writeFile('test.mp3',data.AudioStream, function(err){
             if(err) console.log(err);
         })
    }
})