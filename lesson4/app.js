/// <reference path="/var/www/NodeSnippet/typings/index.d.ts" />
const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
const EventProxy = require('eventproxy');

var app = express();
var events = new EventProxy();

app.get('/',(request,response,next)=>{
    var base_url = 'https://cnodejs.org';
    superagent.get(base_url).end((err,result)=>{
        if(err){
            next(err);
        }else{
            var $ = cheerio.load(result.text);
            var href = [];
            // 得到所有的href属性.
            $('#topic_list .topic_title').map((index,element)=>{
                href.push(base_url+$(element).attr('href'));
            });
            // 得到所有的第一个评论
            events.after('topic_html',href.length,(topics)=>{
                topics = topics.map((topic)=>{
                    var els = cheerio.io(topics[1]);
                    return {
                        'title':els('title').text(),
                        'url':topic[0],
                        'comments':eles('.cell p').eq(0).text(),
                        'user_url':base_url + eles('.cell .user_avatar').eq(0).attr('href')
                    };
                });
                topics.map((topic)=>{
                    superagent.get(topic.user_url).end((err,result)=>{
                        topic.user_logo = html('.userinfo .dark').text();
                        topic.user_score = html('.userinfo .big').text();
                        events.emit('user_info',topic);
                    });
                });
            });

            href.forEach((topicUrl)=>{
                superagent.get(topicUrl).end((err,result)=>{
                    events.emit('topic_html',[topicUrl,result.text]);
                });
            });
            // 注册事件.
            events.after('user_info',href.length,(topics)=>{
                response.send(topics);
            });
        }
    });
});

var server = app.listen(3000,()=>{
    var address = server.address().address;
    var port = server.address().port;

    console.dir(`express run ${address}:${port}`);
});