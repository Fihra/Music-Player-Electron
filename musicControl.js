const {electron, ipcRenderer } = require("electron");
// const fs = require("fs");
const Song = require("./Song.js").Song;

const audioFile = document.getElementById("audio-file")
const fileUploadForm = document.getElementById("file-upload");

const playlistContainer = document.getElementById("playlist-container");
const playlistItems = document.getElementById("playlist-items");

const nowPlayingContainer = document.getElementById("now-playing-container");
const nowPlayingSong = document.getElementById("now-playing");

const previous = document.getElementById("previous-btn");
const play = document.getElementById("play-btn");
const stop = document.getElementById("stop-btn");
const next = document.getElementById("next-btn");

const fileContainer = document.getElementById("fileContainer");
const audioElement = document.querySelector("audio");

const audioCanvas = document.getElementById("audio-spectrum");
const canvasContext = audioCanvas.getContext('2d');

const playlist = [];

let currentSong = new Audio();
let currentIndex = 0;
let isPlaying = false;

let audioContext = new AudioContext();
let track;
let analyser;
let bufferLength;
let dataArray;

// analyser.fftSize = 2048;
// let bufferLength = analyser.frequencyBinCount;
// let dataArray = new Uint8Array(bufferLength);
// analyser.getByteTimeDomainData(dataArray);

// const draw = () => {
//     let drawVisual = requestAnimationFrame(draw);
//     analyser.getByteTimeDomainData(dataArray);
    
//     audioCa
// }

// let buffer;

// fileContainer.addEventListener("drag", (e) => {
//     e.preventDefault();
//     console.log(e);
// })

/*TODO Features
=== Cursor on NOW PLAYING
=== Time Length of NOW PLAYING
=== SHUFFLE
=== REPEAT
=== AUDIO SPECTRUM/VISUALIZER OF SONG
=== SCROLL AROUND AUDIO SPECTRUM

=== Control Playback Speed
=== Loop Certain Sections (*Start Section *End Section)
===
*/

const resetPlaylist = () => {
    while(playlistItems.firstChild){
        playlistItems.removeChild(playlistItems.firstChild);
    }
}

const changeSongSource = (num) => {
    audioElement.src = playlist[num].source;
}

const showCurrentSongPlaying = () => {
    nowPlayingSong.textContent = playlist[currentIndex].name;
    nowPlayingContainer.appendChild(nowPlayingSong);
}

const playTrack = () => {
    track.connect(audioContext.destination);
    audioElement.play();
}

const showPlaylist = () => {
    if(playlist.length === 0) return;
    resetPlaylist();
    for(let i=0; i < playlist.length; i++){
        const songContainer = document.createElement("div");
        const songElement = document.createElement("li");
        songElement.textContent = playlist[i].name;
 
        songContainer.addEventListener("click" , () =>{
            console.log(songElement.textContent);
            // currentIndex = i;
            // audioElement.src = playlist[i].source;
            changeSongSource(i);
            
        })

        // songElement.addEventListener("drag", (e) => {
        //     e.preventDefault();
        //     console.log(e);
        // })

        songContainer.appendChild(songElement);
        playlistItems.appendChild(songContainer);
    }
}

const draw = () => {
    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);
    console.log(dataArray);
    canvasContext.fillStyle = "rgb(200, 200, 200)";
    canvasContext.fillRect(0, 0, audioCanvas.width, audioCanvas.height);

    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = "rgb(0, 0, 0)";

    canvasContext.beginPath();

    let sliceWidth = audioCanvas.width * 1.0 / bufferLength;
    let x = 0;

    for(let i=0; i < bufferLength; i++){
        let v = dataArray[i] / 128.0;
        let y = v * audioCanvas.height /2;

        if(i ===0){
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }

        x+= sliceWidth;
    }

    canvasContext.lineTo(audioCanvas.width, audioCanvas.height /2);
    canvasContext.stroke();

}

fileUploadForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const { name, path } = audioFile.files[0];
    let newSong = new Song(name, path);

    playlist.push(newSong);
    
    fileUploadForm.reset();
    showPlaylist();
})

previous.addEventListener('click', () => {
    console.log("previous track")
    if(currentIndex === playlist.length) {
        currentIndex = playlist.length -1;
    } else {
        currentIndex--;
    }
    
})

play.addEventListener('click', () => {
    console.log("play track")
    showCurrentSongPlaying();

    let seconds = 0;

    if(isPlaying){
        audioElement.pause();
    } else {
        isPlaying = true; 
            if(audioElement.src) {
                console.log(analyser);
                draw();
                playTrack();
            } else {
                audioElement.src = playlist[currentIndex].source;
                track = audioContext.createMediaElementSource(audioElement);
                analyser = audioContext.createAnalyser();
                track.connect(analyser);
                analyser.fftSize = 2048;
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
                draw();
                // console.log(analyser.getByteFrequencyData(dataArray));
                playTrack();
            }
    }

    // audioElement.addEventListener('timeupdate', (e) => {
    //     console.log(`${seconds} second(s) has passed`);
    //     seconds++;
    // })

    audioElement.ontimeupdate = (e) => {
        let currentClock = new Date().getTime();
        // console.log(Math.floor(currentClock/ 1000));
        // console.log(audioElement.currentTime);
        // console.log(audioElement.buffered)
        // console.log(`${seconds} second(s) has passed`);
        seconds++;        
    }

})

stop.addEventListener('click', () => {
    console.log("stop track")
    isPlaying = false;
    track.disconnect();
    audioElement.pause();
})

next.addEventListener('click', () => {
    console.log("next track")
    
    if(currentIndex === playlist.length) return;
    currentIndex++;
    console.log(isPlaying);
    if(isPlaying){
        changeSongSource(currentIndex);
    }

})
