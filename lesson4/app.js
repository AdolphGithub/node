/// <reference path="/var/www/NodeSnippet/typings/index.d.ts" />
const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
const EventProxy = require('eventproxy');

var app = express();
var proxy = new EventProxy();

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
            href = [href[0]];
            // 得到所有的第一个评论
            proxy.after('topic_html',href.length,(topics)=>{
                topics = topics.map((topic)=>{
                    var els = cheerio.load(topic[1]);
                    return {
                        'title':els('title').text(),
                        'url':topic[0],
                        'comments':els('.cell p').eq(0).text(),
                        'user_url':base_url + els('.cell .user_avatar').eq(0).attr('href')
                    };
                });
                topics.map((topic)=>{
                    superagent.get(topic.user_url).end((err,result)=>{
                        var html = cheerio.load(result.text);
                        topic.user_name = html('.userinfo .user_avatar').attr('title');
                        topic.user_score = html('.unstyled .big').text();
                        topic.user_logo = html('.');
                        proxy.emit('user_info',topic);
                    });
                });
            });

            href.forEach((topicUrl)=>{
                superagent.get(topicUrl).end((err,result)=>{
                    if(err){
                        next(err);
                    }else{
                        proxy.emit('topic_html',[topicUrl,result.text]);
                    }
                });
            });
            
            // 注册事件.
            proxy.after('user_info',href.length,(topics)=>{
                response.send(topics);
                // console.dir(topics);
            });
        }
    });
});

var server = app.listen(3000,()=>{
    var address = server.address().address;
    var port = server.address().port;

    console.dir(`express run ${address}:${port}`);
});