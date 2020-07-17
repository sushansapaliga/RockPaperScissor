const menuBtnOpen = document.querySelector("nav .menuBtn");
const menuBackground = document.querySelector(".menuBackground");
const menuContent = document.querySelector(".menuContent");
const menuBtnClose = document.querySelector(".menuHeading .menuBtn");
const bodyHTML = document.querySelector("body");
const darkModeCheckBox = document.querySelector(".darkModeCheckBox");
const changeUserNameBackground = document.querySelector(".changeUserNameBackground");
const changeUserNameSection = document.querySelector(".changeUserNameSection");
const editUserName = document.querySelector(".editUserName");
const changeUserNameForm = document.querySelector(".changeUserNameForm");
const openRequestPanel = document.querySelector(".messageNotification");
const requestPanelBackground = document.querySelector(".requestPanelBackground");
const notificationPanel = document.querySelector(".notificationPanel");
const actionModelBackgound = document.querySelector(".actionModelBackgound");
const actionModel = document.querySelector(".actionModel");
const actionModelHeader = document.querySelector(".actionModelHeader");
const actionModelBody = document.querySelector(".actionModelBody");

var onlinePlayerRequestMaker;

//check screen width is with-in acceptable range
/* code has been moved to function fetchTheTheme() */


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

    if(screen.width < 900){
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

// edit user/game name
editUserName.addEventListener("click", ()=>{

    //to close the menu drawer
    menuBtnClose.click();

    //real code .....
    changeUserNameBackground.classList.add("open");
    setTimeout(()=>{
        changeUserNameSection.classList.add("active");
    },200);
});

changeUserNameBackground.addEventListener("click", (e)=>{

    if(e.target.classList.contains("changeUserNameBackground")){
        changeUserNameSection.classList.remove("active");
        setTimeout(()=>{
            changeUserNameBackground.classList.remove("open");
        },200);
    }
});

changeUserNameForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    const userName = changeUserNameForm.userGameName.value;

    if(userName.length == 0){
        flyerModel("Cannot Set Your Game Name As Empty. Update Failed.", "failed");
        return;
    }else if(/[^A-Za-z_,!\d]/.test(userName)){
        flyerModel("Special Characters In Your Game Name. Update Failed.", "failed");
        return;
    }else if(userName.length > 20){
        flyerModel("Your Game Name Cannot Exceed More Than 20 Characters. Update Failed.", "failed");
        return;
    }

    changeUserNameBackground.click();
    setTimeout(()=>{
        actionPanelOpen("Updating", "Updating Your Game Name...");
    },200);

    const requestForNameChange = firebase.functions().httpsCallable("requestForNameChange");
    requestForNameChange({
        userName: userName
    }).then(()=>{

        // PATCH: User name is not updated even after the displayName is updated
        let user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: userName
        }).then(()=>{
            flyerModel("Successfully Updated Your Name.", "success");
            actionPanelClose();
            updateDisplayUserName();
        });
    }).catch((e)=>{
        flyerModel(e.message, "failed");
        actionPanelClose();
        editUserName.click();
    });
});

// request panel 
openRequestPanel.addEventListener("click",()=>{

    requestPanelBackground.classList.add("open");
    setTimeout(()=>{
        notificationPanel.classList.add("active");
    },200);
});

requestPanelBackground.addEventListener("click",(e)=>{

    if(e.target.classList.contains("requestPanelBackground")){
        notificationPanel.classList.remove("active");
        setTimeout(()=>{
            requestPanelBackground.classList.remove("open");
        },200);
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


//updates the user front end 
function updateDisplayUserName(){
    let user = firebase.auth().currentUser;
    
    if(user){
        let displayName = user.displayName;
        document.querySelector(".userNameMenuDisplay").innerHTML = displayName;
        document.querySelector(".userName").value = displayName;
    }
}

// challange the other player when the user press the challange 
function challengeThePlayer(userUID){
    // TODO: challange the player
}

// fetch the online players by calling the firebase-functions
function fetchOnlinePlayers(){

    const callableFunctionOnlinePlayers = firebase.functions().httpsCallable('fetchOnlinePlayers');

    callableFunctionOnlinePlayers()
    .then((players)=>{

        const onlinePlayerDisplay = document.querySelector(".onlinePlayerDisplay");

        if(players.data.length == 0){
            onlinePlayerDisplay.innerHTML = '<div class="loadingPlayers">There Are No Players Online.</div>'
        }else{
            let playerListTable = '<table><tr class="tableHeader"><th>Player Name [ Online ]</th><th> Send The Request </th></tr><tbody>';
            players.data.forEach((player)=>{
                playerListTable += '<tr><td>'
                + player.playerName 
                + '</td><td><button onclick="challengeThePlayer(\''
                // PATCH: The user ID is been exposed openly
                + player.userUID 
                +'\')"><svg width="1.1em" height="1.1em" viewBox="0 0 16 16" class="bi bi-lightning-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/></svg>Challenge</button></td></tr>'
            });
            playerListTable += '</tbody></table>';
            onlinePlayerDisplay.innerHTML = playerListTable;
        }
        onlinePlayerRequestMaker = setTimeout(fetchOnlinePlayers, 30000);
    }).catch((e)=>{
        flyerModel(e.message, "failed");
        clearInterval(onlinePlayerRequestMaker);
    });
}

// signing in new user
function signInUser(){

    firebase.auth().signInAnonymously()
    .then(()=>{
        //opens the edit the name panel
        editUserName.click();

        // PATCH: as the new user signed in cant see the game name
        let user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: 'Mr Robot'
        }).then(()=>{
            updateDisplayUserName();
        });
    });
}

// when the user is logged, show the view
function loadTheViewForUser(){
    document.querySelectorAll(".pageLoading").forEach((element)=>{
        element.classList.remove("pageLoading");
    });

    fetchOnlinePlayers();
    // TODO: create a listener for a challenge
}

// signing in users and creating a profile
firebase.auth().onAuthStateChanged((user)=>{
    
    fetchTheTheme();

    if(user){
        actionPanelClose();
        updateDisplayUserName();
        loadTheViewForUser();
    }else{
        signInUser();
    }
});