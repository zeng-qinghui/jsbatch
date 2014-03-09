var RUNTIME = new function(){
	var taskList = [];
	var taskIndex = 0;
	
	var fn = {
		run:function(){
			if(taskList[taskIndex]){
				taskList[taskIndex].method(
					function(code,response){
						if(code){
							var test = taskList[taskIndex].test?JSON.parse(taskList[taskIndex].test):null
							if(test){
								if(typeof response == 'string'){
									var reg = new RegExp(test);
									if(!reg.test(response)){
										alert('Response Not Match');
										return;
									}
								}else if(typeof response == 'object'){
									
								}
							}
							taskIndex++;
							fn.run();
						}else{
							alert(response);
						}
					},
					taskList[taskIndex].params?JSON.parse(taskList[taskIndex].params):null
				);
			}
		},
		append:function(method,params,test){
			taskList.push({'method':method,'params':params,'test':test});
		}
	};
	
	return fn;
}
//eval('alert("asdf")');

$(function(){


	var init = {
		initEditer : null,
		initDatabase : null,
		initTasktable : null,
	};
	
	var G = {
		db:null,
		addInput:{
			name:null,
			method:null,
			params:null,
			test:null,
		}
	};
	
	init.initEditer = function(callback){
		$('tbody .json, tbody .jscode').each(function(index,obj){
			var o = CodeMirror.fromTextArea(obj, {
				matchBrackets: true,
				autoCloseBrackets: true,
				mode: "application/ld+json",
				lineWrapping: true,
				tabSize:4,
				tabindex:4,
				readOnly:true
			});
		});
		
		if(!G.addInput.name)  G.addInput.name = $('#insert_name');
		if(!G.addInput.method) G.addInput.method = $('#insert_method');
		if(!G.addInput.params) G.addInput.params = CodeMirror.fromTextArea($('#insert_params')[0], {
				matchBrackets: true,
				autoCloseBrackets: true,
				mode: "application/ld+json",
				lineWrapping: true,
				tabSize:4,
				tabindex:4,
				readOnly:false
		});
		if(!G.addInput.test) G.addInput.test = CodeMirror.fromTextArea($('#insert_test')[0], {
				matchBrackets: true,
				autoCloseBrackets: true,
				mode: "application/ld+json",
				lineWrapping: true,
				tabSize:4,
				tabindex:4,
				readOnly:false
		});
		
		
		if(callback){callback(true);}
	}
	
	init.initDatabase = function(callback){
		G.db = openDatabase('jsbatch','2.3.4','Jsbatch Database',102400);
		G.db.transaction(function(tx){
			//tx.executeSql('DROP TABLE tasts');
			tx.executeSql('CREATE TABLE IF NOT EXISTS tasts(id integer(4) PRIMARY KEY, name TEXT,method TEXT,params TEXT,test TEXT)',[]);
			if(callback){callback(true);}
		});
	}
	
	init.initTasktable = function(callback){
		G.db.transaction(function (tx) {
            tx.executeSql(
				"SELECT * FROM tasts", 
				[],
                function (tx, result) {
					$('#tastlist').html('');
                     for (var i = 0; i < result.rows.length; i++) {
						$('#tastlist').append(
							'<tr>'+
							'<td>' + result.rows.item(i)['name'] + '</td>'+
							'<td>' + result.rows.item(i)['method'] + '</td>'+
							'<td>'+
							'	<textarea class="json">' + result.rows.item(i)['params'] + '</textarea>'+
							'</td>'+
							'<td>'+
							'	<textarea class="jscode">' + result.rows.item(i)['test'] + '</textarea>'+
							'</td>'+
							'<td><button class="deleteTaskButton" tast-id="' + result.rows.item(i)['id'] + '">Delete</button></td>'+
							'</tr>'
						);
                     }
					 if(callback){callback(true);}
                 },
                 function () {
                    if(callback){callback(false,'Sql Error');}
                 });
        });
	}
	
	init.initEvent = function(callback){
		$('.addTaskButton').click(function(){
			G.db.transaction(function (tx) {
				 tx.executeSql(
					'INSERT INTO tasts(id,name,method,params,test) VALUES(?,?,?,?,?)', 
					[
						Date.parse( new Date())*100+Math.ceil(Math.random()*90000 + 10000),
						G.addInput.name.val(),
						G.addInput.method.val(),
						G.addInput.params.getValue(),
						G.addInput.test.getValue()
					],
					function(){
						RUNTIME.append(init.initTasktable,null,null);
						RUNTIME.append(init.initEditer,null,null);
						RUNTIME.run();
					},
					function(){
						alert('Sql Error');
					}
				);
			});
		});
		$('tbody').on('click','.deleteTaskButton',function(){
			var button = $(this);
			G.db.transaction(function (tx) {
				 tx.executeSql(
					'DELETE FROM tasts where id=?', 
					[
						button.attr('tast-id')
					],
					function(){
						RUNTIME.append(init.initTasktable,null,null);
						RUNTIME.append(init.initEditer,null,null);
						RUNTIME.run();
					},
					function(){
						alert('Sql Error');
					}
				);
			});
		});
		
		if(callback){callback(true);}
	}
	
	RUNTIME.append(init.initDatabase,null,null);
	RUNTIME.append(init.initTasktable,null,null);
	RUNTIME.append(init.initEditer,null,null);
	RUNTIME.append(init.initEvent,null,null);
	RUNTIME.run();
});


