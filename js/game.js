const screens = [
    `<p>email: <a href="mailto:c@ttaneo.uy">c@ttaneo.uy</a><p>
    <p>github: <a href="https://github.com/bcattaneo">github.com/bcattaneo</a><p>
    <p>Feel free to message me!</p>`,

    `<p>Hey, my name is <span class="directional">Bruno Cattáneo</span>.</p>
    <p>Press <span class="directional">◄ ►</span> to know more about me</p>`,

    `<p>I'm from <a href="https://en.wikipedia.org/wiki/Uruguay">Uruguay</a></p>
    <p>Computer engineering (CS) student.</p>
    <p>Passionate about programming in general, <br>trying to focus on low level development <br>and (recently) game development as well.</p>`
];

const carRight = `
   __
.-'--'-._
'-O---O--'`;

const carLeft = `
     __
 _.-'--'-.
'--O---O-'`;

const max = 505;
const min = 10;
const initial = 250;

let carPos = 0;
let screen = 2;

function init() {
    refreshCar(carRight, initial);
    refreshScreen(screen);
    document.addEventListener('keydown', keyDownHandler, false);
}

function refreshScreen(number) {
    let header = document.getElementById('header');
    let leftDoor = document.getElementById('left-door');
    let rightDoor = document.getElementById('right-door');
    screen = number;
    header.innerHTML = screens[number-1];
    header.classList.toggle("fadein");
    if (screen == 1) {
        leftDoor.classList.add("hide");
    } else if (screen == screens.length) {
        rightDoor.classList.add("hide");
    } else {
        leftDoor.classList.remove("hide");
        rightDoor.classList.remove("hide");
    }
}

function refreshCar(car, pos) {
    let carBox = document.getElementById('car');
    let currentCarPos = parseInt(carBox.style.marginLeft.replace("px", ""));
    currentCarPos = currentCarPos ? currentCarPos : 0;
    carBox.innerHTML = car;
    carBox.style.marginLeft = (currentCarPos + pos) + "px";
    carPos += pos;
}

function keyDownHandler(event) {
    if (event.keyCode == 39) {
        if (carPos < max) {
            refreshCar(carRight, 15);
        } else {
            if (screen < screens.length) {
                refreshScreen(screen+1)
                refreshCar(carRight, max*-1);
            }
        }
    } else if (event.keyCode == 37) {
        if (carPos > min) {
            refreshCar(carLeft, -15);
        } else {
            if (screen > 1) {
                refreshScreen(screen-1)
                refreshCar(carLeft, max);
            }
        }
    }
}