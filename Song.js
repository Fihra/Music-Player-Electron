class Song {
    constructor(name, path){
        this.name = name;
        this.path = path;
        // this.timeLength = timeLength;
        this.source = this.songSource();
    }
    songSource = () =>{
        let songFile = new Audio();
        songFile.src = this.path;
        return songFile.src;
    }


}

module.exports = { Song };