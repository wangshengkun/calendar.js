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
	this.createHiddenTable();
	this.getTimeDetail();
	this.render();

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

	//创建隐藏表单
	createHiddenTable:function(){
		const calendarTitle = document.getElementById("calendarTitle");
		const yearTable = createNode("tbody", "yearTable");
		const monthTable = createNode("tbody", "monthTable");
		const self = this;

		yearTable.classList.add("hide");
		monthTable.classList.add("hide");

		//年份表单
		for (let i = 0; i < 3; i++) {
			yearTable.insertRow(i);
			for (let j = 0; j < 5; j++) {
				yearTable.rows[i].insertCell(j);
				if(i == 0 && j == 0){
					yearTable.rows[i].cells[j].innerHTML = "<";
					yearTable.rows[i].cells[j].id = "preYear";
				}else if(i == 0 && j == 4){
					yearTable.rows[i].cells[j].innerHTML = ">";
					yearTable.rows[i].cells[j].id = "nextYear";
				}else if(i == 0 && (j != 0 || j != 4)){
					yearTable.rows[i].cells[j].classList.add("noSelect");
				}
			}
		}
		yearTable.rows[1].cells[0].id = "startYear";
		yearTable.rows[2].cells[4].id = "endYear";	

		//月份表单
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
		calendarTitle.appendChild(yearTable);
		calendarTitle.appendChild(monthTable);

		EventUtil.addHandler(yearTable, "click", function(event){
			const preYear = document.getElementById("preYear");
			const nextYear = document.getElementById("nextYear");
			const startYear = document.getElementById("startYear");
			const endYear = document.getElementById("endYear");
			event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
				if(target == preYear){		
					const index = startYear.value - 10;
					self.refreshYear(index);
				}else if(target == nextYear){
					const index = endYear.value + 1;
					self.refreshYear(index);
				}else{
					self.year = target.value;
					yearTable.classList.add("hide");
				}
			});

		EventUtil.addHandler(monthTable, "click", function(event){
			event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
			self.month = target.value;
			monthTable.classList.add("hide");
		});	
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

		//如果与当前日期相同，则添加样式
		for(let i = 1; i < 7; i++){
			for(let j = 0; j < 7; j++){
				if(this.tempYear == this.now.getFullYear() && (this.tempMonth+1) == this.now.getMonth()+1){
					if(tbody.rows[i].cells[j].innerHTML == this.date){
						tbody.rows[i].cells[j].classList.add("today");
					}
				}else{
					tbody.rows[i].cells[j].classList.remove("today");
				}
			}
		}
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
		const yearTable = document.getElementById("yearTable");
		const monthTable = document.getElementById("monthTable");
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
		}else if(target == titleYear && monthTable.classList.contains("hide")){
			this.judgeYear();
		}else if(target == titleMonth  && yearTable.classList.contains("hide")){
			monthTable.classList.toggle("hide");
		}

		titleYear.firstChild.nodeValue = this.year;
		titleMonth.firstChild.nodeValue = this.month;
		this.getTimeDetail();
		this.render();
	},

	//判断当前年份
	judgeYear:function(){
		const yearTable = document.getElementById("yearTable");
		var index;

		if(1980 <= this.year && this.year < 1990){
			index = 1980;
		}else if(1990 <= this.year && this.year < 2000) {
			index = 1990;
		}else if(2000 <= this.year && this.year < 2010) {
			index = 2000;
		}else if(2010 <= this.year && this.year < 2020) {
			index = 2010;	
		}else if(2020 <= this.year && this.year < 2030) {
			index = 2020;	
		}else{
			alert("当前年份超出限制,无法选择年份。");
			//利用return语句停止执行剩余语句
			return;
		}
			this.refreshYear(index);
			yearTable.classList.toggle("hide");	
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