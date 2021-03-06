const electron = require("electron");
const { ipcRenderer } = electron;
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
const shuffle = document.getElementById("shuffle-btn");
const repeat = document.getElementById("repeat-btn");

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
const shuffleNums = [];

let currentIndex = 0;
let isPlaying = false;

let audioContext = new AudioContext();
let track;
let isLooping = false;
let analyser;
let bufferLength;
let dataArray;

let lowpassNode = audioContext.createBiquadFilter();
let highpassNode = audioContext.createBiquadFilter();
let bandpassNode = audioContext.createBiquadFilter();
let volumeNode = audioContext.createGain();

let lowpassVal = 100;

let samples = audioContext.sampleRate * 2.0;

let audioBuffer = audioContext.createBuffer(2, samples, audioContext.sampleRate);

ipcRenderer.on('lowpass:change', (event, lowpass) => {
    console.log("musicControl: ", lowpass);
    lowpassVal = lowpass;

    audioContext.onstatechange = () => {
        console.log("Here");

        lowpassNode.frequency.linearRampToValueAtTime(lowpassVal, 5);
        lowpassNode.frequency.setValueAtTime(lowpassVal, 3.0);
    }
})

/*TODO Features
=== Time Length of NOW PLAYING
=== Cursor on NOW PLAYING

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

const getCurrentTimeInMinutes = () => {
    return Math.floor(audioElement.currentTime / 60);
}

const getCurrentTimeInSeconds = (currentMinutes) => {
    return Math.floor(audioElement.currentTime) - (currentMinutes * 60);
}

const showCurrentTime = () => {
    let currentMinutes = getCurrentTimeInMinutes();
    let currentSeconds = getCurrentTimeInSeconds(currentMinutes);
    currentTime.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, "0")}`;
}

const showFullTime = (fullTrackTime) => {
    let minutes = Math.floor(fullTrackTime / 60);
    let remainingSeconds = Math.floor(fullTrackTime - minutes * 60);
    totalTime.textContent = `${minutes}:${remainingSeconds}`;
}

const playTrack = () => {
    analyser = audioContext.createAnalyser();

    lowpassNode.type = "lowpass";
    // track.addEventListener("change", () => {
    //     lowpassNode.frequency.linearRampToValueAtTime(lowpassVal, 5);
    //     lowpassNode.frequency.setValueAtTime(lowpassVal, 3.0);
    // })

    lowpassNode.frequency.linearRampToValueAtTime(lowpassVal, 5);
    lowpassNode.frequency.setValueAtTime(lowpassVal, 3.0);
    // lowpassNode.gain.value = 1;

    track.connect(lowpassNode);
    lowpassNode.connect(analyser);

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

    lowpassNode.connect(audioContext.destination);
    draw();
    audioElement.play();
}

const showPlaylist = () => {
    if(playlist.length === 0) return;
    resetPlaylist();
    for(let i=0; i < playlist.length; i++){
        const songContainer = document.createElement("div");
        let songElement = document.createElement("li");
        // console.log(playlist[i].name.split("."));
        songElement.textContent = playlist[i].name;
        songContainer.addEventListener("click" , () =>{
            currentIndex = i;
            changeSongSource(i); 
        })

        // console.log(playlistItems);

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

// fileUploadForm.addEventListener('submit', (e)=>{
//     e.preventDefault();
//     console.log("SHOW HOSW")
//     const { name, path } = audioFile.files[0];
//     let newSong = new Song(name, path);
//     playlist.push(newSong);
//     fileUploadForm.reset();
//     showPlaylist();
// })

fileUploadForm.addEventListener('change', (e) => {
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
                playTrack();
            } else {
                audioElement.src = playlist[currentIndex].source;
                track = audioContext.createMediaElementSource(audioElement);          
                playTrack();
            }
    }
})

audioElement.ontimeupdate = (e) => {
    // console.log(Math.floor(currentClock/ 1000));
    // console.log(audioElement.currentTime);
    // console.log(audioElement.buffered)
    // console.log(`${seconds} second(s) has passed`);
    // console.log(currentClock);
    // seconds++;        
}

stop.addEventListener('click', () => {
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

shuffle.addEventListener('click', () => {
    console.log("Shuffle");
    if(playlist.length === 0) return;
    
    if(shuffleNums.length === playlist.length) shuffleNums.length = 0;

    let randNum;
    if(shuffleNums.length === 0){
        randNum = Math.floor(Math.random() * playlist.length);
        shuffleNums.push(randNum);
        currentIndex = randNum;   
    } else {
        let newNum;
        do{
            newNum = Math.floor(Math.random() * playlist.length);
        }while(shuffleNums.includes(newNum));
        shuffleNums.push(newNum);
        currentIndex = newNum;
    }
    changeSongSource(currentIndex);
})

repeat.addEventListener('click', () => {
    console.log("Repeat");
    isLooping = !isLooping;
    isLooping ? audioElement.loop = true : audioElement.loop = false;
    // audioElement.addEventListener("timeupdate", () => {
    //     let currentClock = new Date().getTime();
    //     if(audioElement.currentTime >= audioElement.duration){
    //         audioEleme
    //     }
    //     console.log("Current Time: ", audioElement.currentTime);
    //     console.log("Duration: ", audioElement.duration);
    // })
})