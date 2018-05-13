var new_template = '{"quizbot_valid": true, "description": "New Quiz", "questions": []}'

function openQuiz(contents) {
	localStorage.setItem("quizdata", contents);
	window.location = "editQuiz/editquiz.html";
}

function readSingleFile(e) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	if (localStorage.getItem("askbeforeopen") == "true" && localStorage.getItem("quizname") && localStorage.getItem("quizdata")) {
		if (! confirm("Are sure you want to open this quiz?\nThis will overwrite your unsaved changes to " + localStorage.getItem("quizname") + ".")) {
			return;
		}
	}
	var singleFilename = file.name;
	singleFilename = singleFilename.replace(/\.json$/, "");
	localStorage.setItem("quizname", singleFilename);
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		openQuiz(contents);
	};
	reader.readAsText(file);
}

function newQuiz() {
	localStorage.setItem("quizname", "New Quiz");
	openQuiz(new_template);
}

document.querySelector("input[type=file]").addEventListener("change", readSingleFile);
document.querySelector("input[type=file]").value = "";

if (localStorage.getItem("quizname") && localStorage.getItem("quizdata")) {
	document.querySelector(".button.hidden").children[1].innerHTML = localStorage.getItem("quizname");
	document.querySelector(".button.hidden").classList.remove("hidden");
}
