const option = require('./token.js');
const twit = require('twit');
const client = new twit(option.twitter);
var exec = require('child_process').exec;
let muteList = [];
let que = [];
let playNow = false;
exec('C:/Users/ok/Desktop/stn019320/softalk/SofTalk.exe /close');

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
  text = text.replace(/https:\/\/t.co\/.+/, 'リンク ');
  text = text.replace(/RT @(.+?)\s/, 'RT  ');
  if(tweet.in_reply_to_screen_name != null){
    const user = await client.get('users/lookup', {screen_name: tweet.in_reply_to_screen_name});
    text = text.replace(/@(.+?)\s/, 'あっと' + user.data[0].name + ' ');
  }
  console.log(text);

  que.push(text);
  playTweet();
});

const playTweet = () => {
  //if(playNow)return;
  let text = que.shift();
  const speed = 120;//Math.min(300, 100 + 10 * que.length + text.length);
  playNow = true;
  exec('C:/Users/ok/Desktop/stn019320/softalk/SofTalk.exe /X:1 /S:' + speed +' /W:' + text, () => {
    playNow = false;
  });
  if(que.length > 0){
    playTweet();
  }
}
