/*
Nadia Kazi, 
The purpose of this file is to produce a page that produces the some of the most
popular boy and girl name for cildren born in US for each gender. The page displays 
the most popular baby names, popularity ranking, meaning and a list celebraty names 
that matches the given first name.   
*/

"use strict";
window.onload = function()  {
	// outputs the a drop down list consist of all the baby names on file in alphabetical order  
	ajaxRequest("list", undefined, undefined, namelistSuccessFunction, ajaxFailure);
	$("search").observe("click", fetchData);
};

// the function gets called whenever the user click the search button. It allows the user to do
// subsequent search by clearing out the previous name from the screen.    
function fetchData() {
	var name = $("allnames").value;
	if(name) {
		$("resultsarea").show();
		$("loadingmeaning").show();
		$("loadinggraph").show();
		$("loadingcelebs").show();
		$("norankdata").hide();
		$("meaning").innerHTML = "";	// clear out any child elements from the particular area
		$("graph").innerHTML = "";
		$("celebs").innerHTML = "";
		
		// calls the ajaxRequest method and outputs the meaning of the selected name  
		ajaxRequest("meaning", name, undefined, meaningSuccessFunction, ajaxFailure);
		
		// calls the ajaxRequest method and outputs the popularity ranking of the baby name
		ajaxRequest("rank", name, checkGender(), rankingSuccessFunction, graphFailure);
		
		// calls the ajaxRequest method and outputs any celebraty name with that baby's firstname
		ajaxRequest("celebs", name, checkGender(), celebsSuccessFunction, ajaxFailure);
	}
}

// it takes dataType, childName, childGender, myAjaxSuccessFunction, and ajaxFailureOne as
// parameters and makes an ajax request whenever the search button gets clicked.  
function ajaxRequest(dataType, childName, childGender, myAjaxSuccessFunction, myAjaxFailure) {	
	new Ajax.Request("https://webster.cs.washington.edu/cse190m/babynames.php", {
		method: "get",
		parameters: {type: dataType, name: childName, gender: childGender},
		onSuccess: myAjaxSuccessFunction,
		onFailure: myAjaxFailure,
		onException: myAjaxFailure
	});
}

// checks if the user checked the gender male or female and returns it.
function checkGender() {
	if($("genderm").checked) {
		return $("genderm").value;
	} else {
		return $("genderf").value;
	}	
}

// outputs the name list into a drop down list
function namelistSuccessFunction(ajax) {
	$("loadingnames").hide();
	
	var lists = ajax.responseText.split("\n");
	for(var i = 0; i < lists.length; i++) {
		var optionTag = document.createElement("option"); 
		optionTag.innerHTML = lists[i];
		$("allnames").appendChild(optionTag);	
	}
	$("allnames").disabled = false;	
}

// outputs the meaning of the given baby name 
function meaningSuccessFunction(ajax) {
	$("loadingmeaning").hide();
	$("meaning").innerHTML = ajax.responseText;
}

// it outputs the given baby name's popularity rank in each decade. 
// the output data produces 12 ranking for each name starting from 
// 1900 to 2010 from 1(popular) to 999(unpopular). A rank of 0 means
// the name was not on the top 1000.  
function rankingSuccessFunction(ajax) {
	$("loadinggraph").hide(); // hides the loading 
	
	var ranking = ajax.responseXML.getElementsByTagName("rank");
	var trTagOne = document.createElement("tr");
	var trTagTwo = document.createElement("tr");	//creates two tr tags
	
	for(var i = 0; i < ranking.length; i++) {
		
		var year = ranking[i].getAttribute("year");	
		var rankValue = ranking[i].firstChild.nodeValue;
		var th = document.createElement("th");	// creates the tag elements
		var td = document.createElement("td");
		var div = document.createElement("div");
		
		th.innerHTML = year;	// inserts the year inside the th tag 
		trTagOne.appendChild(th);	// adds the th inside tr tag
		div.innerHTML = rankValue;	// inserts the rankvalue inside the div tag
		td.appendChild(div);
		trTagTwo.appendChild(td);
		
		// checks if the ranke value is grater than 0 if so then it sets the height.  
		if(rankValue != 0) {
			div.style.height = parseInt(1 / 4 * (1000 - rankValue)) + "px";
		} else {
			div.style.height = rankValue + "px";	// otherwise sets the height to 0
		}
		
		// creates a class if the rating is between 1 through 10 inclusive 	
		if(rankValue <= 10 && rankValue > 0) {
			div.addClassName("rankPopular");
		}	
	}
	$("graph").appendChild(trTagOne);		// adds the tags to the table  
	$("graph").appendChild(trTagTwo);
}

// outputs a list of actors who have the same first name as the given baby name.
// if there is no actor found with that first name then it stays blank    
function celebsSuccessFunction(ajax) {
	$("loadingcelebs").hide();	// hides the loading image
	
	var data = JSON.parse(ajax.responseText);
	for(var i = 0; i < data.actors.length; i++) {
		var li = document.createElement("li");	// creates the buletted list  
		// inserts the actors first and last name and the number of  films they did
		li.innerHTML = data.actors[i].firstName + " " + data.actors[i].lastName +
			" (" + data.actors[i].filmCount + " films)";	 
		$("celebs").appendChild(li);
	}
}

// the method checks if the error is 410 if so then it outputs the no rankdata massage 
function graphFailure(ajax, exception) {
	$("loadinggraph").hide();

	if(ajax.status == 410) {
		$("norankdata").show(); 		
	} else {
		ajaxFailure(ajax, exception);
	}
}

// For any other kids of error such as error 404 etc, the method outputs 
// a massage explaning the error that occured.  
function ajaxFailure(ajax, exception) {
	$("loadingnames").hide(); 
	$("loadingmeaning").hide(); 
	$("loadingcelebs").hide();
		
	$("errors").innerHTML = "Error making Ajax request:" + 
		"\n\nServer status:\n" + ajax.status + " " + ajax.statusText + 
		"\n\nServer response text:\n" + ajax.responseText;

	if (exception) {
		throw exception;
	}	
}	

