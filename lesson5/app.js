const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const eventProxy = require('eventproxy');
const async = require('async');

var app = express();
var base_url = 'https://cnodejs.org';
// 开始抓取cnodejs的首页.
app.get('/',(request,response,next) => {
    // 抓取首页界面.
    superagent.get(base_url).end((err,result) =>{
        if(err){
            next(err);
        }else{
            var $ = cheerio.load(result.text);
            var hrefs = [];
            $('#topic_list .topic_title').map((index,item) => {
                hrefs.push(base_url + $(item).attr('href'));
            });
            // 这里要控制并发
            // response.send(hrefs);
            var data = [];
            async.mapLimit(hrefs,5,(url,callback) => {
                superagent.get(url).end((err,result) => {
                    console.dir(url);
                    var html = cheerio.load(result.text);
                    callback(null,{
                        'url':url,
                        'title':html('title').text(),
                        'comment':html('.panel .reply_content').eq(0).find('p').text()
                    });
                });
            },(err,results) => {
                response.send(results);
                next();
            });
        }
    });
});



var server = app.listen(3000,() => {
    var address = server.address().address;
    var port    = server.address().port;
    console.dir(`express run ${address}:${port}`);
});