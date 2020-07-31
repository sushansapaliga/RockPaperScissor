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
var listenerForChallenges;
var challangeRequestMaker;

const db = firebase.firestore();

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

    const userName = changeUserNameForm.userGameName.value.trim();

    if(userName.length == 0){
        flyerModel("Cannot Set Your Game Name As Empty. Update Failed.", "failed");
        return;
    }else if(/[^A-Za-z_,!\d\s]/.test(userName)){
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

// challenge the other player when the user press the challenge 
function challengeThePlayer(userUID){

    clearInterval(onlinePlayerRequestMaker);
    listenerForChallenges();
    clearInterval(challangeRequestMaker);

    actionPanelOpen("Sending","Sending Request To The Player...");

    const invitePlayerToGameFunction = firebase.functions().httpsCallable("invitePlayerToGame");
    invitePlayerToGameFunction({
        userUID: userUID
    }).then((doc)=>{

        const docID = doc.data;
        actionPanelOpen("Waiting","Waiting For Player To Accept The Challenge...");

        let waitingRequest = db.collection('requestDetails').doc(docID)
        .onSnapshot((doc)=>{
            if( doc.data().gameStatus == "accepted"){
                window.location.replace("playWithPeople.html");
            }
        });

        // if the request is not accepted, restart the normal process
        setTimeout(()=>{
            waitingRequest();
            actionPanelClose();
            flyerModel('Player Didnt Accept The Challenge.');

            // restart the normal process
            fetchOnlinePlayers();
            lookForChallenges();
        }, 30000);
    }).catch((e)=>{
        flyerModel(e.message, "failed");
        fetchOnlinePlayers();
        lookForChallenges();
    });
}

// accept the challenge request
function acceptChallangeRequest(docID){

    requestPanelBackground.click();

    clearInterval(onlinePlayerRequestMaker);
    listenerForChallenges();
    clearInterval(challangeRequestMaker);

    actionPanelOpen("Accepting","Accepting The Challenge...");
    
    const acceptTheChallenge = firebase.functions().httpsCallable("acceptTheChallenge");
    acceptTheChallenge({
        docID: docID
    }).then(()=>{
        window.location.replace("playWithPeople.html");
    }).catch((e)=>{
        flyerModel(e.message, "failed");
        fetchOnlinePlayers();
        lookForChallenges();
    });
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
                // PATCH: The user ID is been exposed openly - possible solution Vue JS [working on it]
                + player.userUID 
                +'\')"><svg width="1.1em" height="1.1em" viewBox="0 0 16 16" class="bi bi-lightning-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/></svg>Challenge</button></td></tr>'
            });
            playerListTable += '</tbody></table>';
            onlinePlayerDisplay.innerHTML = playerListTable;
        }
        onlinePlayerRequestMaker = setTimeout(fetchOnlinePlayers, 30000);
    }).catch((e)=>{

        // PATCH : callable the function after 2 secs once all user related docs are settled
        onlinePlayerRequestMaker = setTimeout(fetchOnlinePlayers, 2000);

        // PATCH: When a new user signed in there is a error thrown from firebase function - Working a way around.
        // Error: user personalised doc is not found.
        // Resource: https://firebase.google.com/docs/functions/firestore-events#limitations_and_guarantees
        //console.log(e.message);
        //flyerModel(e.message, "failed");
        //clearInterval(onlinePlayerRequestMaker);
    });
}

// a listener function 
function lookForChallenges(){
    let time = Date.now();
    let user = firebase.auth().currentUser;

    listenerForChallenges = db.collection("requestDetails")
    .where("requestGameTime",">=",(time-30000))
    .where("gameStatus", "==", "waiting")
    .where("players.receiver.uid", "==", user.uid)
    .limit(20)
    .onSnapshot((snapShot)=>{

        let count = 0;
        let tableList = '<table><tr><th>Player Name</th><th>Challenge Request</th></tr>';

        snapShot.forEach((doc)=>{

            count++;
            tableList += '<tr><td>' 
            + doc.data().players.host.name
            +'</td><td><button onclick="acceptChallangeRequest(\''
            + doc.id
            + '\')"><svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-plus" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/><path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"/></svg>Accept</button></td></tr>';
        });

        tableList += "</table>";

        document.querySelector(".notifier .messageNotification span").innerHTML = count;

        if(count == 0){

            document.querySelector(".noDataToShow").classList.add("show");
            document.querySelector(".showPlayerWhoChallenged").classList.remove("show");
            document.querySelector(".showPlayerWhoChallenged").innerHTML = tableList;
        }else{

            document.querySelector(".noDataToShow").classList.remove("show");
            document.querySelector(".showPlayerWhoChallenged").classList.add("show");
            document.querySelector(".showPlayerWhoChallenged").innerHTML = tableList;
            flyerModel("Someone Has Challenged You!", "warning")
        }

    },(e)=>{
        flyerModel(e.message, "failed");
        listenerForChallenges();
    });

    challangeRequestMaker = setTimeout(()=>{
        listenerForChallenges();
        lookForChallenges();
    }, 30000);
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
    lookForChallenges();
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