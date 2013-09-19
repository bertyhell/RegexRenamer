/// <reference path="jquery.d.ts" />
/// <reference path="iscroll.d.ts" />
/// <reference path="../cordova.d.ts" />

var currentDir: DirectoryEntry;
var driveViewScroller: iScroll;
var currentFolderItems: Array<any>;

document.addEventListener('deviceready', function () {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, failRoot);

    driveViewScroller = new iScroll('driveViewScroller', { hScroll: false, hScrollbar: false, vScrollbar: true });

    $("#btnPreview").click(function() {
        //preview of renamed files
        var files = $("li");
        for (var i = 1; i < files.length; i++) { //skip top folder
            var folderName: string = $(files[i]).attr("name");
            var regex = new RegExp($("#regexSearch").val(),"g");

            if (folderName.match(regex)) {
                var previewName = folderName.replace(regex, $("#regexReplace").val());
                $(files[i]).find("span + span").html(previewName);
            }
        }
    });

    $("#btnRename").click(function () {
        //rename files according to preview
        var files = $("li");
        for (var i = 1; i < files.length; i++) { //skip top folder
            var currentName: string = $(files[i]).attr("name");
            var newName: string = $(files[i]).find("span + span").html();

            if (currentFolderItems[i - 1].name == currentName) {
                window.console.log("renaming file: " + currentName + " => " + newName);
                currentFolderItems[i - 1].moveTo(currentDir, newName);
            } else {
                window.alert("failed to sync real directory with already renamed previews");
            }
        }

        currentDir.createReader().readEntries(updateFilesList, failRoot);
    });
});

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);


function onFileSystemSuccess(fileSystem) {
    window.console.log("onFileSystemSuccess");
    currentDir = fileSystem.root;
    currentDir.createReader().readEntries(updateFilesList, failRoot);
}

function updateFilesList(entries) {
    window.console.log("successRoot");
    var driveView = $("#driveView");
    driveView.html("");
    currentFolderItems = entries;

    driveView.append("<li class='folder'>..</li>")
    for (var i: number = 0; i < entries.length; i++) {
        if (entries[i].isFile) {
            driveView.append("<li class='file' name='" + entries[i].name+"'><span>" + entries[i].name + "</span><span>" + entries[i].name + "</span></li>")
        } else {
            driveView.append("<li class='folder' name='" + entries[i].name +"'><span>" + entries[i].name + "</span><span>" + entries[i].name + "</span></li>")
        }
    }

    $("li[class='folder']").click(function (element) {
        //on click of a folder
        if ($(element.currentTarget).html() == "..") {
            //move on up
            //alert("move folder up");
            currentDir.getParent(onGetDirectorySuccess, onGetDirectoryFail);
        } else {
            if ($(element.currentTarget).hasClass("folder")) {
                var subFolder: string = $(element.currentTarget).find("span:first-child").html();
                //alert("move to subfolder: " + subFolder);
                currentDir.getDirectory(subFolder, { create: false, exclusive: false }, onGetDirectorySuccess, onGetDirectoryFail);
            }
        }
    });
    updateScroller();
}

function updateScroller() {
    setTimeout(function () {
        driveViewScroller.refresh();
    }, 0);
    //driveViewScroller.scrollTo(0, 0, 200);
}

function onGetDirectorySuccess(directory: DirectoryEntry) {
    window.console.log("onGetDirectorySuccess");
    currentDir = directory;
    currentDir.createReader().readEntries(updateFilesList, onGetSubDirectoriesFail);
}

function onGetDirectoryFail(error) {
    window.console.log("onGetDirectoryFail");
    window.alert("Failed to open folder");
}

function onGetSubDirectoriesFail(error) {
    window.console.log("onGetDirectoryFail");
    window.alert("Failed to read content of folder");
}

function failRoot(error) {
    window.console.log("failRoot");
    window.alert("Failed to read SD card.");
}