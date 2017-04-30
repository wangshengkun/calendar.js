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
	this.month = this.now.getMonth()+1;//切记，月份从0开始计数
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
		const titleYear = document.createElement("ul");
		const titleMonth = document.createElement("ul");
		const yearTxt = document.createTextNode("");
		const monthTxt = document.createTextNode("");
		const yearSign = document.createElement("span");
		const monthSign = document.createElement("span");
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
		yearSign.innerHTML = "年";
		monthSign.innerHTML = "月";
		titleYear.appendChild(yearTxt);
		titleMonth.appendChild(monthTxt);
		title.appendChild(pre);
		title.appendChild(dateWrap);
		dateWrap.appendChild(titleYear);
		dateWrap.appendChild(yearSign);
		dateWrap.appendChild(titleMonth);
		dateWrap.appendChild(monthSign);
		title.appendChild(next);
		table.appendChild(tbody);
		calendar.appendChild(title);
		calendar.appendChild(table);
		document.body.appendChild(calendar);
	},

	//获取时间细节
	getTimeDetail:function(){
		const commonYear = [31,28,31,30,31,30,31,31,30,31,30,31];
		const leapYear = [31,29,31,30,31,30,31,31,30,31,30,31];
		this.flag = false;
		this.tempDate = new Date(this.year, this.month-1);//当前年月所得到的时间
		this.tempYear = this.tempDate.getFullYear();
		this.tempMonth = this.tempDate.getMonth();
		this.tempDay = this.tempDate.getDay();//该月份的第一天是星期几
		if(this.tempDay == 0){
			this.tempDay = 7;
		}
		//判断是否为闰年
		if(this.tempYear % 400 == 0 ||(this.tempYear % 4 == 0 && this.tempYear % 100 != 0)){
			this.flag = true;
		}
		if(!this.flag){//平年
			this.allDays = commonYear[this.tempMonth];
		}else{//闰年
			this.allDays = leapYear[this.tempMonth];
		}
	},

	//渲染函数
	render:function(){
		//执行初始化函数
		this.init();

		var index = 1;
		const tbody = document.getElementById("calendarBody");
		const titleYear = document.getElementById("titleYear");
		const titleMonth = document.getElementById("titleMonth");
		for (let i = this.tempDay-1; i < 7; i++) {
			tbody.rows[1].cells[i].innerHTML = index++;
		}
		for (let j = 2; j < 7; j++) {
			for (let z = 0; z < 7; z++) {
				if (index <= this.allDays) {
					tbody.rows[j].cells[z].innerHTML = index++;
				}
			}
		}
		titleYear.firstChild.nodeValue = this.tempYear;
		titleMonth.firstChild.nodeValue = (this.tempMonth+1);
	},

	//初始化函数，主要是清空表格中的日期显示
	init:function(){
		const tbody = document.getElementById("calendarBody");
		for(let i = 1; i < 7; i++){
			for(let j = 0; j < 7; j++){
				tbody.rows[i].cells[j].innerHTML = "";
			}
		}
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
		}else if(target == titleMonth){
			this.changeTitle(titleMonth);
			for (let i = 1; i <= 12; i++) {
				target.childNodes[i].classList.toggle("hide");
			}
		}
		titleYear.innerHTML = this.year;
		titleMonth.firstChild.nodeValue = this.month;

		this.getTimeDetail();
		this.render();
	},

	changeTitle:function(argument){
		const self = this;
		if(argument == titleMonth){//目标节点为月份
			let list = [];
			for (let i = 1; i <= 12; i++) {
				let li = document.createElement("li");
				li.innerHTML = i;
				li.value = i;
				li.className = "hide";
				list.push(li);
			}
			if(argument.childNodes.length <= 12){
				for (let i = 0; i < 12; i++) {
					argument.appendChild(list[i]);
				}
			}
			EventUtil.addHandler(argument, "click",function(event){
				event = EventUtil.getEvent(event);
				var selectLi = EventUtil.getTarget(event);
				console.log(selectLi);
				self.month = selectLi.value;
				const titleMonth = document.getElementById("titleMonth");
				console.log("第一个节点的值:"+titleMonth.firstChild.nodeValue);
				console.log("self.month:"+self.month);
				for (let i = 1; i <= 12; i++) {
					argument.childNodes[i].classList.toggle("hide");
				}
			});
		}
		console.log(this.month);
	},

}