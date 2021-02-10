const {electron, ipcRenderer } = require("electron");
// const fs = require("fs");
const Song = require("./Song.js").Song;

const audioFile = document.getElementById("audio-file")
const fileUploadForm = document.getElementById("file-upload");

const playlistContainer = document.getElementById("playlist-container");
const playlistItems = document.getElementById("playlist-items");

const currentlyPlayingContainer = document.getElementById("currently-playing-container");
const currentPlayingSong = document.getElementById("currently-playing");

const previous = document.getElementById("previous-btn");
const play = document.getElementById("play-btn");
const stop = document.getElementById("stop-btn");
const next = document.getElementById("next-btn");

const fileContainer = document.getElementById("fileContainer");
const audioElement = document.querySelector("audio");

const playlist = [];

let currentSong = new Audio();
let currentIndex = 0;
let isPlaying = false;

let audioContext = new AudioContext();
let track;
// let buffer;

// fileContainer.addEventListener("drag", (e) => {
//     e.preventDefault();
//     console.log(e);
// })

const resetPlaylist = () => {
    while(playlistItems.firstChild){
        playlistItems.removeChild(playlistItems.firstChild);
    }
}

const changeSongSource = (num) => {
    audioElement.src = playlist[num].source;
}

const showCurrentSongPlaying = () => {
    currentPlayingSong.textContent = playlist[currentIndex].name;
    currentlyPlayingContainer.appendChild(currentPlayingSong);
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
    // changeSongSource(currentIndex);
    console.log(isPlaying);
    if(isPlaying){
        // audioElement.src = playlist[currentIndex].source;
        changeSongSource(currentIndex);
    }

})