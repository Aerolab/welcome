const ipc = require('electron').ipcRenderer;

// Functions for top bar

// Retrieve remote BrowserWindow
const {BrowserWindow} = require('electron').remote
var config = null;

function init() {
    // Minimize task
    document.getElementById("min-btn").addEventListener("click", (e) => {
        var window = BrowserWindow.getFocusedWindow();
        window.minimize();
    });

    // Maximize window
    document.getElementById("max-btn").addEventListener("click", (e) => {
        var window = BrowserWindow.getFocusedWindow();
        if(window.isMaximized()){
            window.unmaximize();
        }else{
            window.maximize();
        }
    });

    // Close app
    document.getElementById("close-btn").addEventListener("click", (e) => {
        var window = BrowserWindow.getFocusedWindow();
        window.close();
    });

    // Pass configuration

    ipc.send('getConfig', {}); //request config

    ipc.on('receivedConfig', function(event, data) { // received config;
        config = data;
        document.querySelector('.whatsapp-link').setAttribute('data-link', data.whatsappLink);
        document.querySelector('.gitlab-link').setAttribute('data-link', data.gitlabLink);
        document.querySelector(".sketch-key").innerHTML = data.sketchKey;
        document.querySelector(".sketch-key-textarea").innerHTML = data.sketchKey;
        document.querySelector(".it-mail").innerHTML = data.itMail;
    });
    
};

document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        init();
    }
};

// Welcome Screen

const welcomeButton = document.querySelector("#welcome-button");
const welcomeWrapper = document.querySelector(".welcome");

welcomeButton.addEventListener("click", (e) => {
    welcomeWrapper.classList.add("done");
});
    
/* Slide 1 Functions */

const slideOneButton = document.querySelector("#slide-1-button");
const loadingWrapper = document.querySelector("#loading-wrapper");
const inputName = document.querySelector("#input-name");
const inputEmail = document.querySelector("#input-email");
const slideOneInputs = document.querySelectorAll(".input-slide-1");
let afterIPCSlide = null;

function checkInput(el) {
    for (let x = 0; x < slideOneInputs.length; x++) { // validates if input has content
        if( ! slideOneInputs[x].classList.contains('valid') ) {
            slideOneInputFlag = false;
            slideOneButton.className = "button orange";
            return false;
        } else {
            slideOneInputFlag = true;
        }
    }
    if( slideOneInputFlag ) { // changes button to active if all conditions are matched
        slideOneButton.className = "button orange active";
    }
}

inputEmail.addEventListener("input", function (event) {
    if (inputEmail.validity.valid) {
        inputEmail.classList = "input input-slide-1 valid"; // Reset the visual state of the message
        checkInput();
    } else {
        inputEmail.classList = "input input-slide-1 error"; // Reset the visual state of the message
    }
}, false);

inputName.addEventListener("input", function (event) {
    if (inputName.validity.patternMismatch) {
        inputName.classList = "input input-slide-1 error"; // Reset the visual state of the message
    } else {
        inputName.classList = "input input-slide-1 valid"; // Reset the visual state of the message
        checkInput();
    }
}, false);

// Change Slides fuction

function showHint(slide) {
    let robi = document.querySelector('.robi-hint-wrapper');
    let robiContent = document.querySelector('.robi-hint-content');
    robi.className = 'robi-hint-wrapper';

    setTimeout(function(){
        if( slide.dataset.robi ) {
            robi.className += ' hint-active';
            if( slide.dataset.robiContent ) {
                robiContent.innerHTML = slide.dataset.robiContent;
            }
        }
    }, 750);
    
}

const allButtons = document.querySelectorAll('.button');

for (i = 0; i < allButtons.length; ++i) {
    allButtons[i].addEventListener("click", function(e) {

        let activeSlide = this.closest('.slide');
        let nextSlide = activeSlide.nextSibling.nextSibling;
        let prevSlide = activeSlide.previousSibling.previousSibling;

        if( this.classList.contains('next-button') ) { // go forward a slide
            activeSlide.className = "slide";
            nextSlide.className += ' active';
            showHint(nextSlide);
        }

        if( this.classList.contains('back-button') ) { // go backward a slide
            activeSlide.className = "slide";
            prevSlide.className += ' active';
            showHint(prevSlide);
        }

        if( this.classList.contains('active') && this.id == 'slide-1-button' ) { // sends data to IPC, ads loading, changes slide
            loadingWrapper.className += " active";
            activeSlide.className = "slide";
            nextSlide.className += ' active';
            document.querySelector('.robi-hint-wrapper').className = 'robi-hint-wrapper';
            ipc.send('setUserInfo', { name: inputName.value, email: inputEmail.value });
            afterIPCSlide = nextSlide;
        }

        if( this.id == 'button-finish' ) { // endes process
            var window = BrowserWindow.getFocusedWindow();
            window.close();
        }

        if( this.classList.contains('destiny-button') ) {
            this.closest('.slide').className = "slide";
            document.querySelector('#final-slide').className += ' active';
            document.querySelector('.robi-hint-wrapper').className = 'robi-hint-wrapper';
        }

    });
}

/* Slide 2 Functions */

const publicKeyContent = document.querySelector("#public-key");
const publicKeyTextarea = document.querySelector(".public-key-textarea");

ipc.on('setUserInfoReady', function(event, arg) { // removes loading wrapper when ready, activates slide two and sets public key
    loadingWrapper.className = 'loading-wrapper';
    publicKeyContent.innerHTML = arg.publicKey;
    publicKeyTextarea.innerHTML = arg.publicKey;
    showHint(afterIPCSlide);
});

/* Copy Public KEY */

const publicKeyCopy = document.querySelector(".public-key-copy");

publicKeyCopy.addEventListener("click", (e) => { // copies public key to clipboard
    publicKeyTextarea.select();
    document.execCommand('copy');
    publicKeyTextarea.blur();
});

/* Copy Sketch KEY */

const sketchKeyCopy = document.querySelector(".sketch-key-copy");
const sketchKeyTextarea = document.querySelector(".sketch-key-textarea");

sketchKeyCopy.addEventListener("click", (e) => { // copies sketch key to clipboard
    sketchKeyTextarea.select();
    document.execCommand('copy');
    sketchKeyTextarea.blur();
});

// Open Links

const standardLink = document.querySelectorAll(".standard-link");

for (i = 0; i < standardLink.length; ++i) {
    standardLink[i].addEventListener("click", function(e) {
        let data = this.dataset.link;
        ipc.send('openLink', data );
    });
}

// Choose your destiny

const chooseItem = document.querySelectorAll('.choose-your-destiny-item');

for (i = 0; i < chooseItem.length; ++i) {
    chooseItem[i].addEventListener("click", function(e) {
        let data = this.dataset.destiny;
        this.closest('.slide').className = 'slide';
        let slide = null;
        if ( data == 'designer' ) {
            slide = document.querySelector('#designer-slide')
        } else if ( data == 'dev' ) {
            slide = document.querySelector('#dev-slide');
        } else {
            slide = document.querySelector('#final-slide');
        }
        showHint(slide);
        slide.className += ' active';
    });
}