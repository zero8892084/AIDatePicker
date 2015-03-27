(function(){
	var k=new Date().getTime();
	var eleId='J_datepicker_'+k;
	var wrapId='J_datepicker_monthblock_wrap_'+k;
	var contentId='J_datepicker_monthblock_'+k;
	var eleHtml='<div id="'+eleId+'" class="nb-time fn-hide">'+
		'<table class="nb-table nb-table-time nb-table-time-title">'+
			'<tr>'+
				'<td colspan="7" class="nb-table-time-head">'+
					'<span class="nb-head-return"></span>'+
					'<span class="nb-head-title" style="font-size:1.24em">'+
						'选择日期'+
					'</span>'+
				'</td>'+
			'</tr>'+
			'<tr>'+
				'<td>日</td>'+
				'<td>一</td>'+
				'<td>二</td>'+
				'<td>三</td>'+
				'<td>四</td>'+
				'<td>五</td>'+
				'<td>六</td>'+
			'</tr>'+
		'</table>'+
		'<div id="'+wrapId+'" class="nb-time-monthblock-wrap">'+
			'<div id="'+contentId+'">'+
			'</div>'+
		'</div>'+
	'</div>';
	$('body').append(eleHtml);



	var listeners={};
	function ZEvent(){
	}
	/*name:监听事件的名字*/
	ZEvent.prototype.addListener=function(name,listener){
		if(!listeners[name]){
			listeners[name]=[];
		}
		listeners[name].push(listener);
	}
	/*event：{
		name:'',
		v1:'',//自定义
		v2:''//自定义
	}
	如果传入的只是字符串那么默认会生成一个事件对象：{name:xxx}
	*/
	ZEvent.prototype.trigger=function(event){
		if(typeof event == 'string'){
			event={
				name:event
			}
		}
		var list=listeners[event.name];
		if(list){
			for(var i=0;i<list.length;i++){
				return list[i](event);
			}
		}
		return;
	}
	ZEvent.prototype.removeListener=function(name){
		delete listeners[name];
	}


	function NBDatePicker(obj){
		var _th=this;

		//初始化
		this._ruls=obj.rules;
		this.valLength=2;
		if(obj.valLength){
			this.valLength=obj.valLength;
		}
		//为当前选中的值赋值
		this._curVal=[];
		if(obj.val instanceof Date){
			this._curVal.push(timeFormat(start,'YYYYMMDD'));
		}else if(obj.val instanceof Array && obj.val[0]){
			for(var i in obj.val){
				this._curVal.push(timeFormat(obj.val[i],'YYYYMMDD'));
			}
		}



		//拖动到边缘的时候每次加载的月数
		this._item=3;

		$('#'+eleId).on('touchmove',function(e){
			e.preventDefault();
		}).on('click','.J_time_hook',function(e){
			//获取当前选中的值
			var arr=_th._curVal;
			//当单击一日的时候，该函数执行
			var eve=new ZEvent();
			//如果当前日是不可用的 或 当前日不是本月日期的，单击事件将不响应
			if($(this).hasClass('disabled')||$(this).hasClass('noin')){
				return;
			}
			//flag用于判断当前单击的日期是否被选中
			var flag=$(this).hasClass('selected');
			//获取当前日期的值
			var val=$(this).data('val')+'';
			//将值数组复制一份
			var n=arr.slice(0);
			if(flag){
				var i=indexOfArr(n,val);
				n.splice(i,1);
				//如果当前日期已经选中，去掉选中样式，然后执行onUnSelect方法
				var isdone=eve.trigger({
					name:'unSelect',
					val:strToDate(val,'YYYYMMDD'),
					otherVal:makeTimeArr(n)
				});
				if(isdone!=false){
					$(this).removeClass('selected');
					var i=indexOfArr(arr,val);
					arr.splice(i,1);
				}
			}else{
				if(arr.length>=_th.valLength){return;}
				var isdone=eve.trigger({
					name:'select',
					val:strToDate(val,'YYYYMMDD'),
					otherVal:makeTimeArr(n)
				});
				if(isdone!=false){
					$(this).addClass('selected');
					if(indexOfArr(arr,val)==-1){
						arr.push(val);
					}
					if(_th.valLength==arr.length){
						arr.sort();
						_th.hide();
					}
				}
			}
			return;
		});
		
		/*$('#J_date_picker_return').on('click',function(){
			_th.hide();
		})*/
		
		//新建滑动类
		//this.slider=new NBDatePickerSlider(this);
		new ZDrag($('#'+wrapId),this);

		$('#'+eleId).on('touchstart','.nb-head-return',function(event){
			event.preventDefault();
			_th.hide();
		});
	}

	
	NBDatePicker.prototype.on=function(eventName,func){
		var e=new ZEvent();
		e.addListener(eventName,func);
		return this;
	}


	//新建月视图,传入一个日期
	NBDatePicker.prototype.createMonth=function(date){
		//定义标题
		var title='<div class="nb-time-month">'+timeFormat(date,'YYYY年MM月')+'</div>';

		//将当前日期复制一份，以避免影响原对象
		var n=new Date(date.getTime());

		//获取1日是周几
		n.setDate(1);
		var week=n.getUTCDay();
		if(week!=0){
			//week值相当于上月需要补充的天数
			//即将n定位到上月对应的日期
			n.setDate(-1*week+1);
		}
		//开始生成日
		var html='<table class="nb-table nb-table-time nb-table-time-date"><tr>';
		//每一个方块有5行，1行7日，共35天
		for(var i=1;i<=35;i++){
			var val=n.getDate();
			//cla表示当前日期是不是当前月的,如果不是的话cla=noin
			var cla='';
			if(date.getMonth()!=n.getMonth()){
				cla='noin';
			}
			//inh保存当前日期
			var inh=val;
			//如果是是今日，那么打上标示
			if(timeFormat(new Date(),'YYYYMMDD')==timeFormat(n,'YYYYMMDD')){
				var inh=val+'<p class="desc">今天</p>';
			}
			//根据过滤规则来确定当前日期是否可以点击
			var dis='';
			if(this._ruls){
				for(var e in this._ruls){
					var flag=true;
					var o=this._ruls[e];
					if(typeof o == 'function'){
						//如果o是方法，那么就是自定义的规则
						flag=o(n);
					}else if(typeof o == 'object'){
						//如果o是对象说明是内置的规则
						flag=inRuls[o.name](n,o.val);
					}
					//根据规则来确定是否可用
					if(!flag){
						dis='disabled';
					}
				}
			}
			//用于确定是否当前日期是否已被选中
			var sel='';
			if(this._curVal){
				for(var c in this._curVal){
					if(this._curVal[c]==timeFormat(n,'YYYYMMDD')&&!cla){
						sel='selected';
						break;
					}
				}
			}
			//生成当前日期的html
			html+='<td class="J_time_hook '+cla+' '+dis+' '+sel+'" data-val='+timeFormat(n,'YYYYMMDD')+'>'+inh+'</td>';
			if(i%7==0){
				html+='</tr><tr>';
			}
			//将n定位到下个日期
			n.setDate(val+1);
		}
		html+='</table>';
		return title+html;
	}
	//隐藏方法
	NBDatePicker.prototype.hide=function(){
		var height=$(window).height();

		//对整个日期控件添加一个向下的位移，产生动画
		$('#'+eleId).css('-webkit-transform','translate3d(0,'+height+'px, 0)');

		//动画完成后隐藏
		setTimeout(function(){
			$('#'+eleId).addClass('fn-hide');
		},300);

		new ZEvent().trigger({
			name:'hide',
			val:makeTimeArr(this._curVal)
		});

		return this;
	}
	/*
		show方法入参 obj:{
			rules:[
				{name:'max',val:new Date()},
				{name:'min',val:new Date()},
				function(date){ return true; }
			],//日期过滤规则，内置了最大值最小值两个规则,也可以自定义
			val:[date]或者date//表示已经选中的值
		}
	*/
	NBDatePicker.prototype.show=function(){
		//以当前时间为计算的中点
		var start = new Date();
		
		if(this._curVal[0]){
			start=strToDate(this._curVal[0],'YYYYMMDD');
		}
		
		//将时间往前推两个月
		start.setMonth(start.getMonth()-3);
		//记录当滑到顶部的时候应该从哪个时间开始
		this._curMin=new Date(start.getTime());
		this._curMin.setMonth(this._curMin.getMonth()-1);

		//生成5个月的视图
		var html='';
		for(var i=0;i<7;i++){
			html+=this.createMonth(start);
			start.setMonth(start.getMonth()+1);
		}

		//记录当前滑到底部的时候应该从哪个时间开始
		this._curMax=new Date(start.getTime());

		//将生成的5个月视图插入
		$('#'+contentId).html(html);
		//计算滚动视窗高度
		var height=$(window).height();
		$('#'+wrapId).css('height',height-100);

		//获取当前滚动条高度,然后将这个值赋给top
		//加入偏移量，以便生成动画
		var top=document.body.scrollTop;
		$('#'+eleId).removeClass('fn-hide').css({
			'top':top,
			"height":height+'px',
			'-webkit-transform':'translate3d(0,'+height+'px, 0)'
		});
		setTimeout(function(){
			//将偏移量置0，动画自动生成
			//将这句话放在setTimeout中是为了，不让这个css操作和上面的css操作放在一帧中
			//如果放在一帧当中，就不会产生动画效果
			$('#'+eleId).css('-webkit-transform','none');
		},0);

		//将今天显示在视窗中部
		$('#'+contentId).css('-webkit-transform','translate3d(0,-40%, 0)');
		return this;
	}
	//内置的过滤规则，目前只有最大最小值两个内置的过滤器
	var inRuls={
		max:function(date,max){
			if(timeFormat(max,'YYYYMMDD')>=timeFormat(date,'YYYYMMDD')){
				return true;
			}else{
				return false;
			}
		},
		min:function(date,min){
			if(timeFormat(min,'YYYYMMDD')<=timeFormat(date,'YYYYMMDD')){
				return true;
			}else{
				return false;
			}
		}
	};
	
	function makeTimeArr(arr){
		var n=[];
		for(var i in arr){
			var temp=n.length;
			for(var e in n){
				if(timeFormat(n[e],'YYYYMMDD')>arr[i]){
					temp=e;
					break;
				}
			}
			n.splice(temp,0,strToDate(arr[i]+'','YYYYMMDD'))
		}
		return n;
	}

	function indexOfArr(arr,val){
		for(var i in arr){
			if(arr[i] == val){
				return i;
			}
		}
		return -1;
	}
	//获取上月最后一天
	function getPreMonthLastDate(date){
		var n=new Date(date.getTime());
		n.setDate(0);
		return n.getDate();
	}
	//获取本月最后一天
	function getMonthLastDate(date){
		var n=new Date(date.getTime());
		n.setMonth(n.getMonth()+1);
		n.setDate(0);
		return n.getDate();
	}
	window.NBDatePicker=NBDatePicker;

	function ZDrag(wrap,timeObj){
		var eleInitial=0;//元素初始位置
		var tocInitial=0;//触摸初始位置
		var startTime=0; //开始滑动的时间

		var arr=$(wrap).children();
		var obj=arr?arr[0]:undefined;

		var isInertia=false;//是否在惯性动画过程中


		var _th=this;

		$(obj).css('-webkit-transform','translate3d(0,0,0)').on('touchstart',function(e){
			//_th是NBDatePickerSlider对象
			//获取当前这次滑动的开始时间,用于计算惯性
			startTime=new Date().getTime();
			//手指触摸时取消惯性滑动
			//由于安卓手机上会引起卡顿，目前待解决
			if(isInertia){
				$(this).css('-webkit-transition','none');
			}
			eleInitial=getTop(this);
			//将开始触摸时的手指位置保存起来
			tocInitial=e.originalEvent.touches[0].clientY;
		}).on('touchmove',function(e){
			var tocNow=e.originalEvent.touches[0].clientY;
			//首先计算出手指的偏移量，然后将元素也移动这个偏移量
			var top=eleInitial+(tocNow-tocInitial);
			$(this).css('-webkit-transform', 'translate3d(0, ' + top + 'px, 0)');
		}).on('touchend',function(e){
			//手指当前的位置
			var tocNow=e.originalEvent.changedTouches[0].clientY;
			//计算手指的偏移量，然后通过偏移量计算出元素所处位置
			var top=eleInitial+(tocNow-tocInitial);
			if(isTop(wrap,top)&&!isMin(timeObj)){
				//新增顶部月份
				var h=preHtml(timeObj,top);
				top=prepend(this,h,top);
			}
			if(isBottom(wrap,this,top)&&!isMax(timeObj)){
				append(timeObj,this);
			}
			//计算惯性滑动
			//首先计算时间，换算成秒
			var t=(new Date().getTime()-startTime)/1000;
			var es=0;//
			var et=0.2;
			//当整个触摸过程小于0.2秒的时候
			if(t<=0.2){
				//为了防止滑动时间过小，影响最后计算出来的滑动速度，将滑动最小值设为0.09秒
				if(t<0.09){
					t=0.09;
				}
				var s=Math.abs(tocNow-tocInitial);//当前这次滑动的距离
				var a=4000;//摩擦系数，值越大惯性效果越小,相当于加速度a
				var v=s/t;//计算出当前滑动的速度
				var et=v/a;//计算出惯性效果的时间
				var es=a*Math.pow(et,2);//计算出惯性效果的距离
			}
			//判断是向上滑动还是向下滑动
			//当整个触摸过程小于0于零的时候说明是向上滑动，那么惯性方向应该是向上，即es为负值
			if(tocNow-tocInitial<0){
				es=-1*es;
			}
			//计算出元素经过惯性效果后最终停留的位置
			var inertia=top+es;
			//如果最终停留的位置在顶部之下，那么新增元素，直到停留的位置在顶部之上
			//如果停留在顶部以下并且还没到达最小值,则继续新增元素
			while(isTop(wrap,inertia)&&!isMin(timeObj)){
				//新增了元素之后y方向的位置会变，所以重新赋值
				var h=preHtml(timeObj,top);
				top=prepend(this,h,top);
				//重新计算最终停留的位置
				inertia=top+es;
			}

			//如果最终停留的位置在底部之上，那么新增元素，直到停留的位置在底部之下
			//如果停留在底部之上并且还没到达最大值,则继续新增元素
			while(isBottom(wrap,this,inertia)&&!isMax(timeObj)){
				append(timeObj,this);
			}

			var wrapHeight=$(wrap).height();//外层高度
			var eleHeight=$(obj).height();
			if(inertia>0){
				inertia=0;
			}else if((inertia+eleHeight)<wrapHeight){
				inertia=(eleHeight-wrapHeight)*-1;
			}
			
			/*console.log('v:'+v);
			console.log('t:'+et);
			console.log('s:'+es);
			console.log(tocNow-tocInitial);
			console.log('top:'+top);
			console.log(_ele.css('-webkit-transform'));
			console.log('translate3d(0,'+top+'px, 0)');*/
			//将上面计算出的数据添加到css中，产生动画效果
			var _ele=$(this);
			_ele.css('-webkit-transition','-webkit-transform '+et+'s cubic-bezier(.35,.88,.42,1)')
				.css('-webkit-transform', 'translate3d(0,'+inertia+'px, 0)');
			isInertia=true;
			//动画结束后移除动画属性，并且执行新增元素的方法
			setTimeout(function(){
				_ele.css('-webkit-transition','none');
				isInertia=false;
			},et*1000);
		});
	}

	function getTop(obj){
		var cssStr=$(obj).css('-webkit-transform');
		if(cssStr&&cssStr.match(/\(.*\)/)){
			var strs=cssStr.match(/\(.*\)/)[0].split(',');
			var iRead=strs.length>=5?5:1;
			return parseInt(strs[iRead]);
		}
		return 0;
	}

	function isTop(wrap,top){
		var wrapHeight=$(wrap).height();//外层高度
		//当滑动元素的顶部在视窗顶部上下1/3范围之内时
		if(top>wrapHeight*0.8*(-1)){
			return true;
		}else{
			return false;
		}
	}
	function isBottom(wrap,target,top){
		var wrapHeight=$(wrap).height();//外层高度
		var eleHeight=$(target).height();
		if((top+eleHeight)<wrapHeight*1.8){
			return true;
		}else{
			return false;
		}
	}


	//顶部新增元素的函数
	//每次新增_item个月
	//timeObj是日期控件对象
	function preHtml(timeObj,top){
		//将最小月份再往前推(obj._item-1)个月,然后开始渲染,即每次渲染_item个月
		timeObj._curMin.setMonth(timeObj._curMin.getMonth()-timeObj._item+1);
		var h='';//html
		for(var i=0;i<timeObj._item;i++){
			h+=timeObj.createMonth(timeObj._curMin);
			timeObj._curMin.setMonth(timeObj._curMin.getMonth()+1);
		}
		//重新设置日期最小值，下次新增将从这个值开始
		timeObj._curMin.setMonth(timeObj._curMin.getMonth()-timeObj._item-1);
		return h;
	}
	//顶部新增元素的函数
	function prepend(target,html,top){
		var obj=$(target);
		var originalHeight=obj.height();
		obj.prepend(html);
		var height=obj.height();
		top=top-(height-originalHeight);
		//console.log(this.top+' '+height+' '+originalHeight);
		obj.css('-webkit-transform', 'translate3d(0,'+top+'px, 0)');
		return top;
	}
	function isMin(timeObj){
		//遍历过滤规则，找出最小值
		//假设当前要新增的日期小于最小值，那么将不做新增操作
		for(var e in timeObj._ruls){
			var o=timeObj._ruls[e];
			if(typeof o == 'object' && o.name == 'min'){
				if(timeFormat(o.val,'YYYYMM')>timeFormat(timeObj._curMin,'YYYYMM')){
					return true;
				}
			}
		}
		return false;
	}


	//底部新增元素的函数
	//每次新增_item个月
	//timeObj是日期控件对象
	function append(timeObj,target){
		//开始新增
		var h='';//html
		for(var i=0;i<timeObj._item;i++){
			h+=timeObj.createMonth(timeObj._curMax);
			timeObj._curMax.setMonth(timeObj._curMax.getMonth()+1);
		}
		$(target).append(h);
	}

	function isMax(timeObj){
		//遍历过滤条件，寻找最大值
		//如果超过最大值，将不进行新增操作
		for(var e in timeObj._ruls){
			var o=timeObj._ruls[e];
			if(typeof o == 'object' && o.name == 'max'){
				if(timeFormat(o.val,'YYYYMM')<timeFormat(timeObj._curMax,'YYYYMM')){
					return true;
				}
			}
		}
		return false;
	}
	//日期转字符串
	function timeFormat(date , formatStr){ 
	      var str = formatStr;
	      if(!date){
	      	str = "";
	      } else{
		      str=str.replace(/yyyy|YYYY/,date.getFullYear()); 
		      str=str.replace(/yy|YY/,(date.getYear() % 100)>9?(date.getYear() % 100).toString():"0" + (date.getYear() % 100)); 
		      str=str.replace(/MM/,date.getMonth()>8?(date.getMonth()+1).toString():"0" + (date.getMonth()+1)); 
		      str=str.replace(/M/g,date.getMonth()+1); 
		      str=str.replace(/dd|DD/,date.getDate()>9?date.getDate().toString():"0" + date.getDate()); 
		      str=str.replace(/d|D/g,date.getDate()); 
		      str=str.replace(/hh|HH/,date.getHours()>9?date.getHours().toString():"0" + date.getHours()); 
		      str=str.replace(/h|H/g,date.getHours()); 
		      str=str.replace(/mm/,date.getMinutes()>9?date.getMinutes().toString():"0" + date.getMinutes()); 
		      str=str.replace(/m/g,date.getMinutes()); 
		      str=str.replace(/ss|SS/,date.getSeconds()>9?date.getSeconds().toString():"0" + date.getSeconds()); 
		      str=str.replace(/s|S/g,date.getSeconds()); 
		  }
	      return str;
	}
	//字符串转换成日期
	function strToDate(dateStr,formatStr){
		if(!dateStr) return null;
	    //YYYY是年
	    //MM是“01”月的格式
	    //DD是“01”日的格式
	    //HH是小时、MN是分、SS是秒
	    var digit=0;//退位计数器
	    var date=new Date();
	    var newFormat=formatStr.toUpperCase();
	    var year=getNumFromStr(dateStr,newFormat,'YYYY');
	    var month=getNumFromStr(dateStr,newFormat,'MM');
	    var da=getNumFromStr(dateStr,newFormat,'DD');
	    var hour=getNumFromStr(dateStr,newFormat,'HH');
	    var mn=getNumFromStr(dateStr,newFormat,'MN');
	    var ss=getNumFromStr(dateStr,newFormat,'SS');
	    if (year > 0)
	        date.setFullYear(year);
	    if (month > 0)
	        date.setMonth(month - 1);
	    if (da > 0)
	        date.setDate(da);
	    if (hour > 0)
	        date.setHours(hour);
	    if (mn > 0)
	        date.setMinutes(mn);
	    if (ss > 0)
	        date.setSeconds(ss);
	    return date;
	    function getNumFromStr(target,frm,s){
	        //target是目标字符串，frm是模板字符串，s是匹配字符
	        var len=s.length;
	        var index=frm.indexOf(s);
	        if(index<0)return index;
	        var reStr=target.substr(index-digit,len);
	        var result=parseInt(reStr,10);//(s=='SM'||s=='SD')&&
	        if(result<10&&(reStr.charAt(0)!=0)){
	            digit++;
	        }
	        return result;
	    }
	}
})();