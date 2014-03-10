var LOG = {
	log:null,
	append:function(code,name,result){
		if(this.log){
			var html = '';
			html = '<span class="log-name">' + name + '</span>';
			if(code){
				html += '<span class="ok">OK</span>';
			}else{
				html += '<span class="error">ERROR</span>';
			}
			if(result){
				html += '&nbsp' + result;
			}
			html += "<br/>";
			if(name || !code){
				this.log.append(html);
				this.log[0].scrollTop = this.log[0].scrollHeight;
			}
		}else{
			if(!code){
				var string = '[ERROR]'+name+':'+result;
				alert(string);
			}
		}
	},
	clear:function(){
		if(this.log){
			this.log.html('');
		}
	}
};