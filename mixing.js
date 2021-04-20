const lowPass = document.getElementById("low-pass");
const midPass = document.getElementById("mid-pass");
const highPass = document.getElementById("high-pass");
const volume = document.getElementById("volume");

const testing = console.log("Mixing Connected");

lowPass.addEventListener("change", (e) => {
    console.log(e.target.value);
})

// module.export = {testing};