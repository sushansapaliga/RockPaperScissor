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

const rockBtn = document.querySelector("#rock");
const paperBtn = document.querySelector("#paper");
const scissorBtn = document.querySelector("#scissor");
const playerMoveSection = document.querySelector(".playerMoveSection");
const lastRoundState = document.querySelector(".lastRoundState");

var playerScore = 0;
var robotScore = 0;

var timeline = []; 
var gameCount = 0;


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

function updateTimeline(robotMove, userMove){

    gameCount ++;

    let currentGameStr = '<tr><td>'+ gameCount +'.</td>';

    switch (checkTheWinner(robotMove, userMove)) {
        case 'draw':
            currentGameStr += '<td><img src="images/'+ userMove +'.png" alt="'+ userMove +'"></td>';
            currentGameStr += '<td>-</td>';
            currentGameStr += '<td><img src="images/'+ robotMove +'.png" alt="'+ robotMove +'"></td>';
            break;
        case '1':
            currentGameStr += '<td><img src="images/'+ userMove +'.png" alt="'+ userMove +'"></td>';
            currentGameStr += '<td>-</td>';
            currentGameStr += '<td><img class="highlight" src="images/'+ robotMove +'.png" alt="'+ robotMove +'"></td>';
            break;
        case '2':
            currentGameStr += '<td><img class="highlight" src="images/'+ userMove +'.png" alt="'+ userMove +'"></td>';
            currentGameStr += '<td>-</td>';
            currentGameStr += '<td><img src="images/'+ robotMove +'.png" alt="'+ robotMove +'"></td>';
            break;
    }

    currentGameStr += "</tr>";

    if(timeline.length > 2){
        timeline.reverse().pop();
        timeline = timeline.reverse();
    }

    timeline.push(currentGameStr);

    let tableTimeLine = '<table>';

    for(let i =timeline.length-1 ; i>=0; i--){
        tableTimeLine += timeline[i];
    }

    tableTimeLine += '</table>';

    document.querySelector(".timelineDetails").innerHTML = tableTimeLine;

}

// find the move from the robot
function moveFromRobot(){

    let move = Math.random()*100;

    if(move > 66){
        return 'Rock';
    }else if(move > 33){
        return 'Paper';
    }else{
        return 'Scissor';
    }

}

// fires when user selects an option
function userChooseMove(userMove){

    playerMoveSection.classList.add("optionDisabled");
    playerMoveSection.classList.remove("userOptions");

    // event removal - disabling the button 
    rockBtn.removeEventListener("click",functionForRock);
    paperBtn.removeEventListener("click",functionForPaper);
    scissorBtn.removeEventListener("click",functionForScissor);

    document.querySelector(".playerContainer").innerHTML = '<img src="images/'+ userMove +'.png" alt="'+ userMove +'" title="'+ userMove +'">';
    document.querySelector(".robotContainer").innerHTML = "Opponent Is Thinking...";

    const robotMove = moveFromRobot();

    setTimeout(()=>{

        document.querySelector(".robotContainer").innerHTML = '<img src="images/'+ robotMove +'.png" alt="'+ robotMove +'" title="'+ robotMove +'">';
        
        switch (checkTheWinner(robotMove, userMove)) {
            case 'draw':
                lastRoundState.innerHTML = "It Was A Draw.";
                break;
            case '1':
                lastRoundState.innerHTML = "Robot Won The Round.";
                robotScore ++;
                break;
            case '2':
                lastRoundState.innerHTML = "You Won The Round.";
                playerScore ++;
                break;
        }

        updateTimeline(robotMove, userMove);
        // TODO: update the state of the robot

        startListeningToUserEvents();

    },1500);
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

//add eventlistener to buttons
function startListeningToUserEvents(){

    playerMoveSection.classList.remove("optionDisabled");
    playerMoveSection.classList.add("userOptions");

    // set the scores of the score board
    document.querySelector(".playerScore").innerHTML = playerScore;
    document.querySelector(".robotScore").innerHTML = robotScore;

    //event binder
    rockBtn.addEventListener("click",functionForRock);
    paperBtn.addEventListener("click",functionForPaper);
    scissorBtn.addEventListener("click",functionForScissor);
}

//updates the user front end 
function updateDisplayUserName(){
    let user = firebase.auth().currentUser;
    
    if(user){ 
        document.querySelector(".userNameMenuDisplay").innerHTML = user.displayName;
    }
}


// check if user is authenticated - if not redirect the user to home page
firebase.auth().onAuthStateChanged((user)=>{

    fetchTheTheme();

    if(user){

        document.querySelectorAll(".pageLoading").forEach((element)=>{
            element.classList.remove("pageLoading");
        });

        startListeningToUserEvents();
        actionPanelClose();
        updateDisplayUserName();
    }else{
        window.location.replace("index.html");
    }
});