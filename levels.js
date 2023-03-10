import {LevelArray} from "./levelArray.js";

/* Navigation */
document.getElementById('homeBtn').addEventListener("click", () => {
    window.location.replace("./menu.html");
});

let levelCount = LevelArray.length-1;

let levelGrid = document.createElement("div");
levelGrid.style.display = "flex";
levelGrid.style.flexFlow = "row wrap";
levelGrid.style.justifyContent = "flex-start";
levelGrid.style.alignContent = "space-between";
levelGrid.style.maxHeight = "80vh";
levelGrid.style.maxWidth = "80vw";
levelGrid.style.overflowY = "auto";

for (let i = 1; i <= levelCount; i++) {
    let lvlBtn = document.createElement("button");
    lvlBtn.classList.add("uiBtn");
    lvlBtn.classList.add("levelBtn");
    lvlBtn.innerHTML = `${i}`;
    lvlBtn.addEventListener("click", () => {
        window.location.replace(`./game.html?l=${i}`);
    });
    levelGrid.appendChild(lvlBtn);
}

document.getElementById("globalDiv").appendChild(levelGrid);