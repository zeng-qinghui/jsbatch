var METHODS = {};
METHODS.GET = function(callback,params){
	$.get(params[0],params[1],function(response){
		if(callback){callback(true,response);}
	});
};

METHODS.POST = function(callback,params){
	$.post(params[0],params[1],function(response){
		if(callback){callback(true,response);}
	});
};

METHODS.GETJSON = function(callback,params){
	$.get(params[0],params[1],function(response){
		if(callback){callback(true,response);}
	},'JSON');
};

METHODS.POSTJSON = function(callback,params){
	$.post(params[0],params[1],function(response){
		if(callback){callback(true,response);}
	},'JSON');
};

