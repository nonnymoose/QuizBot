var readytoimportquizlet = false;

function importquizlet() {
	if (! readytoimportquizlet) {
		document.querySelector(".quizlet .buttonlabel").innerText = "Go";
		document.querySelector(".quizlet .buttonoptions").style.height = "5em";
		readytoimportquizlet = true;
	}
	else {
		if (localStorage.getItem("askbeforeopen") == "true" && localStorage.getItem("quizname") && localStorage.getItem("quizdata")) {
			if (! confirm("Are sure you want to open this quiz?\nThis will overwrite your unsaved changes to " + localStorage.getItem("quizname") + ".")) {
				return;
			}
		}
		fetchQuizlet(document.querySelector(".quizlet .buttonoptions input[type=\"text\"]").value, document.querySelector(".quizlet .buttonoptions input[type=\"checkbox\"]").checked);
	}
}

var quizletxhr;
var reverse = false;

function fetchQuizlet(url, reverseall) {
	reverse = reverseall;
	quizletxhr = new XMLHttpRequest();
	quizletxhr.open("GET", "https://cors-anywhere.herokuapp.com/" + url, true);
	quizletxhr.responseType = "document";
	quizletxhr.onload = parseQuizlet;
	quizletxhr.send();
}

function parseQuizlet() {
	if (quizletxhr.readyState === quizletxhr.DONE && quizletxhr.status === 200) {
		// var parser = new DOMParser();
		// var quizletdoc = parser.parseFromString(quizletxhr.responseText, "text/xml");
		var quizletdoc = quizletxhr.responseXML;
		var quizletquiz = JSON.parse(new_template);
		var terms = quizletdoc.querySelectorAll("span.TermText");
		for (var i = 0; i < terms.length - 1; i+=2) {
			var currentQuestion = [terms[i].innerText, terms[i+1].innerText];
			if (reverse) {
				currentQuestion.reverse();
			}
			quizletquiz.questions.push(currentQuestion);
		}
		localStorage.setItem("quizname", quizletdoc.querySelector("h1.UIHeading").innerText);
		openQuiz(JSON.stringify(quizletquiz));
	}
	else {
		alert("Could not load quiz.");
		console.trace();
	}
}
