const electron = require('electron');
const { ipcRenderer } = electron;
 
const lowPass = document.getElementById("low-pass");
const midPass = document.getElementById("mid-pass");
const highPass = document.getElementById("high-pass");
const volume = document.getElementById("volume");

const lowpassLabel = document.getElementById("lowpass-label");
const lowValue = document.getElementById("low-label-value");

const testing = console.log("Mixing Connected");
let lowSpan = document.createElement("span");

const resetLabel = () => {
    // while(playlistItems.firstChild){
    //     playlistItems.removeChild(playlistItems.firstChild);
    // }
}

window.addEventListener('load', (e) => {
    lowSpan.textContent = 1000;
    // lowSpan.textContent = ipcRenderer.send("lowpasschange", e.target.value);
    lowpassLabel.appendChild(lowSpan);
    console.log(lowValue);
})

// console.log(lowLabel);

lowPass.addEventListener("change", (e) => {
    console.log(e.target.value);
    ipcRenderer.send("lowpass:change", e.target.value);
    lowSpan.textContent = e.target.value;
    lowpassLabel.appendChild(lowSpan);

})

// module.export = {testing};