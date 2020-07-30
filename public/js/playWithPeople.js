const menuBtnOpen = document.querySelector("nav .menuBtn");
const menuBackground = document.querySelector(".menuBackground");
const menuContent = document.querySelector(".menuContent");
const menuBtnClose = document.querySelector(".menuHeading .menuBtn");
const bodyHTML = document.querySelector("body");
const darkModeCheckBox = document.querySelector(".darkModeCheckBox");
const actionModelBackgound = document.querySelector(".actionModelBackgound");
const actionModel = document.querySelector(".actionModel");
const actionModelHeader = document.querySelector(".actionModelHeader");
const actionModelBody = document.querySelector(".actionModelBody");

const playerContainer = document.querySelector(".playerContainer");
const opponentContainer = document.querySelector(".opponentContainer");
const playerMoveSection = document.querySelector(".playerMoveSection");
const rockBtn = document.querySelector("#rock");
const paperBtn = document.querySelector("#paper");
const scissorBtn = document.querySelector("#scissor");

const realTimeDatabase = firebase.database();
var gameDetails;
var gameDetailsListerner;
var waitingForAnotherPlayerListener;

var playerRole = '';
var roundsPlayed = 0;
var autoUserChooseTimer;

// menu drawer
menuBtnOpen.addEventListener("click",()=>{

    menuBackground.classList.add("open");
    setTimeout(()=>{
        menuContent.classList.add("active");
    }, 200);
});

menuBtnClose.addEventListener("click", ()=>{

    menuContent.classList.remove("active");
    setTimeout(()=>{
        menuBackground.classList.remove("open");
    },200);
});

menuBackground.addEventListener("click", (e)=>{

    if(e.target.classList.contains("menuBackground")){
        menuContent.classList.remove("active");
        setTimeout(()=>{
            menuBackground.classList.remove("open");
        },200);
    }
});

// theme of the page
function fetchTheTheme(){

    const mode = localStorage.getItem("rockpaperscissor-sushan");

    if(screen.width < 1000){
        bodyHTML.innerHTML = 'Cannot display the contents because of smaller screen size. Switch to desktop view for better experience.';
    }

    if(mode == "lightMode"){
        bodyHTML.classList.remove("dark");
        bodyHTML.classList.add("light");
    }else if(mode == "darkMode"){
        darkModeCheckBox.checked = true;
    }else{
        localStorage.setItem("rockpaperscissor-sushan", "darkMode");
        darkModeCheckBox.checked = true;
    }
}

darkModeCheckBox.addEventListener("change", ()=>{

    if(darkModeCheckBox.checked){
        bodyHTML.classList.remove("light");
        bodyHTML.classList.add("dark");
        localStorage.setItem("rockpaperscissor-sushan", "darkMode");
    }else{
        bodyHTML.classList.remove("dark");
        bodyHTML.classList.add("light");
        localStorage.setItem("rockpaperscissor-sushan", "lightMode");
    }
});

//action panel handler
function actionPanelOpen(heading, body){

    actionModelHeader.innerHTML = heading;
    actionModelBody.innerHTML = body;
    actionModelBackgound.classList.add("open");
    setTimeout(()=>{
        actionModel.classList.add("active");
    },200);
}

function actionPanelClose(){

    actionModel.classList.remove("active");
    setTimeout(()=>{
        actionModelBackgound.classList.remove("open");
        actionModelHeader.innerHTML = "";
        actionModelBody.innerHTML = "";
    },200);
}

// flyer handler
function flyerModel(message, status){
    const flyerBody = document.querySelector(".flyerBody");
    document.querySelector(".flyerMessage").innerHTML = message;

    flyerBody.classList.add(status);
    flyerBody.classList.add("open");
    setTimeout(()=>{
        flyerBody.classList.remove("open");
        setTimeout(()=>{
            flyerBody.classList.remove(status);
            document.querySelector(".flyerMessage").innerHTML = "";
        },200);
    },3000);
}

//updates the user front end name
function updateDisplayUserName(){
    let user = firebase.auth().currentUser;
    
    if(user){ 
        document.querySelector(".userNameMenuDisplay").innerHTML = user.displayName;
    }
}

// return the winner
function checkTheWinner(player1, player2) {
    
    if(player1 == player2){
        return 'draw';
    }else if((player1 == "Rock" && player2 == "Paper") || (player1 == "Paper" && player2 == "Scissor") || (player1 == "Scissor" && player2 == "Rock")){
        return '2';
    }else{
        return '1';
    }
}

// event binding helper functions
function functionForRock(){
    userChooseMove('Rock');
}

function functionForPaper(){
    userChooseMove('Paper');
}

function functionForScissor(){
    userChooseMove('Scissor');
}

// start the user moves
function startListeningToUserMove(){

    playerMoveSection.classList.remove("optionDisabled");
    playerMoveSection.classList.add("userOptions");

    //event binder
    rockBtn.addEventListener("click",functionForRock);
    paperBtn.addEventListener("click",functionForPaper);
    scissorBtn.addEventListener("click",functionForScissor);
}

// stop the user moves 
function stopListeningToUserMove(){

    playerMoveSection.classList.remove("userOptions");
    playerMoveSection.classList.add("optionDisabled");

    // event removal - disabling the button 
    rockBtn.removeEventListener("click",functionForRock);
    paperBtn.removeEventListener("click",functionForPaper);
    scissorBtn.removeEventListener("click",functionForScissor);
    
}

// when user choose the move
async function userChooseMove(userMove){

    stopListeningToUserMove();

    clearInterval(autoUserChooseTimer);

    playerContainer.innerHTML = '<img src="images/'+ userMove +'.png" alt="'+ userMove +'">'

    roundsPlayed ++;
    let userMoveForm = {};
    userMoveForm['lastMoveTime'] = Date.now();
    userMoveForm['move/'+roundsPlayed+'/'+ playerRole] = userMove;

    await gameDetails.update(userMoveForm);
}

// if the user doesnt choose any move within 14sec the computer will play on behlaf of him
function autoChooseForUser(){
    
    autoUserChooseTimer = setTimeout(()=>{

        let autoMove = Math.random()*100;

        if(autoMove > 66){
            userChooseMove('Rock');
        }else if( autoMove > 33){
            userChooseMove('Paper');
        }else{
            userChooseMove('Scissor');
        }

        flyerModel('Round Timeout. Computer Made Move For You.', 'warning');
    },14000);
}

// start the game once the both the player is logged in 
function startTheGame(){

    gameDetailsListerner = gameDetails.on('value',(snapShot)=>{

        stopListeningToUserMove();

        let opponentRole;
        let val = snapShot.val();
        const user = firebase.auth().currentUser;

        // set the opponent's name 
        let opponentName ;

        if(val.players.host.uid == user.uid){
            playerRole = 'host';
            opponentRole = 'receiver';
            opponentName = val.players.receiver.name;
        }else if(val.players.receiver.uid == user.uid){
            playerRole = 'receiver';
            opponentRole = 'host';
            opponentName = val.players.host.name;
        }

        // opponent's name - update the front end
        document.querySelector(".opponentName").innerHTML = opponentName;

        // get the number of rounds
        if(val.move == null){
            roundsPlayed = 0;
        }else{
            roundsPlayed = val.move.length-1;
        }

        // get the count of the move - val.move[roundsPlayed].length diesnt work
        let moveDictLength = 0;
        if(roundsPlayed != 0){
            for(key in val.move[roundsPlayed]){
                moveDictLength ++;
            }
        }

        // initial game set up - the first game
        if(roundsPlayed == 0){

            playerContainer.classList.add("changeTheBackgound");
            playerContainer.classList.remove("moveSelectedByThePlayer");

            opponentContainer.classList.add("changeTheBackgound");
            opponentContainer.classList.remove("moveSelectedByThePlayer");

            startListeningToUserMove();
            autoChooseForUser();

        }

        // start listening when the other player has made his move or we did a move 
        if( roundsPlayed!=0 && val.move[roundsPlayed][playerRole] == null && moveDictLength == 1){

            opponentContainer.innerHTML = '<div>Player Has Made The Move.</div>';
            opponentContainer.classList.remove("changeTheBackgound");
            opponentContainer.classList.add("moveSelectedByThePlayer");

            roundsPlayed --;

            startListeningToUserMove();

        }else if(roundsPlayed!=0 && val.move[roundsPlayed][playerRole] != null && moveDictLength == 1){

            playerContainer.innerHTML = '<img src="images/'+ val.move[roundsPlayed][playerRole] +'.png" alt="'+ val.move[roundsPlayed][playerRole] +'">';
            playerContainer.classList.remove("changeTheBackgound");
            playerContainer.classList.add("moveSelectedByThePlayer");
        }

        // when both players have made the move, display the results and start a new game
        if(roundsPlayed!=0 && moveDictLength == 2){
            
            // display the results
            playerContainer.innerHTML = '<img src="images/'+ val.move[roundsPlayed][playerRole] +'.png" alt="'+ val.move[roundsPlayed][playerRole] +'">';
            playerContainer.classList.remove("changeTheBackgound");
            playerContainer.classList.add("moveSelectedByThePlayer");

            opponentContainer.innerHTML = '<img src="images/'+ val.move[roundsPlayed][opponentRole] +'.png" alt="'+ val.move[roundsPlayed][opponentRole] +'">';
            opponentContainer.classList.remove("changeTheBackgound");
            opponentContainer.classList.add("moveSelectedByThePlayer");

            switch( checkTheWinner( val.move[roundsPlayed][opponentRole], val.move[roundsPlayed][playerRole])){
                case "draw":
                    document.querySelector('.lastRoundState').innerHTML = 'It Was A Draw.';
                    break;
                case "1":
                    document.querySelector('.lastRoundState').innerHTML = 'Opponent Won The Round.';
                    break;
                case "2":
                    document.querySelector('.lastRoundState').innerHTML = 'You Won The Round.';
                    break;
            }

            // update the timeline and score of the player
            let timelineString = '<table>';
            let numberOfRounds = roundsPlayed;
            let displayCount = 3;
            let playerScore = 0;
            let opponentScore = 0;

            while(numberOfRounds != 0){

                let winnerPlayer = checkTheWinner(val.move[numberOfRounds][opponentRole], val.move[numberOfRounds][playerRole]);

                if(winnerPlayer == '1'){
                    opponentScore ++;
                }else if(winnerPlayer == '2'){
                    playerScore ++;
                }

                if(displayCount !=0){

                    let currentGameRoundStr = '<tr><td>'+ numberOfRounds +'.</td>';

                    switch(winnerPlayer){
                        case 'draw':
                            currentGameRoundStr += '<td><img src="images/'+ val.move[numberOfRounds][playerRole] +'.png" alt="'+ val.move[numberOfRounds][playerRole] +'"></td>';
                            currentGameRoundStr += '<td>-</td>';
                            currentGameRoundStr += '<td><img src="images/'+ val.move[numberOfRounds][opponentRole] +'.png" alt="'+ val.move[numberOfRounds][opponentRole] +'"></td>';
                            break;
                        case '1':
                            currentGameRoundStr += '<td><img src="images/'+ val.move[numberOfRounds][playerRole] +'.png" alt="'+ val.move[numberOfRounds][playerRole] +'"></td>';
                            currentGameRoundStr += '<td>-</td>';
                            currentGameRoundStr += '<td><img class="highlight" src="images/'+ val.move[numberOfRounds][opponentRole] +'.png" alt="'+ val.move[numberOfRounds][opponentRole] +'"></td>';
                            break;
                        case '2':
                            currentGameRoundStr += '<td><img class="highlight" src="images/'+ val.move[numberOfRounds][playerRole] +'.png" alt="'+ val.move[numberOfRounds][playerRole] +'"></td>';
                            currentGameRoundStr += '<td>-</td>';
                            currentGameRoundStr += '<td><img src="images/'+ val.move[numberOfRounds][opponentRole] +'.png" alt="'+ val.move[numberOfRounds][opponentRole] +'"></td>';
                            break;
                    }

                    currentGameRoundStr += '</tr>';
                    timelineString += currentGameRoundStr;

                    displayCount --;
                }

                numberOfRounds --;
            }

            timelineString += '</table>';

            // update the front end with timeline and players score
            document.querySelector('.timelineDetails').innerHTML = timelineString;
            document.querySelector('.playerScore').innerHTML = playerScore;
            document.querySelector('.opponentScore').innerHTML = opponentScore;

            // start a new game
            setTimeout(()=>{

                playerContainer.innerHTML = '<div>Waiting For Your Move...</div>';
                playerContainer.classList.add("changeTheBackgound");
                playerContainer.classList.remove("moveSelectedByThePlayer");

                opponentContainer.innerHTML = '<div>Player Is Thinking...</div>';
                opponentContainer.classList.add("changeTheBackgound");
                opponentContainer.classList.remove("moveSelectedByThePlayer");

                startListeningToUserMove();
                autoChooseForUser();

            },3000);
        }

    });
}

function getTheDetailsForGame(){

    const getGameDetail = firebase.functions().httpsCallable('getGameDetails');
    getGameDetail()
    .then((details)=>{
        
        waitingForAnotherPlayerListener = firebase.firestore().collection("gameDetails")
        .doc(details.data.docID)
        .onSnapshot((snapShot)=>{

            if(snapShot.data().status == "playing"){
                gameDetails = realTimeDatabase.ref('gameDetails/'+ snapShot.data().keyPath);

                // stop the listener
                waitingForAnotherPlayerListener();

                document.querySelectorAll(".pageLoading").forEach((element)=>{
                    element.classList.remove("pageLoading");
                });

                startTheGame();
                actionPanelClose();

            }else{
                actionPanelOpen('Waiting','Waiting For Opponent To Join Game...');
            }
        });

    }).catch((e)=>{
        window.location.replace("index.html");
    });
}

// only signed in user is allowed - else redirect the new user to index page
firebase.auth().onAuthStateChanged((user)=>{

    if(user){
        
        fetchTheTheme();
        updateDisplayUserName();
        getTheDetailsForGame();
    }else{
        window.location.replace("index.html");
    }
});