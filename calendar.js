//命名空间
var Tiro = {
	namespace:function(ns){
		var parts = ns.split("."),
		object = this,
		i, len;

		for(i = 0, len = parts.length; i < len; i++){
			if(!object[parts[i]]){
				object[parts[i]] = {};
			}
			object = object[parts[i]];
		}
		return object;
	}
};

//DOM操作函数集
Tiro.namespace("Dom");

Tiro.Dom.createNode = function(tag, id){
	var tag = Array.prototype.shift.apply(arguments),
		dom = null;
	if(tag !== ""){
		dom = document.createElement(tag);
	}else{
		dom = document.createTextNode(tag);
	}
	dom.id = id;
	return dom;
};

//事件操作函数集
Tiro.namespace("Event");

Tiro.Event = {
	addHandler:function(element, type, handler){
		if(element.addEventListener){
			addHandler = function(element, type, handler){
				element.addEventListener(type, handler, false);
			}
		}else if(element.attachEvent){
			addHandler = function(element, type, handler){
				element.attachEvent("on" + type, handler);
			}
		}else{
			addHandler = function(element, type, handler){
				element["on" + type] = handler;
			}
		}
		addHandler(element, type, handler);
	},
	removeHandler:function(element, type, handler){
		if(element.removeEventListener){
			removeHandler = function(element, type, handler){
				element.removeEventLisener(type, handler, false);
			}
		}else if(element.detachEvent){
			removeHandler = function(element, type, handler){
				element.detachEvent("on" + type, handler);
			}
		}else{
			removeHandler = function(element, type, handler){
				element["on" + type] = null;
			}
		}
		removeHandler(element, type, handler);
	},
	getEvent:function(event){
		return event ? event : window.event;
	},
	getTarget:function(event){
		return event.target || event.srcElement; 
	},
	stopPropagation:function(event){
		if(event.stopPropagation){
			stopPropagation = function(event){
				event.stopPropagation();
			}
		}else{
			stopPropagation = function(event){
				event.cancaleBubble = true;
			}
		}
		stopPropagation(event);
	},
	preventDefault:function(event){
		if(event.preventDefault){
			preventDefault = function(evnet){
				event.preventDefault();
			}
		}else{
			preventDefault = function(event){
				event.returnValue = false;
			}
		}
		preventDefault(event);
	}
};

//设计模式集
Tiro.namespace("Pattern");

//观察者模式
Tiro.Pattern.Observer = (function(){
	var clientList = {},
		listen,
		trigger,
		remove;

	listen = function(key, fn){
		if(!clientList[key]){
			clientList[key] = [];
		}
		clientList[key].push(fn);
	};

	trigger = function(){
		var key = Array.prototype.shift.call(arguments),
			fns = clientList[key];
		if(!fns || fns.length === 0){
			return false;
		}
		for(var i = 0, fn; fn = fns[i++];){
			fn.apply(this, arguments);
		}
	};

	remove = function(key, fn){
		var fns = clientList[key];
		if(!fns){
			return false;
		}
		if(!fn){
			fns && (fns.length = 0);
		}else{
			for(var l = fns.length-1; l >= 0; l--){
				var _fn = fns[l];
				if(_fn === fn){
					fns.splice(i, 1);
				}
			}
		}
	};

	return{
		listen:listen,
		trigger:trigger,
		remove:remove
	}
})();

//组件集合
Tiro.namespace("Component");

//日历组件构造函数
Tiro.Component.Calendar = function(){
	
	this.now = new Date();
	this.year = this.now.getFullYear();
	this.month = this.now.getMonth()+1;//切记，月份从0开始计数
	this.date = this.now.getDate();
	this.startYear = NaN;
	this.endYear = NaN;

	this.createCalendarFrame();
	this.createHiddenYear();
	this.createHiddenMonth();
	this.jumpYear();
	this.jumpMonth();
	this.render();

	const title = document.getElementById("calendarTitle");
	const body = document.getElementById("calendarBody");
	const self = this;

	//利用事件委托，为每个实例的标题添加一个点击事件
	Tiro.Event.addHandler(title, "click", function(event){
		event = Tiro.Event.getEvent(event);
		var target = Tiro.Event.getTarget(event);
		self.changeDate(target);
	});

	Tiro.Event.addHandler(body, "mousedown", function(event){//mousedown而不是click
		event = Tiro.Event.getEvent(event);
		var target = Tiro.Event.getTarget(event);
		self.printTime(target);
	});
}

Tiro.Component.Calendar.prototype = {
	constructor:Tiro.Component.Calendar,

	//创建日历框架
	createCalendarFrame:function(){
		const week = ["一","二","三","四","五","六","日"];
		
		const calendar = Tiro.Dom.createNode("div", "calendar");
		const calendarTitle = Tiro.Dom.createNode("div", "calendarTitle");
		const dateWrap = Tiro.Dom.createNode("div", "dateWrap");
		const pre = Tiro.Dom.createNode("button", "preMonth");
		const next = Tiro.Dom.createNode("button", "nextMonth");
		const titleYear = Tiro.Dom.createNode("span", "titleYear");
		const titleMonth = Tiro.Dom.createNode("span", "titleMonth");
		const yearTxt = Tiro.Dom.createNode("", "yearTxt");
		const monthTxt = Tiro.Dom.createNode("", "monthTxt");
		const yearSign = Tiro.Dom.createNode("span", "yearSign");
		const monthSign = Tiro.Dom.createNode("span", "monthSign");
		const table = Tiro.Dom.createNode("table", "calendarTable");
		const tbody = Tiro.Dom.createNode("tbody", "calendarBody");

		//创建表格
		for(let i = 0; i < 7; i++){
			tbody.insertRow(i);
			for(let j = 0; j < 7; j++){
				tbody.rows[i].insertCell(j);
				//创建星期显示
				if(i === 0){
					tbody.rows[i].cells[j].innerHTML = week[j];
					tbody.rows[i].cells[j].value = "";
				}
				//如果是周末则添加样式
				if(j === 5 || j === 6){
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
		calendarTitle.appendChild(pre);
		calendarTitle.appendChild(dateWrap);
		dateWrap.appendChild(titleYear);
		dateWrap.appendChild(yearSign);
		dateWrap.appendChild(titleMonth);
		dateWrap.appendChild(monthSign);
		calendarTitle.appendChild(next);
		table.appendChild(tbody);
		calendar.appendChild(calendarTitle);
		calendar.appendChild(table);
		document.body.appendChild(calendar);
	},

	//创建隐藏的年份选择表
	createHiddenYear:function(){
		const calendarTitle = document.getElementById("calendarTitle");
		const yearTable = Tiro.Dom.createNode("tbody", "yearTable");

		var startYear = Tiro.Component.Calendar.auxMethod.catchYear(this.year);

		for (let i = 0; i < 3; i++) {
			yearTable.insertRow(i);
			for (let j = 0; j < 5; j++) {
				yearTable.rows[i].insertCell(j);
				if(i >= 1){
					//初次创建年份选择表时会依据当前的时间来渲染年份
					yearTable.rows[i].cells[j].innerHTML = startYear;
					yearTable.rows[i].cells[j].value = startYear;
					startYear++;
				}
			}
		}
		//年份选择表单第一行为向前/后跳转年份，该行中部的三个元素默认赋值为当前年份，这样点击
		//该td元素时用户会单纯地认为没有刷新表单而是隐藏表单，详见jumpYear()函数
		yearTable.rows[0].cells[1].value = this.year;
		yearTable.rows[0].cells[2].value = this.year;
		yearTable.rows[0].cells[3].value = this.year;
		yearTable.rows[0].cells[1].classList.add("noSelect");
		yearTable.rows[0].cells[2].classList.add("noSelect");
		yearTable.rows[0].cells[3].classList.add("noSelect");		

		yearTable.rows[0].cells[0].innerHTML = "<";
		yearTable.rows[0].cells[0].id = "preYear";
		yearTable.rows[0].cells[4].innerHTML = ">";
		yearTable.rows[0].cells[4].id = "nextYear";
		yearTable.rows[1].cells[0].id = "startYear";
		yearTable.rows[2].cells[4].id = "endYear";

		calendarTitle.appendChild(yearTable);
		yearTable.classList.add("hide");
	},

	createHiddenMonth:function(){
		const calendarTitle = document.getElementById("calendarTitle");
		const monthTable = Tiro.Dom.createNode("tbody", "monthTable");

		var startMonth = 1;
		for(let i = 0; i < 3; i++){
			monthTable.insertRow(i);
			for(let  j = 0; j < 4; j++){
				monthTable.rows[i].insertCell(j);
				monthTable.rows[i].cells[j].value = startMonth;
				monthTable.rows[i].cells[j].innerHTML = startMonth;
				startMonth++;
			}
		}
		
		calendarTitle.appendChild(monthTable);
		monthTable.classList.add("hide");
	},

	jumpYear:function(){
		const yearTable = document.getElementById("yearTable");
		const self = this;

		function changeYear(event){  //隔离应用逻辑
			const preYear = document.getElementById("preYear");
			const nextYear = document.getElementById("nextYear");
			const startYear = document.getElementById("startYear");
			const endYear = document.getElementById("endYear");

			event = Tiro.Event.getEvent(event);
			var target = Tiro.Event.getTarget(event);
			if(target === preYear){
				const index = startYear.innerHTML - 10;
				if(index >= (self.startYear || 1970)){
					self.refreshYear(index);
				}
			}else if(target === nextYear) {
				const index = parseInt(endYear.innerHTML) + 1;
				if(index <= (self.endYear - 10 || 2020)){
					self.refreshYear(index);
				}
			}else{
				self.year = parseInt(target.innerHTML) || target.value;
				yearTable.classList.add("hide");
				self.render();
			}
		}

		Tiro.Event.addHandler(yearTable, "click", function(event){
			changeYear(event);
		});
	},

	jumpMonth:function(){
		const monthTable = document.getElementById("monthTable");
		const self = this;

		function changeMonth(event){
			event = Tiro.Event.getEvent(event);
			var target = Tiro.Event.getTarget(event);
			self.month = target.value;
			monthTable.classList.add("hide");
		}

		Tiro.Event.addHandler(monthTable, "click", function(event){
			changeMonth(event);
		});
	},

	//渲染函数
	render:function(){

		var allDays = Tiro.Component.Calendar.auxMethod.judgeYear(this.year, this.month);

		//清空表格中的日期显示
		(function(){
			const tbody = document.getElementById("calendarBody");
			for (let i = 1; i < 7; i++) {
				for (let j = 0; j < 7; j++) {
					tbody.rows[i].cells[j].innerHTML = "";
					tbody.rows[i].cells[j].value = "";
					tbody.rows[i].cells[j].classList.remove("today");
				}
			}
		})();

		//获取该月份的第一天的星期数
		const tempDate = new Date(this.year, this.month-1);
		var	day = tempDate.getDay();
		if(day === 0){
			day = 7;
		}

		const tbody = document.getElementById("calendarBody");
		const titleYear = document.getElementById("titleYear");
		const titleMonth = document.getElementById("titleMonth");
		var startDay = 1;

		for (let i = day-1; i < 7; i++) {
			tbody.rows[1].cells[i].innerHTML = startDay;
			tbody.rows[1].cells[i].value = startDay;
			startDay++;
		}
		for (let j = 2; j < 7; j++) {
			for (let z = 0; z < 7; z++) {
				if (startDay <= allDays) {
					tbody.rows[j].cells[z].innerHTML = startDay;
					tbody.rows[j].cells[z].value = startDay;
					startDay++;
				}
			}
		}

		this.changeShowTime(titleYear, this.year);
		this.changeShowTime(titleMonth, this.month);

		//如果与当前日期相同，则添加样式
		for(let i = 1; i < 7; i++){
			for(let j = 0; j < 7; j++){
				if(this.year === this.now.getFullYear() && (this.month) === this.now.getMonth()+1){
					if(parseInt(tbody.rows[i].cells[j].innerHTML) === this.date){
						tbody.rows[i].cells[j].classList.add("today");
					}
				}
			}
		}
	},

	//改变日期函数,利用事件委托来减少内存分配
	changeDate:function(target){
		const pre = document.getElementById("preMonth");
		const next = document.getElementById("nextMonth");
		const titileYear = document.getElementById("titleYear");
		const titleMonth = document.getElementById("titleMonth");
		const yearTable = document.getElementById("yearTable");
		const monthTable = document.getElementById("monthTable");

		if(target === pre){
			switch(this.month){
				case 1:
					this.year = --this.year;
					this.month = 12;
					break;
				default:
					this.month = --this.month;
			}
		}else if(target === next){
			switch(this.month){
				case 12:
					this.month = 1;
					this.year = ++this.year;
					break;
				default:
					this.month = ++this.month;
			}
		}else if(target === titleYear && monthTable.classList.contains("hide")){
			yearTable.classList.toggle("hide");
		}else if(target === titleMonth  && yearTable.classList.contains("hide")){
			monthTable.classList.toggle("hide");
		}

		this.changeShowTime(titleYear, this.year);
		this.changeShowTime(titleMonth, this.month);

		yearTable.rows[0].cells[1].value = this.year;
		yearTable.rows[0].cells[2].value = this.year;
		yearTable.rows[0].cells[3].value = this.year;

		this.render();
	},

	//刷新年份表单中的年份
	refreshYear:function(index){
		const yearTable = document.getElementById("yearTable");
		for(let i = 1; i < 3; i++){
			for(let j = 0; j < 5; j++){
				yearTable.rows[i].cells[j].innerHTML = index++;
			}
		}
	},

	changeShowTime:function(dom, time){
		dom.firstChild.nodeValue = time;
	},

	printTime:function(target){
		if(target.value !== ""){
			Tiro.Event.addHandler(target, "mousedown", function(){
				target.classList.add("click");
			});
			Tiro.Pattern.Observer.trigger("printTime", this.year, this.month, parseInt(target.innerHTML));
			Tiro.Event.addHandler(target, "mouseup", function(){
				target.classList.remove("click");
			});
		}	
	}
	
}

//专属日历组件的辅助函数集
Tiro.Component.Calendar.auxMethod = {
	//判断平/闰年
	judgeYear:function(year, month){
		const commonYear = [31,28,31,30,31,30,31,31,30,31,30,31];
		const leapYear = [31,29,31,30,31,30,31,31,30,31,30,31];
		var allDays;

		function isLeapYear(){
			return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
		}

		if(isLeapYear()){//闰年
			allDays = leapYear[month-1];
		}else{//平年
			allDays = commonYear[month-1];
		}
		return allDays;
	},

	//获取用于渲染年份选择表单的初始年份
	catchYear:function(year){
		var year = year,
			yearTxt = year.toString();
		if(yearTxt[3] !== 0){//若该年份的末尾不为0
			year -= parseInt(yearTxt[3]);
		}else{//该年份末尾为0
			year -= 10;
		}
		return year;
	},

	//判断年份是否为非零的四位整数
	yearRule:function(year){
		var yearTxt = year.toString();
		if(typeof year === "number" && year > 0 && yearTxt.length === 4 && parseInt(yearTxt[3]) === 0){
			return true;
		}
	},

	//为个位数添加十位
	addPrefix:function(time){
		if(time < 10){
			return "0" + time;
		}else{
			return time;
		}
	}
};

//专属日历组件的用户操作方法集
Tiro.Component.Calendar.User = {
	//定制年份跳转的上下限
	customizeYear:function(obj, start, end){
		var rule = Tiro.Component.Calendar.auxMethod.yearRule;
		if(rule(start) && rule(end)){
			obj.startYear = start;
			obj.endYear = end;
		}else{
			throw TypeError("参数类型必须为非零的四位正整数，且末尾必须为0");
		}
	},
	//将用户选择的时间显示在用户的指定节点上
	registerTime:function(dom, separator){
		var separator = separator || " "; 
		Tiro.Pattern.Observer.listen("printTime", function(year, month, date){
			var month = Tiro.Component.Calendar.auxMethod.addPrefix(month),
				date = Tiro.Component.Calendar.auxMethod.addPrefix(date);

			dom.value = year + separator + month + separator + date;
		});
	}
}