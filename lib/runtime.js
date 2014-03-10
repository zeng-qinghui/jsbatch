var RUNTIME = new function(){
	var monitor = null;
	var taskList = [];
	var taskIndex = 0;
	
	var fn = {
		run:function(){
			monitor.find('li').removeClass('running');
			if(taskList[taskIndex]){
				if(monitor){
					monitor.find('li:eq(' + taskIndex + ')').addClass('running');
				}
				taskList[taskIndex].method(
					function(code,response){
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
										if(typeof test[key] == 'object'){
											var judge = true;
											switch(key){
												case '$gt':
													judge = test[key]>response[key];
												break;
												case '$gte':
													judge = test[key]>=response[key];
												break;
												case '$lt':
													judge = test[key]<response[key];
												break;
												case '$lte':
													judge = test[key]<=response[key];
												break;
												case '$ne':
													judge = test[key]!=response[key];
												break;
												case '$in':
													judge = false;
													if(response[key] instanceof Array){
														for(var i=0;i<response[key].length;i++){
															if(response[key][i]==test[key]){
																judge = true;
																break;
															}
														}
													}
												break;
												case '$nin':
													judge = true;
													if(response[key] instanceof Array){
														for(var i=0;i<response[key].length;i++){
															if(response[key][i]==test[key]){
																judge = false;
																break;
															}
														}
													}
												break;
											}
											if(!judge){
												LOG.append(false,taskList[taskIndex].name,'Response Not Match >> '+key+' : '+JSON.stringify(response[key]));
												return;
											}
										}else{
											if(response[key]!==test[key]){
												LOG.append(false,taskList[taskIndex].name,'Response Not Match >> '+key+' : '+JSON.stringify(response[key]));
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
					taskList[taskIndex].params?JSON.parse(taskList[taskIndex].params):null
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