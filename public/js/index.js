const menuBtnOpen = document.querySelector("nav .menuBtn");
const menuBackground = document.querySelector(".menuBackground");
const menuContent = document.querySelector(".menuContent");
const menuBtnClose = document.querySelector(".menuHeading .menuBtn");
const bodyHTML = document.querySelector("body");
const darkModeCheckBox = document.querySelector(".darkModeCheckBox");

//check screen width with in acceptable range
/* code has been moved to function fetchTheTheme */


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

    console.log(e.target.classList);

    if(!( e.target.classList.length == 0 
        || e.target.classList.contains('menuContent')
        || e.target.classList.contains('menuHeading')
        || e.target.classList.contains('menuUserRelated')
        || e.target.classList.contains('userSetting')
        || e.target.classList.contains('settingHeading')
        || e.target.classList.contains('darkModeText')
        || e.target.classList.contains('round')
        || e.target.classList.contains('darkModeCheckBox')
        )){
        menuContent.classList.remove("active");
        setTimeout(()=>{
            menuBackground.classList.remove("open");
        },200);
    }
});

// theme of the page
function fetchTheTheme(){

    const mode = localStorage.getItem("rockpaperscissor-sushan");

    if(screen.width < 700){
        bodyHTML.innerHTML = 'Cannot display the contents because of smaller screen size. Switch to desktop view for better experience.';
    }

    if( mode == null){
        localStorage.setItem("rockpaperscissor-sushan", "darkMode");
        darkModeCheckBox.checked = true;
    }else if(mode == "lightMode"){
        bodyHTML.classList.remove("dark");
        bodyHTML.classList.add("light");
    }else if(mode == "darkMode"){
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