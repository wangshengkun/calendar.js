//跨浏览器事件处理函数之延迟加载
var EventUtil = {
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

//创建节点函数
function createNode(tag, id){
	var tag = Array.prototype.shift.apply(arguments),
		dom = null;
	if(tag !== ""){
		dom = document.createElement(tag);
	}else{
		dom = document.createTextNode(tag);
	}
	dom.id = id;
	return dom;
}

//日历插件构造函数
function Calendar(){
	
	this.now = new Date();
	this.year = this.now.getFullYear();
	this.month = this.now.getMonth()+1;//切记，月份从0开始计数
	this.date = this.now.getDate();

	this.createCalendarFrame();
	this.createHiddenYear();
	this.createHiddenMonth();
	this.jumpYear();
	this.jumpMonth();
	this.judgeYear();
	this.render();
	// this.init();

	const title = document.getElementById("calendarTitle");
	const self = this;

	//利用事件委托，为每个实例的标题添加一个点击事件
	EventUtil.addHandler(title, "click", function(event){
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		self.changeDate(target);
	});
}

Calendar.prototype = {
	constructor:Calendar,

	//创建日历框架
	createCalendarFrame:function(){
		const week = ["一","二","三","四","五","六","日"];
		
		const calendar = createNode("div", "calendar");
		const title = createNode("div", "calendarTitle");
		const dateWrap = createNode("div", "dateWrap");
		const pre = createNode("a", "preMonth");
		const next = createNode("a", "nextMonth");
		const titleYear = createNode("span", "titleYear");
		const titleMonth = createNode("span", "titleMonth");
		const yearTxt = createNode("", "yearTxt");
		const monthTxt = createNode("", "monthTxt");
		const yearSign = createNode("span", "yearSign");
		const monthSign = createNode("span", "monthSign");
		const table = createNode("table", "calendarTable");
		const tbody = createNode("tbody", "calendarBody");

		//创建表格
		for(let i = 0; i < 7; i++){
			tbody.insertRow(i);
			for(let j = 0; j < 7; j++){
				tbody.rows[i].insertCell(j);
				//创建星期显示
				if(i === 0){
					tbody.rows[i].cells[j].innerHTML = week[j];
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

	//创建隐藏的年份选择表
	createHiddenYear:function(){
		const calendarTitle = document.getElementById("calendarTitle");
		const yearTable = createNode("tbody", "yearTable");

		//该部分需提炼为函数
		var year = this.year,
			yearTxt = year.toString();
		if(yearTxt[3] !== 0){
			year = year - parseInt(yearTxt[3]);
		}else{
			year = year - 10;
		}


		for (let i = 0; i < 3; i++) {
			yearTable.insertRow(i);
			for (let j = 0; j < 5; j++) {
				yearTable.rows[i].insertCell(j);
				if(i >= 1){
					yearTable.rows[i].cells[j].innerHTML = year++;
				}
			}
		}

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
		const monthTable = createNode("tbody", "monthTable");

		var index = 1;
		for(let i = 0; i < 3; i++){
			monthTable.insertRow(i);
			for(let  j = 0; j < 4; j++){
				monthTable.rows[i].insertCell(j);
				monthTable.rows[i].cells[j].value = index;
				monthTable.rows[i].cells[j].innerHTML = index;
				index++;
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

			event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
			if(target === preYear){
				const index = startYear.innerHTML - 10;
				if(index > 1970){
					self.refreshYear(index);
				}
			}else if(target === nextYear) {
				const index = parseInt(endYear.innerHTML) + 1;
				if(index < 2030){
					self.refreshYear(index);
				}
			}else{
				self.year = target.innerHTML || target.value;
				yearTable.classList.add("hide");
				self.judgeYear();
				self.render();
			}
		}

		EventUtil.addHandler(yearTable, "click", function(event){
			changeYear(event);
		});
	},

	jumpMonth:function(){
		const monthTable = document.getElementById("monthTable");
		const self = this;

		function changeMonth(event){
			event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
			self.month = target.value;
			monthTable.classList.add("hide");
		}

		EventUtil.addHandler(monthTable, "click", function(event){
			changeMonth(event);
		});
	},

	//判断平/闰年
	judgeYear:function(){
		const commonYear = [31,28,31,30,31,30,31,31,30,31,30,31];
		const leapYear = [31,29,31,30,31,30,31,31,30,31,30,31];

		function isLeapYear(){
			return this.year % 400 === 0 || (this.year % 4 === 0 && this.yrar % 100 !== 0);
		}

		if(isLeapYear()){//闰年
			this.allDays = leapYear[this.month-1];
		}else{//平年
			this.allDays = commonYear[this.month-1];
		}
	},

	//渲染函数
	render:function(){
		//清空表格中的日期显示
		(function(){
			const tbody = document.getElementById("calendarBody");
			for (let i = 1; i < 7; i++) {
				for (let j = 0; j < 7; j++) {
					tbody.rows[i].cells[j].innerHTML = "";
					tbody.rows[i].cells[j].classList.remove("today");
				}
			}
		})();

		const tempDate = new Date(this.year, this.month-1);
		var	day = tempDate.getDay();
		if(day === 0){
			day = 7;
		}

		const tbody = document.getElementById("calendarBody");
		const titleYear = document.getElementById("titleYear");
		const titleMonth = document.getElementById("titleMonth");
		var index = 1;

		for (let i = day-1; i < 7; i++) {
			tbody.rows[1].cells[i].innerHTML = index++;
		}
		for (let j = 2; j < 7; j++) {
			for (let z = 0; z < 7; z++) {
				if (index <= this.allDays) {
					tbody.rows[j].cells[z].innerHTML = index++;
				}
			}
		}

		titleYear.firstChild.nodeValue = this.year;
		titleMonth.firstChild.nodeValue = this.month;

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

		titleYear.firstChild.nodeValue = this.year;
		titleMonth.firstChild.nodeValue = this.month;

		yearTable.rows[0].cells[1].value = this.year;
		yearTable.rows[0].cells[2].value = this.year;
		yearTable.rows[0].cells[3].value = this.year;

		this.judgeYear();
		this.render();
	},

	//刷新年份表单中的年份
	refreshYear:function(index){
		const yearTable = document.getElementById("yearTable");
		yearTable.rows[0].cells[1].value = this.year;
		yearTable.rows[0].cells[2].value = this.year;
		yearTable.rows[0].cells[3].value = this.year;
		for(let i = 1; i < 3; i++){
			for(let j = 0; j < 5; j++){
				yearTable.rows[i].cells[j].value = index;
				yearTable.rows[i].cells[j].innerHTML = index;
				index++;
			}
		}
	}
}