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

//updates the user front end 
function updateDisplayUserName(){
    let user = firebase.auth().currentUser;
    
    if(user){ 
        document.querySelector(".userNameMenuDisplay").innerHTML = user.displayName;
    }
}




// below code is just for reference - TODO: later will be deleted

// experment - ignore 
/*
var listn ;
var count = 0;
var role = 'host';
var isPlayAble = true;

const database = firebase.database();
const gameDetails = database.ref('gameDetails/testingBranch');

function startTheListener(){

    listn = gameDetails.on('value', (snapShot)=>{

        let val = snapShot.val();
        console.log(val);

        let user = firebase.auth().currentUser;

        // get the role
        if(val.players.host.uid == user.uid){
            role = 'host';
        }else if(val.players.receiver.uid == user.uid){
            role = 'receiver';
        }

        // get the count
        if(val.move == null){
            count = 0;
        }else{
            count = val.move.length - 1;
        }

        // get the count of the move - val.move[count].length diesnt work
        let moveDictLength = 0;

        if(count != 0){
            for(key in val.move[count]){
                moveDictLength ++;
            }
        }

        // is the play yours
        if( (count != 0) && (moveDictLength != 2) && (val.move[count][role] != null)){
            isPlayAble = false;
        }else{
            isPlayAble = true;
            if( count!= 0 && val.move[count][role] == null && (moveDictLength != 2)){
                count--;
            }
        }

        console.log(isPlayAble);

    });

}

async function makeTheMove(){

    if(!isPlayAble){
        alert('Not allowed');
        return;
    }

    count ++;
    let updateForm = {};

    // updateForm[role] = 'Rock';
    // await database.ref('gameDetails/testingBranch/move/'+ count).update(updateForm);

    // detach from the listner
    // gameDetails.off('value', listn);

    updateForm['lastMoveTime'] = Date.now();
    updateForm['move/'+ count + '/' + role] = 'Rock';

    await gameDetails.update(updateForm);

    console.log('done');
}
*/