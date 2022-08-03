const selectedTypeButton = document.querySelector('.type-select-box');
const typeSelectBoxList = document.querySelector('.type-select-box-list');
const typeSelectBoxListLi = typeSelectBoxList.querySelectorAll('li');
const focusOut = document.querySelector('.focusout');
const todoContentList = document.querySelector('.todo-content-list');
const sectionBody = document.querySelector('.section-body');
const incompleteCountNumber = document.querySelector('.incomplete-count-number');

let page = 1;
let totalPage = 0;

sectionBody.onscroll = () => {
	let checkNum = todoContentList.clientHeight - sectionBody.offsetHeight - sectionBody.scrollTop;
	
	if(checkNum < 1 && checkNum > -1 && page < totalPage){
		console.log(page)
		page++;
		load();
	}
}

let listType = "all";
load();

selectedTypeButton.onclick = () => {
    typeSelectBoxList.classList.toggle('visible');
    focusOut.classList.toggle('visible');
}

focusOut.onclick = () => {
    typeSelectBoxList.classList.toggle('visible');
    focusOut.classList.toggle('visible');
}

for(let i = 0; i < typeSelectBoxListLi.length; i++){
	typeSelectBoxListLi[i].onclick = () => {
		page = 1;
		
		const selectedType = document.querySelector('.selected-type');
		
		for(let j = 0; j < typeSelectBoxListLi.length; j++){
			typeSelectBoxListLi[j].classList.remove('type-selected')
		}
		typeSelectBoxListLi[i].classList.add('type-selected');
		
		listType = typeSelectBoxListLi[i].textContent.toLowerCase();
		selectedType.textContent = typeSelectBoxListLi[i].textContent;
		todoContentList.innerHTML = "";
		load();
		
		typeSelectBoxList.classList.toggle('visible');
    	focusOut.classList.toggle('visible');
	}
}


function load() {
	$.ajax({
		type: "get",
		url: `/api/v1/todolist/list/${listType}`,
		data: {
			"page": page,
			contentCount: 20
		},
		dataType: "json",
		success: (response) => {
			//console.log(JSON.stringify(response));
			getList(response.data);
		},
		error: errorMessage
	})
}

function setTotalCount(totalCount) {
	totalPage = totalCount / 20 == 0 ? totalCount / 20 : Math.floor(totalCount / 20) + 1;
}

function getList(data) {
	incompleteCountNumber.textContent = data[0].incompleteCount;
	setTotalCount(data[0].totalCount);
	for(let content of data) {
		const listContent = `
			<li class="todo-content">
                <input type="checkbox" id="complete-check-index${content.todoCode}" class="complete-check" ${content.todoComplete ? 'checked' : ''}>
                <label for="complete-check-index${content.todoCode}"><i class="fa-solid fa-check"></i></label>
                <div class="todo-content-text">${content.todo}</div>
                <input type="text" class="todo-content-input visible" value="${content.todo}">
                <input type="checkbox" id="importance-check-index${content.todoCode}" class="importance-check" ${content.importance ? 'checked' : ''}>
                <label for="importance-check-index${content.todoCode}">
                    <i class="fa-solid fa-star importance-on"></i>
                    <i class="fa-regular fa-star importance-off"></i>
                </label>
                <div class="trash-button"><i class="fa-solid fa-delete-left"></i></div>
            </li>
		`
		todoContentList.innerHTML += listContent;
	}
	
	addEvent();
}

function addEvent() {
	const todoContents = document.querySelectorAll('.todo-content')
	
	for(let i = 0; i < todoContents.length; i++){
		let todoCode = todoContents[i].querySelector('.complete-check').getAttribute("id");
		let index = todoCode.lastIndexOf("-index")
		todoCode = todoCode.substring(index + 6);
		
		todoContents[i].querySelector('.complete-check').onchange = () => {
			let incompleteCount = parseInt(incompleteCountNumber.textContent);
			
			if(todoContents[i].querySelector('.complete-check').checked){
				incompleteCountNumber.textContent = incompleteCount - 1;
			}else{
				incompleteCountNumber.textContent = incompleteCount + 1;	
			}
			
			updateCheckStatus("complete", todoContents[i], todoCode);
		}
		todoContents[i].querySelector('.importance-check').onchange = () => {
			updateCheckStatus("importance", todoContents[i], todoCode);
		}
		todoContents[i].querySelector('.trash-button').onclick = () => {
			deleteTodo(todoContents[i], todoCode);
		}
		
		const todoContentText = todoContents[i].querySelector('.todo-content-text');
		const todoContentInput = todoContents[i].querySelector('.todo-content-input');
		let todoContentValue = null;
		
		let eventFlag = true;
		
		todoContentText.onclick = (e) => {
			todoContentValue = todoContentInput.value;
			todoContentText.classList.toggle('visible');
			todoContentInput.classList.toggle('visible');
			todoContentInput.focus();
			eventFlag = true;
		}
		
		let updateTodoContent = () => {
			if(todoContentValue != todoContentInput.value){
				$.ajax({
					type: "put",
					url: `/api/v1/todolist/todo/${todoCode}`,
					contentType: "application/json",
					data: JSON.stringify({
						"todoCode" : todoCode,
						todo: todoContentInput.value
						}),
					async: false,
					dataType: "json",
					success: (response) => {
						if(response.data){
							todoContentText.textContent = todoContentInput.value
						}
					},
					error: errorMessage
				})
			}
			todoContentText.classList.toggle('visible');
			todoContentInput.classList.toggle('visible');
		}
		
		todoContentInput.onblur = () => {
			if(eventFlag){
				updateTodoContent();
			}				
		}
		todoContentInput.onkeyup = () => {
			if(window.event.keyCode == 13){
				eventFlag = false;
				updateTodoContent();
			}
		}
		
	}
}

function updateStatus(type, todoCode) {
	result = false;
	
	$.ajax({
		type: "put",
		url: `/api/v1/todolist/${type}/todo/${todoCode}`,
		async: false,
		dataType: "json",
		success: (response) => {
			result = response.data;
		},
		error: errorMessage
	})
	
	return result;
}

function updateCheckStatus(type, todoContent, todoCode) {
	let result = updateStatus(type, todoCode);
	
	if(((type == "complete" && (listType == "complete" || listType == "incomplete"))
		 || (type == "importance" && listType == "importance")) && result){
		setTimeout(function(){
		todoContentList.removeChild(todoContent);			
		}, 100)
	}
}

function deleteTodo(todoContent, todoCode) {
	$.ajax({
		type: "delete",
		url: `/api/v1/todolist/todo/${todoCode}`,
		async: false,
		dataType: "json",
		success: (response) => {
			if(response.data){
				todoContentList.removeChild(todoContent);
			}
		},
		error: errorMessage
	})
}

function errorMessage(request, status, error) {
	alert("요청 실패");
	console.log(request.staus);
	console.log(request.responseText);
	console.log(error);
}