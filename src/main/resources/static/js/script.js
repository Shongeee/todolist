const selectedTypeButton = document.querySelector('.type-select-box');
const typeSelectBoxList = document.querySelector('.type-select-box-list');
const focusOut = document.querySelector('.focusout');

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


function load() {
	$.ajax({
		type: "get",
		url: `/api/v1/todolist/list/${listType}`,
		data: {
			page: 1,
			contentCount: 20
		},
		dataType: "json",
		success: (response) => {
			console.log(JSON.stringify(response));
			getList(response.data);
		},
		error: errorMessage
	})
}

function getList(data) {
	const todoContentList = document.querySelector('.todo-content-list');
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
}



function errorMessage(request, status, error) {
	alert("요청 실패");
	console.log(request.staus);
	console.log(request.responseText);
	console.log(error);
}