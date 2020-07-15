const menuBtnOpen = document.querySelector("nav .menuBtn");
const menuBackground = document.querySelector(".menuBackground");
const menuContent = document.querySelector(".menuContent");
const menuBtnClose = document.querySelector(".menuHeading .menuBtn");
const bodyHTML = document.querySelector("body");
const darkModeCheckBox = document.querySelector(".darkModeCheckBox");
const changeUserNameBackground = document.querySelector(".changeUserNameBackground");
const changeUserNameSection = document.querySelector(".changeUserNameSection");
const editUserName = document.querySelector(".editUserName");
const openRequestPanel = document.querySelector(".messageNotification");
const requestPanelBackground = document.querySelector(".requestPanelBackground");
const notificationPanel = document.querySelector(".notificationPanel");
const actionModelBackgound = document.querySelector(".actionModelBackgound");
const actionModel = document.querySelector(".actionModel");
const actionModelHeader = document.querySelector(".actionModelHeader");
const actionModelBody = document.querySelector(".actionModelBody");

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

// edit user details/name
editUserName.addEventListener("click", ()=>{

    //to close the menu drawer
    menuContent.classList.remove("active");
    setTimeout(()=>{
        menuBackground.classList.remove("open");
    },200);

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

//updates the user front end 
function updateDisplayUserName(){
    var user = firebase.auth().currentUser;
    
    if(user){
        var displayName = user.displayName;
        document.querySelector(".userNameMenuDisplay").innerHTML = displayName;
        document.querySelector(".userName").value = displayName;
    }
}

// signing in new user
function signInUser(){

    firebase.auth().signInAnonymously()
    .then(()=>{
        //opens the edit the name panel
        editUserName.click();

        var user = firebase.auth().currentUser;

        user.updateProfile({
            displayName: 'Mr Robot'
        }).then(()=>{
            updateDisplayUserName();
        });
    });
}

// signing in users and creating a profile
firebase.auth().onAuthStateChanged((user)=>{
    
    fetchTheTheme();

    if(user){
        actionPanelClose();
        // TODO: show proper view 
        // TODO: set user name 
        updateDisplayUserName();
    }else{
        signInUser();
    }

});