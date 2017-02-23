document.addEventListener( 'DOMContentLoaded', function () {
    exsitsHistory();
   document.getElementById("movie-compare").onclick = function(event){
   		event.preventDefault();
   		btnListener();
   }
   document.getElementsByClassName("clear_result")[0].onclick = function(){
   		clearResult();
   }
   document.getElementsByClassName("clear_result")[1].onclick = function(){
   		clearResult();
   }
}, false );

function btnListener(){
	var title1 = document.getElementById("title1").value;
	var title2 = document.getElementById("title2").value;
	movie1 = title1.trim();
	movie2 = title2.trim();
	var apiMovie1;
	var apiMovie2;
	document.getElementsByClassName("result-director")[0].innerHTML = "";
	document.getElementsByClassName("result-actor")[0].innerHTML = "";
	document.getElementsByClassName("no-result")[0].style.display = "none";
	var res = true;
	

	var validateMovie1 = movieValidate(movie1, 1);
	var validateMovie2 = movieValidate(movie2, 2);
	if(validateMovie1 == true && validateMovie2 == true){
		var storedItem = getFromHistory(movie1, movie2);
		if(storedItem){
			apiMovie1 = storedItem.apiMovie1;
			apiMovie2 = storedItem.apiMovie2;
		}
		else{
			apiMovie1 = apiConnect(movie1);
			apiMovie2 = apiConnect(movie2);
			res = apiMovie1.result == 'True' && apiMovie2.result == 'True';
			if(res){
				updateHistory(movie1, movie2, apiMovie1, apiMovie2 );
			}
		}
		
		if(res){
			compareResult(apiMovie1, apiMovie2, movie1, movie2, false);
			
		}else{
			document.getElementsByClassName("no-result")[0].innerHTML = 'Coś poszło źle. Być może nie mamy tego filmu w bazie danych.';
			document.getElementsByClassName("no-result")[0].style.display = 'block';
		}
	}
}


function movieValidate(movie, nr){
	var result = false;
	var nameReg = /^[-_ . ! a-zA-Z0-9]+$/;
	
	if(!movie){
		document.getElementById("error-title"+nr).style.display = 'block';
		document.getElementById("error-title"+nr).innerHTML ="Pole nie może być puste";
		result = false;
	}else if(movie && !nameReg.test(movie)){
		document.getElementById("error-title"+nr).style.display = 'block';
		document.getElementById("error-title"+nr).innerHTML = "Czy dobrze wpisałeś tytuł?"
		result = false;
	}
	else{
		document.getElementById("error-title"+nr).style.display = 'none';
		result = true;
	}
	
	return result;
}

function apiConnect(movie){
	var name = movie.replace(/\s+/g, '+');

	var result;
	
	var url = 'http://www.omdbapi.com/?t='+name+'&y=&plot=short&r=json';

	var request = new XMLHttpRequest();
	request.open('GET', url, false);

	request.onload = function() {
	 	 if (request.status >= 200 && request.status < 400) {
	    	var data_tmp = request.response;
	    	var data = JSON.parse(data_tmp);
	    	if(data.Response  == "True"){
				director_tmp = data.Director;
				director = director_tmp.split(', ');
				actors_tmp = data.Actors;
				actors = actors_tmp.split(', ');
				result = {director: director, actors: actors, result: data.Response};
			}else{
				result = {result: data.Response, error: "data.Error"};
			}
	  	} else {
	  		var data = request.response;
		    console.log(request.responseText);
			result = {result: data.Response, error: data.Error};
	  	}
	};

	request.onerror = function() {
	  	result = {result: data.Response, error: "data.Error"};
	};

	request.send();
	return result;

}

function compareResult(apiMovie1, apiMovie2, movie1, movie2, notclick){
	var result_director = false;
	var result_actor = false;
	var i;
	var director;
	var actors;

	
	var resultDirector = [];
	for(var i=0; i < apiMovie1.director.length; ++i){
		var director = apiMovie1.director[i];
		if (apiMovie2.director.indexOf(director) > -1) {
				resultDirector.push(director);	
		};
	}

	var resultActor = [];
	for(var i=0; i < apiMovie1.actors.length; ++i){
		var actors = apiMovie1.actors[i];
		if (apiMovie2.actors.indexOf(actors) > -1) {
				resultActor.push(actors);	
		};
	}

	if(notclick == false){
		if(resultDirector.length >0){
			setTimeout(function(){
				document.getElementsByClassName("result-director ")[0].innerHTML = 'Reżyser: ' + resultDirector;
				document.getElementsByClassName("result-director")[0].style.display = 'block';
			}, 500);
			result_director = true;
		}

		if(resultActor.length >0){
			setTimeout(function(){
				document.getElementsByClassName("result-actor")[0].innerHTML = 'Aktorzy: ' + resultActor;
				document.getElementsByClassName("result-actor")[0].style.display = 'block';
			}, 500);
			result_actor = true;
		}
		if(result_director == false && result_actor == false){
			document.getElementsByClassName("result-director")[0].style.display = 'none';
			document.getElementsByClassName("result-actor")[0].style.display = 'none';
			setTimeout(function(){
				document.getElementsByClassName("no-result")[0].style.display = 'block';
			}, 500);
		}else{
			document.getElementsByClassName("no-result")[0].style.display = 'none';
		}
		document.getElementsByClassName("clear_result")[0].style.display = 'block';

	}
	setLocalStorage(resultDirector, resultActor, movie1, movie2);
}

function setLocalStorage(resultDirector, resultActor, movie1, movie2){
	localStorage.setItem("director", resultDirector);
	localStorage.setItem("actor", resultActor);
	localStorage.setItem("movie1", movie1);
	localStorage.setItem("movie2", movie2);
	
	var tmp_id = localStorage.getItem('lastID');
	var director = localStorage.getItem('director');
	var actor = localStorage.getItem('actor');
	var movie1 = localStorage.getItem('movie1');
	var movie2 = localStorage.getItem('movie2');
	
	showResult();
	

}

function getHistory(){
	var item = localStorage.getItem('history');
	if(item == null) { return {}; }
	return JSON.parse(item);
}

function createHistoryId(movie1, movie2){
	return  movie1.toLowerCase() + '_' + movie2.toLowerCase();
}

function updateHistory(movie1, movie2, apiMovie1, apiMovie2 ){
	var history = getHistory();
	var searchId = createHistoryId(movie1, movie2);
	history[searchId] = {apiMovie1: apiMovie1, apiMovie2: apiMovie2, movie1: movie1, movie2: movie2};
	var item = JSON.stringify(history);
	return localStorage.setItem('history', item);
}

function getFromHistory(movie1, movie2){	
	var history = getHistory();
	var searchId = createHistoryId(movie1, movie2);
	return history[searchId];
}


function showResult(){
	var director = localStorage.getItem('director');
	var actor = localStorage.getItem('actor');
	var movie1 = localStorage.getItem('movie1');
	var movie2 = localStorage.getItem('movie2');
	
	var resultDirector = false;
	var resultActor = false;
	
	var row = document.createElement('tr');
	var th = document.createElement('th');
	//th.setAttributeNode(att);
	
	row.appendChild(th);
	th.innerHTML = movie1 + " oraz " + movie2;
	var table = document.getElementById("history-table");
	table.appendChild(th);
	
	if(director){
		var tr = document.createElement('tr');
		var td1 = document.createElement('td');
		tr.appendChild(td1);
		td1.innerHTML = 'Reżyser: ' + director;
		var table = document.getElementById("history-table");
		table.appendChild(tr);
		resultDirector = true;
	}
		
	if(actor){
		var tr = document.createElement('tr');
		var td1 = document.createElement('td');
		tr.appendChild(td1);
		td1.innerHTML = 'Obsada: ' + actor;
		var table = document.getElementById("history-table");
		table.appendChild(tr);
		resultActor = true;
	}
	
	if(resultDirector == false && resultActor == false){
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		tr.appendChild(td);
		td.innerHTML = '----';
		var table = document.getElementById("history-table");
		table.appendChild(tr);
	}
}

function exsitsHistory(){
	var history = getHistory();
	if(history){
		for (var id in history) {      
			if (history.hasOwnProperty(id)){
				compareResult(history[id].apiMovie1,  history[id].apiMovie2, history[id].movie1, history[id].movie2, 150);
			}
		}
	}
	
	var isEmptyObj = isEmpty(history);
	if(isEmpty == true){
		document.getElementsByClassName("clear_result")[0].style.display = 'none';
	}else{
		document.getElementsByClassName("clear_result")[1].style.display = 'block';
	}
	
}

function clearResult(){
	localStorage.clear();
	location.reload();
}

function isEmpty(obj) { 
   	for (var x in obj) { 
   		return false; 
   	}
   return true;
}

