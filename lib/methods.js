var METHODS = {};
METHODS.GET = function(callback,params){
	switch(params.length){
		case 1:
		$.get(params[0],{},function(response){
			if(callback){callback(true,response);}
		});
		break;
		case 2:
		$.get(params[0],params[1],function(response){
			if(callback){callback(true,response);}
		});
		break;
		case 3:
		$.get(params[0],params[1],function(response){
			if(params[2]){params[2](response);};
			if(callback){callback(true,response);}
		});
		break;
		case 4:
		$.get(params[0],params[1],function(response){
			if(params[2]){params[2](response);};
			if(callback){callback(true,response);}
		},params[3]);
		break;
	}
};

METHODS.POST = function(callback,params){
	switch(params.length){
		case 1:
		$.post(params[0],{},function(response){
			if(callback){callback(true,response);}
		});
		break;
		case 2:
		$.post(params[0],params[1],function(response){
			if(callback){callback(true,response);}
		});
		break;
		case 3:
		$.post(params[0],params[1],function(response){
			if(params[2]){params[2](response);};
			if(callback){callback(true,response);}
		});
		break;
		case 4:
		$.post(params[0],params[1],function(response){
			if(params[2]){params[2](response);};
			if(callback){callback(true,response);}
		},params[3]);
		break;
	}
};

METHODS.GETJSON = function(callback,params){
	switch(params.length){
		case 1:
		$.get(params[0],{},function(response){
			if(callback){callback(true,response);}
		},'JSON');
		case 2:
		$.get(params[0],params[1],function(response){
			if(callback){callback(true,response);}
		},'JSON');
		break;
		case 3:
		$.get(params[0],params[1],function(response){
			if(params[2]){params[2](response);};
			if(callback){callback(true,response);}
		},'JSON');
		break;
	}
};

METHODS.POSTJSON = function(callback,params){
	switch(params.length){
		case 1:
		$.post(params[0],{},function(response){
			if(callback){callback(true,response);}
		},'JSON');
		case 2:
		$.post(params[0],params[1],function(response){
			if(callback){callback(true,response);}
		},'JSON');
		break;
		case 3:
		$.post(params[0],params[1],function(response){
			if(params[2]){params[2](response);};
			if(callback){callback(true,response);}
		},'JSON');
		break;
	}
};

