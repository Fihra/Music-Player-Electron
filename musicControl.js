// const {electron, ipcRenderer } = require("electron");
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

const songLength = document.getElementById("time-length");
const currentTime = document.getElementById("current-time");
const totalTime = document.getElementById("total-time");

const fileContainer = document.getElementById("fileContainer");
const audioElement = document.querySelector("audio");

const bufferedAmount = document.getElementById("buffered-amount");
const progressAmount = document.getElementById("progress-amount");

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

let samples = audioContext.sampleRate * 2.0;

let audioBuffer = audioContext.createBuffer(2, samples, audioContext.sampleRate);

/*TODO Features
=== Time Length of NOW PLAYING
=== Cursor on NOW PLAYING

=== SHUFFLE
=== REPEAT

=== EQ Customization
=== Add Effects to Playback
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
    if(track === undefined) track = audioContext.createMediaElementSource(audioElement);
    showCurrentSongPlaying();
    playTrack();
}

const showCurrentSongPlaying = () => {
    nowPlayingSong.textContent = playlist[currentIndex].name;
    nowPlayingContainer.appendChild(nowPlayingSong);
}

const showCurrentTime = () => {
    let currentMinutes = Math.floor(audioElement.currentTime / 60);
    let currentSeconds = Math.floor(audioElement.currentTime) - (currentMinutes * 60);
    currentTime.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, "0")}`;
}

const showFullTime = (fullTrackTime) => {
    let minutes = Math.floor(fullTrackTime / 60);
    let remainingSeconds = Math.floor(fullTrackTime - minutes * 60);
    totalTime.textContent = `${minutes}:${remainingSeconds}`;
}

const playTrack = () => {
    analyser = audioContext.createAnalyser();
    track.connect(analyser);
    analyser.fftSize = 1024;
    bufferLength = analyser.fftSize;
    dataArray = new Float32Array(bufferLength);

    let fullTrackTime;

    audioElement.addEventListener("loadedmetadata", () => {
        fullTrackTime = audioElement.duration;
        showFullTime(fullTrackTime);
    })

    audioElement.addEventListener('progress', () => {
        if(fullTrackTime > 0){
            for(let i = 0; i < audioElement.buffered.length; i++){
                if(audioElement.buffered.start(audioElement.buffered.length - 1 - i) < audioElement.currentTime){
                    bufferedAmount.style.width = audioElement.buffered.end(audioElement.buffered.length - 1 - i) /fullTrackTime * 100 + "%";
                    break;
                }
            }
        }
    })

    audioElement.addEventListener('timeupdate', () => {
        showCurrentTime();
        if(fullTrackTime > 0){
            progressAmount.style.width = ((audioElement.currentTime / fullTrackTime) * 100) + "%";
        }
    })

    track.connect(audioContext.destination);
    draw();
    audioElement.play();
}

const showPlaylist = () => {
    if(playlist.length === 0) return;
    resetPlaylist();
    for(let i=0; i < playlist.length; i++){
        const songContainer = document.createElement("div");
        const songElement = document.createElement("li");
        // console.log(playlist[i].name.split("."));
        songElement.textContent = playlist[i].name;
 
        songContainer.addEventListener("click" , () =>{
            currentIndex = i;
            changeSongSource(i); 
        })

        songContainer.appendChild(songElement);
        playlistItems.appendChild(songContainer);
    }
}

const draw = () => {
    requestAnimationFrame(draw);
    // analyser.getFloatFrequencyData(dataArray);
    analyser.getFloatTimeDomainData(dataArray);
    // console.log(dataArray);
    canvasContext.fillStyle = "rgba(0, 255, 255, 0.5)";
    // canvasContext.fillRect(0, 0, audioCanvas.width, audioCanvas.height);
    canvasContext.clearRect(0, 0, audioCanvas.width, audioCanvas.height)

    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = "rgb(0, 0, 0)";

    canvasContext.beginPath();

    let sliceWidth = audioCanvas.width * 1.0 / bufferLength;
    let x = 0;

    for(let i=0; i < bufferLength; i++){
        // let v = dataArray[i] / 128.0;
        // let y = v * audioCanvas.height /2;
        let v = dataArray[i] * 200.0;
        let y = (audioCanvas.height/2) + v;


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
    if(currentIndex === 0) {
        currentIndex = playlist.length -1;
    } else {
        currentIndex--;
    }
    if(isPlaying) changeSongSource(currentIndex);
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
                
                playTrack();
            } else {
                audioElement.src = playlist[currentIndex].source;
                track = audioContext.createMediaElementSource(audioElement);
                
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
        // console.log(currentClock);
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
    if(currentIndex === playlist.length - 1) {
        currentIndex = 0;
    } else {
        currentIndex++;
    }
    if(isPlaying) changeSongSource(currentIndex);
})
