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

const playlist = [];

let currentSong = new Audio();
let currentIndex = 0;
let isPlaying = false;

let audioContext = new AudioContext();
let track;
let analyser;

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

    if(isPlaying){
        audioElement.pause();
    } else {
        isPlaying = true; 
            if(audioElement.src) {
                playTrack();
            } else {
                audioElement.src = playlist[currentIndex].source;
                track = audioContext.createMediaElementSource(audioElement);
                analyser = audioContext.createAnalyser();
                console.log(analyser);
                track.connect(analyser);
                analyser.connect(audioContext.destination);
                playTrack();
            }
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