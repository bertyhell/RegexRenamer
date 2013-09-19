document.addEventListener('deviceready', function () {
    window.alert("phonegap started");

    // Get a directory reader
    var directoryReader = dirEntry.createReader();

    // Get a list of all the entries in the directory
    directoryReader.readEntries(success, fail);
});

function success(entries) {
    var i;
    for (i = 0; i < entries.length; i++) {
        console.log(entries[i].name);
    }
    window.alert(entries[1].name + ", " + entries[2].name + ", " + entries[3].name);
}

function fail(error) {
    window.alert("Failed to list directory contents: " + error.code);
}