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
const moveCollections = document.querySelector(".moveCollections");


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

    moveCollections.classList.add("optionDisabled");
    moveCollections.classList.remove("userOptions");

    // event removal - disabling the button 
    rockBtn.removeEventListener("click",functionForRock);
    paperBtn.removeEventListener("click",functionForPaper);
    scissorBtn.removeEventListener("click",functionForScissor);

    const selectedMove = document.querySelector(".selectedMove");
    const descriptionFromRobot = document.querySelector(".descriptionFromRobot");

    selectedMove.innerHTML = userMove;
    descriptionFromRobot.innerHTML = "Robot Is Thinking...";

    const robotMove = moveFromRobot();

    console.log(robotMove);

    setTimeout(()=>{
        
        switch (checkTheWinner(robotMove, userMove)) {
            case 'draw':
                flyerModel('It Was A Draw.', 'warning');
                break;
            case '1':
                flyerModel('Robot Won The Round.','failed');
                break;
            case '2':
                flyerModel('You Won The Round.', 'success');
                break;
        }
        // TODO: update score 
        // TODO: update the timeline
        // TODO: update the pics of the robot

        // to avoid clash with flyer model
        setTimeout(()=>{
            selectedMove.innerHTML = "Choose Your Move...";
            descriptionFromRobot.innerHTML = "Waiting For User Action...";
            startListeningToUserEvents();
        },1500);

    },1000);
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

    moveCollections.classList.remove("optionDisabled");
    moveCollections.classList.add("userOptions");

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
})