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
}

//日历插件构造函数
function Calendar(){
	this.now = new Date();
	this.createFrame();
	this.init();
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
		for(let i = 0; i < 6; i++){
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
		titleYear.innerHTML = this.now.getFullYear() + "年";
		titleMonth.innerHTML = (this.now.getMonth()+1) + "月";
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

	//初始化
	init:function(){
		var index = 1;
		var temp = NaN;
		const commonYear = [31,28,31,30,31,30,31,31,30,31,30,31];
		const leapYear = [31,29,31,30,31,30,31,31,30,31,30,31];
		const tbody = document.getElementById("calendarBody");

		this.getTimeDetail();
		
		for (let i = this.day - 1; i < 7; i++) {
			tbody.rows[1].cells[i].innerHTML = index++;
		}
		for (let j = 2; j < 6; j++) {
			for (let z = 0; z < 7; z++) {
				if (!this.flag) { //平年
					if (index <= commonYear[this.month]) {
						tbody.rows[j].cells[z].innerHTML = index++;
					}
				} else { //闰年
					if (index <= leapYear[this.month]) {
						tbody.rows[j].cells[z].innerHTML = index++;
					}
				}
			}
		}
		for(let i = 1; i < 6; i++){
			for(let j = 0; j < 7; j++){
				if(tbody.rows[i].cells[j].innerHTML == this.date){
					tbody.rows[i].cells[j].classList.add("today");
				}else if(tbody.rows[i].cells[j].innerHTML < this.date){
					tbody.rows[i].cells[j].classList.add("preDay");
				}
			}
		}
	},

	//获取时间细节
	getTimeDetail:function(){
		this.flag = false;
		this.year = this.now.getFullYear();
		this.month = this.now.getMonth();
		this.date = this.now.getDate();
		this.day = this.now.getDay();
		//判断是否为闰年
		if(this.year % 400 == 0 ||(this.year % 4 == 0 && this.year % 100 != 0)){
			this.flag = true;
		}
	}
}