/*
		 
		 * 1  类型检测（date number email  phone  idcard  password  URL ）
		 * 
		 * type:date    条件：格式   是否必填
		 * 
		 * number       条件：数字   长度   是否必填   是否支持小数  进制
		 * 
		 * email        条件：格式    是否必填   
		 * 
		 * phone        条件：格式   是否必填   
		 * 
		 * IDcard       条件：格式   是否必填
		 * 
		 * url          条件：格式   是否必填
		 * 
		 * psd          条件：格式（非法字符） 长度   必填  必须包含大小写字母和数字的组合，不能使用特殊字符，长度在8-10之间
		 *  
		 * c_psd        条件：对比    必填     equalTo
		 * 
		 * text         条件：必填   长度  是否允许中文  是否允许包含特殊字符  字段名称
		 * 利用jQuery 和metadata.js
		 * */
	
		;(function($){
			function Validator(){
				/*验证器中只提供验证方法，不进行逻辑判断*/
			}
			
			
			Validator.prototype={
				//过滤器：过滤掉不需要进行验证的元素如：type为button submit reset
				fliter: function(ele){
						var type=ele.attr("type");
						var rexp=/submit|button|reset/ig;
						return rexp.test(type);
				},
				getValidateMsg:function(ele){
					var type=ele.metadata({type:"attr",name:"validate"}).type;
					var required=ele.metadata({type:"attr",name:"validate"}).conditions.required;
					var minLength=ele.metadata({type:"attr",name:"validate"}).conditions.minLength;
					var maxLength=ele.metadata({type:"attr",name:"validate"}).conditions.maxLength;
					var description=ele.metadata({type:"attr",name:"validate"}).description;
					var support_ch=ele.metadata({type:"attr",name:"validate"}).conditions.support_ch;
					var only_w=ele.metadata({type:"attr",name:"validate"}).conditions.only_w;
					return{
						type:type,
						required:required,
						minLength:minLength,
						maxLength:maxLength,
						description:description,
						only_w:only_w,
						support_ch:support_ch
					}
				},
				
				formatValidate:function(){
					return {
						emailFormat:function(val){
						    var regExp = /^([\w\.])+@\w+\.([\w\.])+$/;
						    return regExp.test(val);
						},
						dateFormat:function(val){
							var regxep=/^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$/ig;
							return regxep.test(val);
						},
						urlFormat:function(val){
							var regExp=new RegExp("(http[s]{0,1}|ftp)://[a-zA-Z0-9\\.\\-]+\\.([a-zA-Z]{2,4})(:\\d+)?(/[a-zA-Z0-9\\.\\-~!@#$%^&*+?:_/=<>]*)?","ig");
							return regExp.test(val);
						},
						phoneFormat:function(val){
							var regExp = /^(\+86)?(13|18|15)\d{9}(?!\d)$/;
    						return regExp.test(val);
						},
						numberFormat:function(val){
							var regExp=/^[0-9]*$/ig;
							return regExp.test(val);
							
						},
						IDcardFormat:function(val){
                            	var num = val.toUpperCase(); 
  								//身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。 
							   if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num))) 
							   {
							      return false;
							   }else{
							   	return true;
							   }

						},
						psdFormat:function(val){//必须包含大小写字母和数字的组合，不能使用特殊字符，长度在8-10之间
							var regExp=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$/ig;
							return regExp.test(val);
						},
						textFormat:function(val){
							return {
								only_w:function(val){//只能包含数字和字母，返回true则包含除数字和字母以外的其他字符
									var regExp=/[^a-zA-Z0-9]/ig;
									return regExp.test(val);
								},
								support_ch:function(val){//返回true，表示有中文
									var regExp=/[\u4e00-\u9fa5]/ig;
									return regExp.test(val);
								},
							}
						}
					}
				},
				
				cheak:function(validateMsg){
					var $this=this;     //保存Validator实例化对象
					return {
						isEmpty:function(val){
							val = val.trim();
							if (val == null)
								return true;
							if (val == undefined || val == 'undefined')
								return true;
							if (val == "")
								return true;
							if (val.length == 0)
								return true;
							if (!/[^(^\s*)|(\s*$)]/.test(val))
								return true;
							return false;
						},
						isRequired:function(ele){
							return $this.getValidateMsg(ele).type;
							
						},
						lengthReq:function(validateMsg,val){
							var maxLen=validateMsg.maxLength;
							var minLen=validateMsg.minLength;
							var inputLength=val.replace(/[^\x00-\xff]/g,"xx").length;//将双音字节替换成“XX”，例如一个汉字记为两个字符
							//var inputLength=val.length;
							//当同时设置的最大值和最小值
							var message={};
							if(maxLen&&minLen){
								
								if(inputLength>=minLen&&inputLength<=maxLen){
									message.flag=true;
								}else{
									message.error="您输入的字符必须要在"+minLen+"~"+maxLen+"之间";
									message.flag=false;
								}
							}else if(maxLen){
								if(inputLength<=maxLen){
									message.flag=true;
								}else{
									message.error="您输入的字符必须要不大于"+maxLen+"个字符";
									message.flag=false;
								}
							}else if(minLen){
								if(inputLength>=minLen){
									message.flag=true;
								}else{
									message.error="您输入的字符必须要不小于"+minLen+"个字符";
									message.flag=false;
								}
							}else{
								//即没有设置长度
								message.flag=true;
							}
							
							return message;
							
						},
						
						formatReq:function(validateMsg){
							return $this.formatValidate()
						}
						
					}
				}
		    }
		
			
			$.fn.formValidate=function(){
				/*逻辑判断*/
				var validator= new Validator();
				var $this=this;
				
				$($this).find("input").each(function(){
					var type=$(this).attr("type");
					var inputValue=$(this).val();
					if(!validator.fliter($(this))){           //判断是否需要需要进行验证，过滤掉button，submit，reset这三种类型
						//判断是否是必填项如果是则进行下面操作，不是则跳过
						var validateMsg=validator.getValidateMsg($(this));
						if(validateMsg.required){
							switch (validateMsg.type){
								case "email" :{
									//用户输入空判断
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										alert("请输入邮箱");
										return false;  //阻止向下进行。
									}else{
										//alert(validator.cheak(validateMsg).formatReq(validator).email(inputValue));
										if(validator.cheak(validateMsg).formatReq().emailFormat(inputValue)){
											//显示正确图标
										}else{
											alert("您输入的邮箱格式不正确");
											return false;//阻止向下进行。
											}
									}	
								}
								break;
								
								
								case "phone" :{
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										alert("请输入电话");
										return false;
									}else{
											if(validator.cheak(validateMsg).formatReq().phoneFormat(inputValue)){
												//显示正确的图标
											}else{
												alert("请输入正确的电话格式");
												return false;
											}
												
										}
								}
								break;
								
								case "url" :{
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										alert("请输入URL");
										return false;
									}else{
											if(validator.cheak(validateMsg).formatReq().urlFormat(inputValue)){
												//显示正确的图标
												alert("URL输入正确");
											}else{
												alert("请输入正确的URL格式");
												return false;
											}
												
										}
								}
								break;
								
								case "date" :{
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										alert("请输入日期");
										return false;
									}else{
											if(validator.cheak(validateMsg).formatReq().dateFormat(inputValue)){
												//显示正确的图标
												alert("日期输入正确");
											}else{
												alert("请输入正确的date格式");
												return false;
											}
												
										}
								}
								break;
								
								case "IDcard" :{
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										alert("请输入身份证号");
										return false;
									}else{
											if(validator.cheak(validateMsg).formatReq().IDcardFormat(inputValue)){
												//显示正确的图标
												alert("身份证号正确");
											}else{
												
												alert("请输入正确的身份证号");
												return false;
											}
												
										}
								}
								break;
								
								case "number" :{
									var maxLen=validateMsg.maxLength;
									var minLen=validateMsg.minLength;
									var message=validator.cheak().lengthReq(validateMsg,inputValue);
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										alert("请输入数字");
										return false;
									}else{
											//格式不正确
											if(!validator.cheak(validateMsg).formatReq().numberFormat(inputValue)){
												alert("请输入正确数字");
												return false;
											}else if(!message.flag){//长度不正确
												alert(message.error);
												return false;
											}else{
												//显示正确的图标
												alert("数字输入正确正确");
											}
												
										}
								}
								break;
								
								case "psd" :{
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										alert("请输入密码");
										return false;
									}else{
											//格式不正确
											if(validator.cheak(validateMsg).formatReq().psdFormat(inputValue)){
												//显示正确的图标
												alert("密码输入正确正确");
											}else{
												alert("请输入正确密码");
												return false;
											}
												
										}
								}
								break;

								case "text" :{
									var support_ch=validateMsg.support_ch;//是否包含中文标识
									var only_w=validateMsg.only_w;//是否只支持数字和字母
									var message=validator.cheak().lengthReq(validateMsg,inputValue);//长度判断
									if(validator.cheak(validateMsg).isEmpty(inputValue)){
										var description=validateMsg.description;
										alert("请输入"+description);
										return false;
									}else{
											if(!message.flag){//长度不正确
												//alert(validateMsg.maxLength);
												alert(message.error);
												return false;
											}else{
												if(support_ch&&only_w){
													alert("support_ch和only_w不能同时设置成true");
													return false;
												}else{
													if(!support_ch||only_w){
														//不支持中文
														if(validator.cheak(validateMsg).formatReq().textFormat().support_ch(inputValue)){
															alert("暂不支持中文");
															return false;
														}
														//仅能输入数字和字母;
														if(validator.cheak(validateMsg).formatReq().textFormat().only_w(inputValue)){
															alert("只能输入字母和数字");
															return false;
														}
														
													}else{
														//填写正确后的提示信息
													}
												}
											}
											//格式判断   中文判断    仅数字和字母判断
											
											
												
										}
								}
								break;
							
							}
						}
					}
					
				})
				
			}
		})(jQuery);
		
		$("form").on("submit",function(e){
			e.preventDefault();
			var form=$("form").formValidate();
		})
		