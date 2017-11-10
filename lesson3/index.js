const express = require('express');

var app = express();

var superagent = require('superagent');

var cheerio = require('cheerio');

app.get('/',(request,response,next)=>{
    superagent.get('https://cnodejs.org/')
        .end((err,result)=>{
            if(err){
                return next(err);
            }else{
                var $ = cheerio.load(result.text);
                var item = [];
                $('#topic .topic_title').map((index,element) => {
                    item.push({
                        'title':$(element).attr('title'),
                        'href':$(element).attr('href')
                    });
                });
                response.send(item);
            }
    });
});



var server = app.listen(3000,() => {
    var address = server.address().address;
    var port = server.address().port;

    console.dir(`express run ${address}:${port}`);
});