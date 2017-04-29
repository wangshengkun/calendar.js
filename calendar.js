//跨浏览器事件函数
var EventUtil = {
	addHandler:function(element, type, handler){
		if(element.addEventListener){
			element.addEventListener(type, handler, false);			
		}else if(element.attachEvent){
			element.attachEvent("on" + type, handler);
		}else{
			element["on" + type] = handler;
		}
	},
	removeHandler:function(element, type, handler){
		if(element.removeEventListener){
			element.removeEventListener(type, handler, false);
		}else if(element.detachEvent){
			element.detachEvent("on" + type, handler);
		}else{
			element["on" + type] = null;
		}
	},
	getEvent:function(event){
		return event ?  event :window.event;
	},
	getTarget:function(event){
		return event.target || target.srcElement;
	},
	stopPropagation:function(event){
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancleBubble = true;
		}
	},
	preventDefault:function(event){
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}
};

//日历插件构造函数
function Calendar(){
	this.now = new Date();
	this.year = this.now.getFullYear();
	this.month = this.now.getMonth() + 1;//切记，月份从0开始计数
	this.date = this.now.getDate();
	this.day = this.now.getDay();
	this.createFrame();
	this.getTimeDetail();
	this.render();

	const title = document.getElementById("calendarTitle");
	const self = this;
	EventUtil.addHandler(title, "click", function(event){
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		self.changeDate(target);
	});
}

Calendar.prototype = {
	constructor:Calendar,

	//创建日历框架
	createFrame:function(){
		const week = ["一","二","三","四","五","六","日"];
		const calendar = document.createElement("div");
		const title = document.createElement("div");
		const dateWrap = document.createElement("div");
		const pre = document.createElement("a");
		const next = document.createElement("a");
		const titleYear = document.createElement("span");
		const titleMonth = document.createElement("span");
		const table = document.createElement("table");
		const tbody = document.createElement("tbody");

		calendar.id = "calendar"
		title.id = "calendarTitle";
		pre.id = "preMonth";
		next.id = "nextMonth";
		dateWrap.id = "dateWrap";
		titleYear.id = "titleYear";
		titleMonth.id = "titleMonth";
		tbody.id = "calendarBody"

		//创建表格
		for(let i = 0; i < 7; i++){
			tbody.insertRow(i);
			for(let j = 0; j < 7; j++){
				tbody.rows[i].insertCell(j);
				//创建星期显示
				if(i == 0){
					tbody.rows[i].cells[j].innerHTML = week[j];
				}
				//如果是周末则添加样式
				if(j == 5 || j == 6){
					tbody.rows[i].cells[j].classList.add("weekend");
				}
			}
		}

		pre.innerHTML = "<";
		next.innerHTML = ">";
		titleYear.innerHTML = this.year + "年";
		titleMonth.innerHTML = this.month + "月";
		title.appendChild(pre);
		title.appendChild(dateWrap);
		dateWrap.appendChild(titleYear);
		dateWrap.appendChild(titleMonth);
		title.appendChild(next);
		table.appendChild(tbody);
		calendar.appendChild(title);
		calendar.appendChild(table);
		document.body.appendChild(calendar);
	},

	render:function(){
		this.init();
		var index = 1;
		var temp = NaN;
		var day = this.tempDay || this.day;
		const tbody = document.getElementById("calendarBody");
		for (let i = day - 1; i < 7; i++) {
			tbody.rows[1].cells[i].innerHTML = index++;
		}
		for (let j = 2; j < 7; j++) {
			for (let z = 0; z < 7; z++) {
				if (index <= this.allDays) {
					tbody.rows[j].cells[z].innerHTML = index++;
				}
			}
		}
		//为当前日期和以前日期添加样式
		// for(let i = 1; i < 6; i++){
		// 	for(let j = 0; j < 7; j++){
		// 		if(tbody.rows[i].cells[j].innerHTML == this.date){
		// 			tbody.rows[i].cells[j].classList.add("today");
		// 		}else if(tbody.rows[i].cells[j].innerHTML < this.date){
		// 			tbody.rows[i].cells[j].classList.add("preDay");
		// 		}
		// 	}
		// }
	},

	//初始化
	init:function(){
		const tbody = document.getElementById("calendarBody");
		
		for(let i = 1; i < 7; i++){
			for(let j = 0; j < 7; j++){
				tbody.rows[i].cells[j].innerHTML = "";
			}
		}
	},

	//获取时间细节
	getTimeDetail:function(){
		const commonYear = [31,28,31,30,31,30,31,31,30,31,30,31];
		const leapYear = [31,29,31,30,31,30,31,31,30,31,30,31];
		this.flag = false;
		this.tempDate = new Date(this.year, this.month-1);//当前年月所得到的时间
		this.tempYear = this.tempDate.getFullYear();
		this.tempMonth = this.tempDate.getMonth();
		this.tempDay = this.tempDate.getDay();
		if(this.tempDay == 0){
			this.tempDay = 7;
		}
		console.log(this.tempYear+"年");
		console.log(this.tempMonth+1+"月");
		console.log("该月第一天是周"+this.tempDay);
		//判断是否为闰年
		if(this.tempYear % 400 == 0 ||(this.tempYear % 4 == 0 && this.tempYear % 100 != 0)){
			this.flag = true;
		}
		if(!this.flag){//平年
			this.allDays = commonYear[this.tempMonth];
		}else{//闰年
			this.allDays = leapYear[this.tempMonth];
		}
		// console.log("正常:"+this.now);
		// console.log("更改后:"+this.tempDate);
		// console.log(this.allDays);
		
		// this.date = this.tempDate.getDate();
		// this.day = this.tempDate.getDay();
		// console.log(this.date);
		// console.log(this.day);

	},

	//改变日期函数,利用事件委托来减少内存分配
	changeDate:function(target){
		const pre = document.getElementById("preMonth");
		const next = document.getElementById("nextMonth");
		const titileYear = document.getElementById("titleYear");
		const titleMonth = document.getElementById("titleMonth");
		if(target == pre){
			switch(this.month){
				case 1:
					this.year = --this.year;
					this.month = 12;
					break;
				default:
					this.month = --this.month;
			}
		}else if(target == next){
			switch(this.month){
				case 12:
					this.month = 1;
					this.year = ++this.year;
					break;
				default:
					this.month = ++this.month;
			}
		}
		titleYear.innerHTML = this.year + "年";
		titleMonth.innerHTML = this.month + "月";

		this.getTimeDetail();
		this.render();
	}
}