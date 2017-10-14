log=console.log;

var TARGET_PORT = process.env.PORT || 8080;

var express = require('express');
var http=require('http');

var app = express();

app.use('/res',express.static('res'));

app.get('/',(req,res)=>res.redirect('/offers'));

app.get('/offers',(req,res)=>res.sendFile(__dirname + '/index.html'));

var cacheData = true;

var supportedMethods = ['/api/v1/shops','/api/v1/offers','/api/v1/categories'];

supportedMethods.forEach((url)=>app.get(url,(cacheData?createCachingLoader:createLoader)(url)));

app.listen(TARGET_PORT,()=>{
	log(`app up on http://127.0.0.1:${TARGET_PORT}`);
});

function createLoader(url){
	return function(req,res){
		fetchFrom(url).then((maxiResponse)=>{
			maxiResponse.on('data', (chunk) => {
				res.write(chunk);
			});
		  	maxiResponse.on('end', () => {
			    res.end();
		  	});
		},(code)=>{
			res.status(code);
			res.end();
		});
	}
}

function createCachingLoader(url){
	var cache = fetchFrom(url).then((maxiResponse)=>{
		return new Promise((resolve,reject)=>{
			var chunks = [];
			maxiResponse.on('data', (chunk) => {
				chunks.push(chunk);
			});
		  	maxiResponse.on('end', () => {
			    resolve(Buffer.concat(chunks));
		  	});
		});
	});
	return function(req,res){
		cache.then((data)=>{
			res.end(data)
		},(code)=>{
			res.status(code);
			res.end();
		});
	}
}

function fetchFrom(url){
	return new Promise((resolve,reject)=>{
		http.get('http://maxi.today'+url,(maxiResponse)=>{
			if(maxiResponse.statusCode!==200){
				reject(maxiResponse.statusCode);
			}else{
				resolve(maxiResponse);
			}
		});
	});	
}
