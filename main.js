$(function(){
	var init = {
		init: null,
		initDatabase : null,
		initGroup : null,
		initEditer : null,
		initTasktable : null,
		initEvent : null,
	};
	
	var G = {
		db:null,
		addInput:{
			sort:null,
			name:null,
			method:null,
			params:null,
			test:null,
		},
		taskGroup:'default'
	};
	
	init.init = function(callback){
		RUNTIME.setMonitor($('#monitor'));
		
		if(!G.addInput.sort)  G.addInput.sort = $('#insert_sort');
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
		
		for(var method in METHODS){
			$('#insert_method').append('<option value="'+method+'">'+method+'</option>');
		}
		
		LOG.log = $('#logContain');
		if(callback){callback(true);}
	};
		
	init.initDatabase = function(callback){
		if(!G.db){G.db = openDatabase('jsbatch','2.3.4','Jsbatch Database',102400);};
		G.db.transaction(function(tx){
			//tx.executeSql('DROP TABLE tasts');
			tx.executeSql('CREATE TABLE IF NOT EXISTS tasks_' + G.taskGroup + '(id integer4 PRIMARY KEY,sort float,name TEXT,method TEXT,params TEXT,test TEXT)',[]);
			if(callback){callback(true);}
		});
	};
	
	
	init.initGroup = function(callback){
		G.db.transaction(function(tx){
			//tx.executeSql('DROP TABLE tasts');
			tx.executeSql('SELECT name FROM sqlite_master WHERE type="table" AND name LIKE "tasks_%"',[],
				function (tx, result) {
					 $('#taskGroupSelect').html('');
                     for (var i = 0; i < result.rows.length; i++) {
						$('#taskGroupSelect').append(
							'<option value="' + result.rows.item(i)['name'].substr(6) + '">'+result.rows.item(i)['name'].substr(6)+'</tr>'
						);
                     }
                     
                     
					G.taskGroup = $('#taskGroupSelect').val();
					$('#taskGroupSelect').change(function(){
						G.taskGroup = $('#taskGroupSelect').val();
						init.initDatabase(function(){
							init.initTasktable(function(){
								init.initEditer();
							});	
						});
					});
					$('.deleteGroup').click(function(){
						var deleteGroup = $('#taskGroupSelect').val();
						$('#taskGroupSelect option:selected').remove();
						if($('#taskGroupSelect option').length==0){
							$('#taskGroupSelect').append('<option value="default">default</tr>');
						}
						$('#taskGroupSelect').val($('#taskGroupSelect option:first').attr('value'));
						$('#taskGroupSelect').change();
						G.db.transaction(function (tx) {
							 tx.executeSql('DROP TABLE tasks_' + deleteGroup,[]);
						});
					});
					$('.addGroup').click(function(){
						var newGroup = window.prompt("New Group:","newGroup");
						if(/^\w+$/.test(newGroup)){
							$('#taskGroupSelect').append(
								'<option value="' + newGroup + '">'+newGroup+'</tr>'
							).val(newGroup).change();
							LOG.append(true,'Add Group');
						}else{
							LOG.append(false,'Add Group','Error Group Name');
						}
					});
                     
					 if(callback){callback(true);}
                 },
                 function () {
                    if(callback){callback(false,'Sql Error');}
                 }
            );
		});
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
		if(callback){callback(true);}
	};

	init.initTasktable = function(callback){
		G.db.transaction(function (tx) {
            tx.executeSql(
				'SELECT * FROM tasks_' + G.taskGroup + ' ORDER BY sort', 
				[],
                function (tx, result) {
					$('#tastlist').html('');
					var maxSort = 0;
                     for (var i = 0; i < result.rows.length; i++) {
                     	var sort = parseFloat(result.rows.item(i)['sort']);
                     	maxSort = maxSort<sort?sort:maxSort;
						$('#tastlist').append(
							'<tr>'+
							'<td name="sort">' + result.rows.item(i)['sort'] + '</td>'+
							'<td name="name">' + result.rows.item(i)['name'] + '</td>'+
							'<td name="method">' + result.rows.item(i)['method'] + '</td>'+
							'<td>'+
							'	<textarea  name="params" class="json">' + result.rows.item(i)['params'] + '</textarea>'+
							'</td>'+
							'<td>'+
							'	<textarea  name="test" class="jscode">' + result.rows.item(i)['test'] + '</textarea>'+
							'</td>'+
							'<td><button class="deleteTaskButton" tast-id="' + result.rows.item(i)['id'] + '">Delete</button></td>'+
							'</tr>'
						);
                     }
                     
					G.addInput.sort.val(Math.ceil(maxSort)+1);
                     
					 if(callback){callback(true);}
                 },
                 function () {
                    if(callback){callback(false,'Sql Error');}
                 });
        });
	};
	
	init.initEvent = function(callback){
		$('.addTaskButton').click(function(){
			G.db.transaction(function (tx) {
				 tx.executeSql(
					'INSERT INTO tasks_' + G.taskGroup + '(id,sort,name,method,params,test) VALUES(?,?,?,?,?,?)', 
					[
						Date.parse( new Date())*100+Math.ceil(Math.random()*90000 + 10000),
						G.addInput.sort.val(),
						G.addInput.name.val(),
						G.addInput.method.val(),
						G.addInput.params.getValue(),
						G.addInput.test.getValue()
					],
					function(){
						var maxSort = 0;
						$('tbody tr').each(function(i,obj){
							var sort = parseFloat($(obj).find('td[name="sort"]').text());
							maxSort = maxSort<sort?sort:maxSort;
						});
						G.addInput.sort.val(Math.ceil(maxSort)+1);
						G.addInput.name.val("");
						G.addInput.params.setValue("");
						G.addInput.test.setValue("");
						init.initTasktable(function(){
							init.initEditer();
						});
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
					'DELETE FROM tasks_' + G.taskGroup + ' where id=?', 
					[
						button.attr('tast-id')
					],
					function(){
						init.initTasktable(function(){
							init.initEditer();
						});
					},
					function(){
						alert('Sql Error');
					}
				);
			});
		});
		$('.runButton').click(function(){
			$('tbody tr').each(function(i,obj){
				var name = $(obj).find('td[name="name"]').text();
				var method = $(obj).find('td[name="method"]').text();
				var params = $(obj).find('textarea[name="params"]').text();
				var test = $(obj).find('textarea[name="test"]').text();
				RUNTIME.append(METHODS[method],params,test,name);
			});
			LOG.clear();
			RUNTIME.run();
		});
		$('.continueButton').click(function(){
			RUNTIME.run();
		});
		$('.skipButton').click(function(){
			RUNTIME.skip();
			RUNTIME.run();
		});
		$('.clearButton').click(function(){
			RUNTIME.clear();
		});
		$('.clearLogButton').click(function(){
			LOG.clear();
		});
		if(callback){callback(true);}
	};
	
	init.init();
	RUNTIME.append(init.initDatabase,null,null,'');
	RUNTIME.append(init.initGroup,null,null,'');
	RUNTIME.append(init.initTasktable,null,null,'');
	RUNTIME.append(init.initEditer,null,null,'');
	RUNTIME.append(init.initEvent,null,null,'');
	RUNTIME.run();
});


