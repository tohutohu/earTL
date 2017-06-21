const option = require('./token.js');
const twit = require('twit');
const client = new twit(option.twitter);
const voicetext = require('voicetext');
const voice = new voicetext('m9ookekw25z6v9d0');
const wav = require('wav');
const node_stream = require('stream');

let muteList = [];
let que = [];
let playNow = false;
var Speaker = require('speaker');

const voices = []
voices[0] = voice.SPEAKER.HARUKA;
voices[1] = voice.SPEAKER.HIKARI;
voices[2] = voice.SPEAKER.SHOW;
voices[3] = voice.SPEAKER.TAKERU;
voices[4] = voice.SPEAKER.SANTA;
voices[5] = voice.SPEAKER.BEAR;
const emotions = [];
emotions[0] = voice.EMOTION.HAPPINESS;
emotions[1] = voice.EMOTION.ANGER;
emotions[2] = voice.EMOTION.SADNESS;


const stream = client.stream('user');
client.get('mutes/users/list',{skip_status:true,include_entities:false},function(err,mutes,res){
  muteList = mutes.users.map(user => user.screen_name);
});

stream.on('tweet',async tweet => {
  if(muteList.indexOf(tweet.user.screen_name) !== -1){
    console.log('mute');
    return;
  }
  let text = tweet.user.name.replace(/@.+|\(|\)/g, '') + '    ' +tweet.text.replace(/\(|\)/g, '').replace(/\n/g, ' ');
  text = text.replace(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/g, 'リンク ');
  text = text.replace(/RT @(.+?)\s/, 'りついーと  ');
  if(tweet.in_reply_to_screen_name != null){
    const user = await client.get('users/lookup', {screen_name: tweet.in_reply_to_screen_name});
    text = text.replace(/@(.+?)\s/, 'あっと' + user.data[0].name + ' ');
  }
  console.log(text);

  voice.speaker(voices[Math.floor(Math.random()*voices.length)]).speed(100 + que.length*5).speak(text+' 。', (err, buf) => {
    if(err)console.log(err)
    que.push(buf);
    playTweet();
  });
});

const playTweet = () => {
  if(playNow)return;
  let buf = que.shift();
  var reader = new wav.Reader();
  reader.on('format', function (format) {
    const po = new Speaker(format);
    po.on('close', () => {
      playNow = false;
      if(que.length > 0){
        playTweet();
      }
    })
    reader.pipe(po);
  });
  const bufferStream = new node_stream.PassThrough();
  bufferStream.end(buf);
  playNow = true;
  bufferStream.pipe(reader);
}
