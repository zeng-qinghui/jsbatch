var RUNTIME = new function(){
	var monitor = null;
	var taskList = [];
	var taskIndex = 0;
	var isRunning = false;
	var storage = {};
	
	var valueDecode = function(value, key){
		var rVal = {};
		var keys = key.split('.');
		var lastKey = keys.pop().split(':');
		keys.push(lastKey.pop());
		
		var subValue = value;
		for(var i = 0;i<keys.length;i++){
			subValue = subValue[keys[i]];
			rVal.key = keys[i];
		}
		
		if(lastKey.length){
			if(subValue instanceof Array){
				subValue = subValue[lastKey[0]];
				rVal.key = lastKey[0];
			}else if(typeof subValue == 'object'){
				var index = 0;
				for(var tmpKey in subValue){
					if(index == lastKey[0]){
						subValue = subValue[tmpKey];
						rVal.key = tmpKey;
						break;
					}
				}
			}
		}
		
		rVal.value = subValue;
		return rVal;
	};
	
	var applyStorage = function(data){
		for(var i in data){
			if(typeof data[i] == 'object'){
				data[i] =  applyStorage(data[i]);
			}else if(typeof data[i] == 'string'){
				data[i] = data[i].replace(/\{\$storage\.([^}]+)\}/g,function(){
					return valueDecode(storage,arguments[1]).value;
				});
			}
		}
		return data;
	};
	
	var fn = {
		run:function(){
			if(isRunning){
				LOG.append(false,'RUNTIME',"I'm not dead please wait.");
				return;
			}
			monitor.find('li').removeClass('running');
			if(taskList[taskIndex]){
				if(monitor){
					monitor.find('li:eq(' + taskIndex + ')').addClass('running');
				}
				isRunning = true;
				var realParams = taskList[taskIndex].params?JSON.parse(taskList[taskIndex].params):null;
				realParams = applyStorage(realParams);
				
				taskList[taskIndex].method(
					function(code,response){
						isRunning = false;
						if(code){
							var test = taskList[taskIndex].test?JSON.parse(taskList[taskIndex].test):null;
							if(test){
								if(typeof response == 'string'){
									var reg = new RegExp(test);
									if(!reg.test(response)){
										LOG.append(false,taskList[taskIndex].name,'Response Not Match');
										return;
									}
								}else if(typeof response == 'object'){
									for(var key in test){
										var curRespons = valueDecode(response, key);
										
										if(typeof test[key] == 'object'){
											for(var testKey in test[key]){
												var judge = true;
												switch(testKey){
													case '$gt':
														judge = test[key][testKey]<curRespons.value;
													break;
													case '$gte':
														judge = test[key][testKey]<=curRespons.value;
													break;
													case '$lt':
														judge = test[key][testKey]>curRespons.value;
													break;
													case '$lte':
														judge = test[key][testKey]>=curRespons.value;
													break;
													case '$ne':
														judge = test[key][testKey]!=curRespons.value;
													break;
													case '$in':
														judge = false;
														if(curRespons.value instanceof Array){
															for(var i=0;i<curRespons.value.length;i++){
																if(curRespons.value[i]==test[key][testKey]){
																	judge = true;
																	break;
																}
															}
														}
													break;
													case '$nin':
														judge = true;
														if(curRespons.value instanceof Array){
															for(var i=0;i<curRespons.value.length;i++){
																if(curRespons.value[i]==test[key][testKey]){
																	judge = false;
																	break;
																}
															}
														}
													break;
													case '$storage':
														for(var storageKey in test[key][testKey]){
															switch(test[key][testKey][storageKey]){
																case '$key':
																storage[storageKey] = curRespons.key;
																break;
																case '$value':
																storage[storageKey] = curRespons.value;
																break;
																default:
																storage[storageKey] = test[key][testKey][storageKey];
																break;
															}
														}
													break;
												}
												if(!judge){
													LOG.append(false,taskList[taskIndex].name,'Response Not Match >> '+key+' : '+JSON.stringify(curRespons.value));
													return;
												}
											}
											
										}else{
											if(curRespons.value!==test[key]){
												LOG.append(false,taskList[taskIndex].name,'Response Not Match >> '+key+' : '+JSON.stringify(curRespons.value));
												return;
											}
										}
									}
								}
							}
							LOG.append(true,taskList[taskIndex].name,'');
							if(monitor){
								monitor.find('li:eq(' + taskIndex + ')').addClass('ok');
							}
							taskIndex++;
							fn.run();
						}else{
							LOG.append(false,taskList[taskIndex].name,response?response:'Code Error');
						}
					},
					realParams
				);
			}else{
				LOG.append(true,'Finished');
			}
		},
		append:function(method,params,test,name){
			taskList.push({'method':method,'params':params,'test':test,'name':name});
			if(monitor){
				if(!name){
					monitor.append('<li class="native">System [native code]</li>');
				}else{
					monitor.append('<li>' + name + '</li>');
				}
				monitor.parent()[0].scrollTop = monitor.parent()[0].scrollHeight;
			}
		},
		skip:function(){
			if(monitor){
				monitor.find('li:eq(' + taskIndex + ')').addClass('skip');
			}
			taskIndex++;
		},
		clear:function(){
			taskIndex = taskList.length;
			LOG.append(true,'Cleared');
		},
		setMonitor:function(o){
			o.append('<ol></ol>');
			monitor = o.find('ol');
			monitor.html('');
		}
	};
	
	return fn;
};