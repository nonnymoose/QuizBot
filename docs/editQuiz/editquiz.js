var defaults = {
	"shuffle": false,
	"reversable": false,
	"time": 10,
	"penalty": 50,
	"case": false,
	"otherchars": ""
}
var questionHtml = '<h2>Question</h2><div contenteditable class="qtext" oninput="updateqtext(this)"></div><h2>Answer<span class="help">?⃝<span class="tooltip">Supports regular expressions between "//". <a href="https://regular-expressions.info" target="_blank">Learn regular expressions</a></span></span></h2><div contenteditable class="answer" oninput="updateqtext(this)"></div><span class="settings-toggle button" onclick="expandthis(this)">Additional Options <span class="dropdown-arrow">›</span></span><div class="settings" style="height:0;"><span class="setting boolean" data-property="reversable"><input type="checkbox" oninput="update(this)" />Reversable<span class="help">?⃝<span class="tooltip">Whether or not the questions and answers should be randomly switched (good for Quizlets).</span></span></span><span class="setting number" data-property="time">Time<input type="number" oninput="update(this)" /><span class="help">?⃝<span class="tooltip">How much time the player is given to answer the question.</span></span></span><span class="setting number" data-property="penalty">Penalty<input type="number" oninput="update(this)" /><span class="help">?⃝<span class="tooltip">How many points to deduct for an incorrect answer.</span></span></span><span class="setting boolean" data-property="case"><input type="checkbox" oninput="update(this)" />Case Sensitive<span class="help">?⃝<span class="tooltip">Whether or not the answer is <a href="https://en.wikipedia.org/wiki/Case_sensitivity">case-sensitive</a>.</span></span></span><span class="setting text" data-property="otherchars">Ignore Characters<input type="text" oninput="update(this)" /><span class="help">?⃝<span class="tooltip">Symbols/characters to ignore in the response (ex. spaces). No seperator required.</span></span></span></div><div class="add button" onclick="addq(this)">✚</div><div class="delete button" onclick="deleteq(this)">🗑</div>'
//should be the innerHTML of a single <div class="question">

var quiz;

// for now, just document.write it all
try {
	quiz = JSON.parse(localStorage.getItem("quizdata"));
	if (! quiz.quizbot_valid || ! quiz.description || ! (quiz.questions.length >= 0)) {
		// not a valid quiz!
		error("Invalid quiz. If this file was homemade, did you remember to set <code>quizbot_valid</code>?");
	}
} catch (e) {
	error("Could not load quiz!!!<br>\nLike, at all!");
}

document.title = "Editing " + localStorage.getItem("quizname");
// var mainsettings = document.querySelector(".content .settings").children.slice(2);
var mainsettings = Array.prototype.slice.call(document.querySelector(".content .settings").children, 2);
document.querySelector(".content .settings h1 input").value = localStorage.getItem("quizname");
document.querySelector(".content .settings h1 div").innerText = quiz.description;

for (var i in defaults) {
	if (quiz[i] == undefined) {
		quiz[i] = defaults[i];
	}
}

for (var i = 0; i < mainsettings.length; i++) {
	if (mainsettings[i].children[0].type == "checkbox") {
		mainsettings[i].children[0].checked = quiz[mainsettings[i].dataset.property];
	}
	else {
		mainsettings[i].children[0].value = quiz[mainsettings[i].dataset.property];
	}
}

if (quiz.questions.length < 1) {
	addq(null, true); // workaround to get it to insert the first question
	quiz.questions = [["", "", {}]];
}
else {
	// load all of the pre-existing questions
	for (var i = 0; i < quiz.questions.length; i++) {
		addq(null, true, quiz.questions[i]);
	}
}
save();

function error(description) {
	document.querySelector("div.overlay").style.display = "initial";
	document.querySelector("div.error p.error").innerHTML = description;
	window.setTimeout(returnHome, 5000);
}

function returnHome() {
	window.location = "../index.html";
}

function expandthis(element) {
	if (element.dataset.expanded == "true") {
		// recede
		element.dataset.expanded = "false";
		element.children[0].style.transform = "rotate(0deg)";
		element.nextElementSibling.style.height = "0";
	}
	else {
		//expand
		element.dataset.expanded = "true";
		element.children[0].style.transform = "rotate(90deg)";
		element.nextElementSibling.style.height = "10em";
	}
}

function changeName(element) {
	localStorage.setItem("quizname", element.value);
	document.title = "Editing " + localStorage.getItem("quizname");
}

function changeDesc(element) {
	quiz.description = element.innerText;
	save();
}

function chomp(text) {
	if (text[text.length - 1] == "\n") {
		return text.slice(0, -1);
	}
	else {
		return text;
	}
}

function updateDefaults() {
	var questions = document.querySelectorAll("div.question");
	for (var i = 0; i < questions.length; i++) {
		var settings = questions[i].children[5].children;
		for (var j = 0; j < settings.length; j++) {
			if (quiz.questions[i][2][settings[j].dataset.property] == undefined) {
				var element = settings[j].children[0];
				if (element.type == "checkbox") {
					element.checked = quiz[settings[j].dataset.property];
				}
				else {
					element.value = quiz[settings[j].dataset.property];
				}
			}
		}
	}
}

function update(element) {
	var newSetting;
	if (element.type == "checkbox") {
		newSetting = element.checked;
	}
	else if (element.type == "number") {
		if (element.value == "") {
			element.value = 0;
		}
		newSetting = parseFloat(element.value);
		element.value = parseFloat(element.value);
	}
	else {
		newSetting = element.value;
	}
	if (element.parentElement.parentElement.parentElement.classList.contains("content")) {
		//top-level settings
		quiz[element.parentElement.dataset.property] = newSetting;
		updateDefaults();
	}
	else if (element.parentElement.parentElement.parentElement.classList.contains("question")) {
		//question-level settings
		var thisqIndex = Array.prototype.indexOf.call(element.parentElement.parentElement.parentElement.parentElement.children, element.parentElement.parentElement.parentElement) - 1;
		if (quiz[element.parentElement.dataset.property] == newSetting) {
			// back to default, delete property
			delete(quiz.questions[thisqIndex][2][element.parentElement.dataset.property]);
		}
		else {
			quiz.questions[thisqIndex][2][element.parentElement.dataset.property] = newSetting;
		}
	}
	else {
		alert("Unexpected error");
		console.trace();
	}
	save();
}

function updateqtext(element) {
	var thisqIndex = Array.prototype.indexOf.call(element.parentElement.parentElement.children, element.parentElement) - 1;
	quiz.questions[thisqIndex][0] = chomp(element.parentElement.children[1].innerText);
	quiz.questions[thisqIndex][1] = chomp(element.parentElement.children[3].innerText);
	save();
}

function addq(element, append, qobj) {
	var thisqIndex;
	if (append != undefined && append) {
		thisqIndex = null;
	}
	else {
		append = false;
		thisqIndex = Array.prototype.indexOf.call(element.parentElement.parentElement.children, element.parentElement) - 1;
	}
	if (qobj != undefined && qobj[2] == undefined) {
		qobj.push({});
	}
	var newq = document.createElement("div");
	newq.classList.add("question");
	newq.innerHTML = questionHtml;
	var theseSettings = newq.children[5].children;
	if (qobj != undefined) {
		newq.children[1].innerText = qobj[0];
		newq.children[3].innerText = qobj[1];
	}
	// set all additional options to quiz defaults/what was provided
	for (var i = 0; i < theseSettings.length; i++) {
		var newSetting;
		if (qobj != undefined && qobj[2][theseSettings[i].dataset.property] != undefined) {
			newSetting = qobj[2][theseSettings[i].dataset.property];
		}
		else {
			newSetting = quiz[theseSettings[i].dataset.property];
		}
		if (theseSettings[i].children[0].type == "checkbox") {
			theseSettings[i].children[0].checked = newSetting;
		}
		else {
			theseSettings[i].children[0].value = newSetting;
		}
	}
	if (append) {
		// special case
		document.querySelector(".content").appendChild(newq);
		// do not add anything to quiz.questions because it's likely already there
	}
	else {
		element.parentElement.parentElement.insertBefore(newq, element.parentElement.nextElementSibling);
		quiz.questions.splice(thisqIndex + 1, 0, ["", "", {}]);
	}
	save();
}

function deleteq(element) {
	if (confirm("Are you sure you want to delete this question?\n(I press the button by accident a lot.)")) {
		if (document.querySelectorAll(".question").length <= 1) {
			alert("You can't delete the only question.");
		}
		else {
			var thisqIndex = Array.prototype.indexOf.call(element.parentElement.parentElement.children, element.parentElement) - 1;
			element.parentElement.outerHTML = "";
			quiz.questions.splice(thisqIndex, 1);
		}
	}
	save();
}

function save() {
	localStorage.setItem("quizdata", JSON.stringify(quiz));
	localStorage.setItem("askbeforeopen", "true");
}

function saveas() {
	var dlblob = new Blob([JSON.stringify(quiz)], {"type": "application/octet-stream"});
	var dla = document.getElementById("dla");
	dla.href = URL.createObjectURL(dlblob);
	dla.download = localStorage.getItem("quizname") + ".json";
	dla.click();
	localStorage.setItem("askbeforeopen", "false");
}
