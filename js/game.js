const screens = [
  `<p>email: <a href="mailto:c@ttaneo.uy">c@ttaneo.uy</a><p>
    <p>github: <a href="https://github.com/bcattaneo">bcattaneo</a><p>
    <p>linkedin: <a href="https://www.linkedin.com/in/bruno-catt%C3%A1neo">bruno-cattáneo</a><p>
    <p>Feel free to message me!</p>`,

  `<p>Hey, my name is <span class="directional">Bruno Cattáneo</span>.</p>
    <p>Press <span class="directional">◄ ►</span> or click on the doors to know more about me</p>`,

  `<p>I'm from <a href="https://en.wikipedia.org/wiki/Uruguay">Uruguay</a></p>
    <p>I have a degree in <b>computer engineering</b></p>
    <p><b>MSc candidate</b> in computer science, aiming to research about programming languages and code generation.</p>
    <p>Passionate about software engineering, computer science, teaching and education.</p>`,
];

const carRight = `
   __
.-'--'-._
'-O---O--'`;

const carLeft = `
     __
 _.-'--'-.
'--O---O-'`;

const BROWSER_MAX = 505;
const BROWSER_MIN = 10;
const BROWSER_INITIAL = 250;

const PHONE_MAX = 220;
const PHONE_MIN = 10;
const PHONE_INITIAL = 115;

let max = BROWSER_MAX;
let min = BROWSER_MIN;
let initial = BROWSER_INITIAL;

let carPos = 0;
let screen = 2;

const init = () => {
  refreshCar(carRight, initial);
  refreshScreen(screen);
  document.addEventListener("keydown", keyDownHandler, false);
  document.getElementById("right-door").addEventListener("click", moveCarRight);
  document.getElementById("left-door").addEventListener("click", moveCarLeft);
};

const refreshScreen = (number) => {
  let header = document.getElementById("header");
  let leftDoor = document.getElementById("left-door");
  let rightDoor = document.getElementById("right-door");
  screen = number;
  header.innerHTML = screens[number - 1];
  header.classList.toggle("fadein");
  if (screen == 1) {
    leftDoor.classList.add("hide");
  } else if (screen == screens.length) {
    rightDoor.classList.add("hide");
  } else {
    leftDoor.classList.remove("hide");
    rightDoor.classList.remove("hide");
  }
};

const refreshCar = (car, pos) => {
  let carBox = document.getElementById("car");
  let currentCarPos = parseInt(carBox.style.marginLeft.replace("px", ""));
  currentCarPos = currentCarPos ? currentCarPos : 0;
  carBox.innerHTML = car;
  carBox.style.marginLeft = currentCarPos + pos + "px";
  carPos += pos;
};

const moveCarRight = () => {
  if (carPos < max) {
    refreshCar(carRight, 15);
  } else {
    if (screen < screens.length) {
      refreshScreen(screen + 1);
      refreshCar(carRight, max * -1);
    }
  }
};

const moveCarLeft = () => {
  if (carPos > min) {
    refreshCar(carLeft, -15);
  } else {
    if (screen > 1) {
      refreshScreen(screen - 1);
      refreshCar(carLeft, max);
    }
  }
};

const keyDownHandler = (event) => {
  if (event.keyCode == 39) {
    moveCarRight();
  } else if (event.keyCode == 37) {
    moveCarLeft();
  }
};

const restoreScreen = () => {
  carPos = 0;
  screen = 2;
  refreshScreen(screen);

  let carBox = document.getElementById("car");
  carBox.innerHTML = carRight;
  carBox.style.marginLeft = initial + "px";
  carPos += initial;
};

const switchWidth = (x) => {
  if (x.matches) {
    max = PHONE_MAX;
    min = PHONE_MIN;
    initial = PHONE_INITIAL;
    restoreScreen();
  } else {
    max = BROWSER_MAX;
    min = BROWSER_MIN;
    initial = BROWSER_INITIAL;
    restoreScreen();
  }
};

const m = window.matchMedia("(max-width: 600px)");
document.addEventListener(
  "DOMContentLoaded",
  () => {
    init();
    switchWidth(m);
  },
  false
);
m.addEventListener("change", () => switchWidth(m));
