import {random} from "./fieldHTML.js";

document.getElementById("menuPlayBtn").addEventListener("click", () => {
    window.location.href = './game.html?l=1';
});
document.getElementById("menuLevelBtn").addEventListener("click", () => {
    window.location.href = './levels.html';
});

let title = document.getElementById("title");
title.classList.add(`titleColor${random(6,1)}`);