var speed = 70,            	//this divides the count of the asterisk into 10 sections
   pixelAmount,				//number of pixels the asterisk will move
   result = 0,            	//this presets the result of point totals to zero
   gameSpeed = 300,       	//this sets gameSpeed to 300msec by default
   intTimeReset = 2,	  	//store the time reset value (seconds)
   timer = intTimeReset,  	//this initializes the clock/timer
   turnCounter = 1,       	//this variable keeps track of player's turn,
   count = 0,             	//this presets count to zero to clear variable
   direction = 1,         	//direction of asterisk
   firstLine = "<SPAN style='color:#8AE65C;'>[__]</SPAN>",      //predifines the firstLine as a variable holding the marker for points
   points = 0,            	//presets the points to zero
   maxTurns = 2,		  	//maximum number of turns per round
   currentPlayer = 1,	  	//keeps track of the current player ID
   maxPlayers = 2,		  	//maximum number of players per game
   timerID = 0,			  	//store the timer ID for setInterval so that it can be stopped later
   playerCreationCounter = 1, //keeps track of the current player being created
   randomizeMovement = 0; 	//determines the random movement value if user chooses this at the beginning of a game
   
   //players array to hold player objects (see constructor):
   var players = [];

 
/* //TEST FOR NEW GAME USING ARROW KEYS  
document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            alert('left');
            break;
        case 38:
            alert('up');
            break;
        case 39:
            alert('right');
            break;
        case 40:
            alert('down');
            break;
    }
};
*/

//set defaults on page load
function load(){
	showTimeIntervalsSelected();
}

//handle duration changed by user
function handleChangeDuration(selectedDuration){
	chooseRoundDuration();
	showTimeIntervalsSelected();
}

//handle number of players changed by user
function handlePlayerCountChanged(selectedPlayerCount){
	choosePlayerCount();
	calculateTotalGameTime();
}

//handle number of rounds changed by user
function handleRoundsChanged(selectedRounds){
	chooseGameRoundsCount();
	calculateTotalGameTime();
}

function showTimeIntervalsSelected(){
	TimeResetval1.innerHTML = intTimeReset;
	TimeResetval2.innerHTML = intTimeReset;
	calculateTotalGameTime();
}

function calculateTotalGameTime(){
	var totalDurationSeconds = 0;
	
	totalDurationSeconds = maxTurns * maxPlayers * intTimeReset;
	totalGameDuration.innerHTML = toHHMMSS(totalDurationSeconds);
}

function toHHMMSS(stringSeconds) {
    var sec_num = parseInt(stringSeconds, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}
	   
//sets the timer to the default 200 (how fast the asterisk moves)
function start() 
{
  gamePicks();
  window.setInterval( "run()", gameSpeed );
  showTimeIntervalsSelected();
  maxTurns1.innerHTML = maxTurns;
  soFar.innerText = intTimeReset;
  document.getElementById("pointTotal").disabled = true;
  
  //initialize first player's information
  initializeCurrentPlayerInformation();
}

//initializes the current players information such as color and name
function initializeCurrentPlayerInformation()
{
	//initialize current player's information:
	aCurrentPlayer.innerText = players[currentPlayer-1].playerID + ' - ' + players[currentPlayer-1].playerName;
	
	//set player's color
	aCurrentPlayer.style.color = players[currentPlayer-1].playerColor;
	pCharacter.style.color = players[currentPlayer-1].playerColor;
}

//controls the speed and direction of the asterisk
function run()
{	
	if (randomizeMovement==1)
	{
		pixelAmount = randomizeCount();
		count = pixelAmount;
	}
	else
	{
		pixelAmount = speed;
		count += pixelAmount;
		
		//if the asterisk moves 700 pixels it's time to bring it back
		if ( ( count % 700 ) == 0) {
			speed *= -1;
		}
	}		
	
	//this is the location of the asterisk relative to the left margin
	pCharacter.style.left = count;
	//displays the point's marker on the firstLine and the asterisk along w/ the points on the second
	pCharacter.innerHTML = firstLine + "<BR> <SPAN style='font-size:30px;'>*</SPAN> <SPAN style='color:#FFA319;'>Points: " + 
					count + "</SPAN>";
}
   
function randomizeCount() {
	var randomValue = 0
	
	//get random number in multiple of 70 (speed value)
	randomValue = Math.round((Math.random() * (701 - 0)+0) / 70) * 70;
	
	if (randomValue > 700)
	{
		randomValue = 700;
	}
	
	return randomValue;
}
   
//contructor for new player
function player(id, points, color, name) {
	this.playerID = id;
	this.playerPoints = points;
	this.playerColor = color;
	this.playerName = name;
}

//add new player info
function addPlayerInfo(){
	if (playerInfoValid())
	{	
		var thisPlayersName = document.getElementById('txtSelectPlayerName').value
		var thisPlayersColor = document.querySelector('input[name="selectPlayerColor"]:checked').value;
		
		//TESTING:
		//alert ('ID: ' + playerCreationCounter + ' Name: ' + thisPlayersName + ' Color: ' + thisPlayersColor);
		
		players[playerCreationCounter-1] = new player(playerCreationCounter, 0, thisPlayersColor, thisPlayersName); //create new player
				
		playerCreationCounter++; //increment player creation counter
		
		//reset form for next player's information
		document.getElementById('playerInfoID').text = playerCreationCounter;
		document.getElementById('txtSelectPlayerName').value = '';
		document.fPlayerInfo.selectPlayerColor[0].checked=true;
		
		//if max players reached, show game controls, otherwise keep showing 'next' button
		if (playerCreationCounter > maxPlayers) {
			document.getElementById("divPlayGameControls").style.display = 'inherit';
			document.getElementById("nextPlayersInfo").style.display = 'none';
			document.getElementById("divPlayerInfo").style.display = 'none';
		}
	}
	else {
		alert('Please enter a name for this player before continuing.');
	}
}

function playerInfoValid() {
	if (document.getElementById('txtSelectPlayerName').value.length > 0) {
			return true;
		}
	else {
		return false;
	}
}

function showGamePanel() {
	document.getElementById("pnlGame").style.display = 'inherit';
	document.getElementById("pnlPlayerInfo").style.display = 'none';
	start();
}

function showPlayerInfoPanel(){
	document.getElementById("pnlPlayerInfo").style.display = 'inherit';
	document.getElementById("pnlGamePicker").style.display = 'none';
}

function showGameOptions(){
	document.getElementById("pnlGamePicker").style.display = 'inherit';
	document.getElementById("pnlPlayerInfo").style.display = 'none';
}

//These next two functions deal with the points system	 
//function that runs when ONCLICK event is fired	 
function getPoints(){

	//grabs the points when the ONCLICK event is fired from the total of pixels equaling count
	var pointsTagged = count;
	
	//calls a function that adds the points to the total result
	players[currentPlayer-1].playerPoints = addPoints(pointsTagged);
	
	//this little line of code refers to the p tag below for displaying points
	Points.innerText = players[currentPlayer-1].playerPoints;	 
}

//function that adds points
function addPoints(p){
   //puts the points that were grabbed in the getPoints function into a total after adding them 
   return  p + players[currentPlayer-1].playerPoints;
}

//this function evaluates the total points of each player and sees which is the greater value to determine the winner
function determineWinner(){

	//sort players by most points scored
	players.sort(function(a, b){
	  return b.playerPoints - a.playerPoints;
	});
	
	//after sort, get the winner ID which will be the first index after sort
	var winnerID = players[0].playerID;
	var winnerName = players[0].playerName;
	var winnerColor = players[0].playerColor;
	var endingText = "player needs ";
	
	//if more than one oponent, use plural ending text
	if (players.length > 2)
	{
		endingText = "players need ";
	}
	
	winnerResults.innerText = "Player " + winnerID + ', ' + winnerName + ", is the winner!!!! Congratulations!!!! The other " + endingText + "to click faster!";
	winnerResults.style.color = winnerColor;
	playersVictoryFlag.style["background-color"] = winnerColor;
	playersVictoryName.innerHTML = winnerName;
	
	showResultsGrid();
}

//show the results for all players
function showResultsGrid() {
	//show results grid:
	for(var j=0;j<players.length;j++)
		{
			var table = document.getElementById("tblResults");
			var row = table.insertRow(-1); //inserts row in last position
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);

			cell1.innerHTML = players[j].playerID,
			cell2.innerHTML = players[j].playerName,
			cell2.style.color = players[j].playerColor,
			cell3.innerHTML = players[j].playerPoints;
		}
	
	//show results table;
	document.getElementById("resultsDIV").style.display = 'inherit';
	document.getElementById("pSecondsLeft").style.display = 'none';
}

//The next two functions deal with the player turn timer
function startTimer() {	
   // 1000 milliseconds = 1 second
   timerID = window.setInterval( "updateTime()", 1000 );
  
   document.getElementById("startTimer").disabled = true;
   document.getElementById("pointTotal").disabled = false;
   document.getElementById("pSecondsLeft").style.display = 'inherit';
}

function endGame() {
	//clear interval set during start of game
	if(timerID){
		window.clearInterval(timerID);
		timerID = null;
		aCurrentPlayer.innerText = "Game Over!";
		aCurrentPlayer.style.color = "White";
		pCharacter.style.color = "White";
		document.getElementById("pointTotal").disabled = true;
		determineWinner();
	}	
}

function changePlayer() {
	currentPlayer++; //increment current player ID
	resetPoints();

	//players[currentPlayer-1] = new player(currentPlayer, 0, 'red', 'PlayerName'); //create new player
	
	turnCounter = 1; //reset turn counter
	//aCurrentPlayer.innerText = players[currentPlayer-1].playerID; //show current player	
	initializeCurrentPlayerInformation();
}

function resetPoints() {
	//reset points
	Points.innerText = 0; 
}

function updateTime(result) {
		var endTurnMsg = "That's the end of turn ";
		timer--;
		soFar.innerText = timer;
		
	    if ( timer < 1 ){				
			//if the player has completed all turns, tell them that it is the next player's turn
			if (turnCounter >= maxTurns)
			{				
				endTurnMsg = "You have completed your maximum number of turns (" + maxTurns + ")";
				
				//end game if this is the last player
				if (currentPlayer >= maxPlayers)
				{
					endTurnMsg += "...The Game is Over.";
					
					//Determine the winner and stop timer.
					endGame();
				}
				else
				{
					changePlayer();
					endTurnMsg += "...now it's time to let the next player try. Hand the controls over to Player " + currentPlayer + " and let them give it a whirl.";		
				}
			}
			else
			{
				endTurnMsg += turnCounter;
				turnCounter++; //increment current turn
				playTurn.innerText = turnCounter;  //show current turn
			}
			
			//alert the player that it's the end of their turn or end of game
			window.alert(endTurnMsg);			
			
			//reset the timer to time reset amount - add one, to offset additional second first player gets
			timer = intTimeReset + 1;
		}
}

//restart game (reload the current document)
function restartGame(){
	var r = confirm('Are you sure you want to restart?');
	
	if (r == true) {
		location.reload();
	}	
}

//this is the bonus for picking speed and random placement of the asterisk 
function gamePicks(){
	//this prompt allows the player to choose the speed of the asterisk
	chooseGameSpeed();

	//this prompt allows the player to choose either normal placement or random placement of the the asterisk
	choosePlacement();
	
	//this prompt allows the player to choose the number of players
	choosePlayerCount()
	
	//this prompt allows the player to choose the number of rounds per player
	chooseGameRoundsCount()
	
	//this prompt allows the player to choose the length of each round
	chooseRoundDuration()
}

function chooseGameSpeed(){
	var userGameSpeed = parseInt(document.querySelector('input[name="selectGameSpeed"]:checked').value); //parseInt( window.prompt( "Set difficulty level (asterisk's speed):\n1-Normal, 2-Daring, 3-Extreme", "1" ));

	switch( userGameSpeed )
	{
		case 1: 
			gameSpeed = 300;
			break;
		case 2:
			gameSpeed = 200;
			break;
		case 3:
			gameSpeed = 100;
			break;
		default:
			gameSpeed = 300;
	}
}

function choosePlacement(){
	var randomize = parseInt(document.querySelector('input[name="selectGameType"]:checked').value); //parseInt( window.prompt( " Choose either 1-normal or 2-random placement for the asterisk", "1" ));
	
	switch( randomize )
	 {
		//This is also the default but allows the user to input as well
		case 1:
			randomizeMovement = 0;
			break;
		//this adds a random number to the pixels but keeps the numbers w/in the page borders 
		case 2:
			randomizeMovement = 1;
			break;
		 //the default setting is to leave left pixel at zero thus left aligning asterisk at the start of the game	 
		default:
			randomizeMovement = 0;
	 }
}

function choosePlayerCount(){
	var playerCount = parseInt(document.querySelector('input[name="selectPlayerCount"]:checked').value);
	maxPlayers = playerCount;
}
	
function chooseGameRoundsCount(){
	var gameRoundsCount = parseInt(document.querySelector('input[name="selectRoundCount"]:checked').value);
	maxTurns = gameRoundsCount;
}

function chooseRoundDuration(){
	var roundDuration = parseInt(document.querySelector('input[name="selectRoundDuration"]:checked').value);
	intTimeReset = roundDuration;
	timer = intTimeReset;
}