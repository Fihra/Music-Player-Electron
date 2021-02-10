class Song {
    constructor(name, path){
        // this.artist = artist;
        // this.title = title;
        this.name = name;
        this.path = path;
        // this.timeLength = timeLength;
        // this.album = album;
        this.source = this.songSource();
    }
    songSource = () =>{
        let songFile = new Audio();
        songFile.src = this.path;
        return songFile.src;
    }


}

module.exports = { Song };