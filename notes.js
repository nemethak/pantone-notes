let notes, time, theme_selector, count = 0,
    noteZindex = 1;

const stickyStyles = 4;

function addNewNote(
    title,
    content,
    className,
    currTime,
    posX,
    posY,
    save = true
) {
    if (!className) {
        className = "sticky s-" + Math.ceil(Math.random() * stickyStyles);
    }
    if (!currTime) {
        currTime = moment().format("l") + " " + time.text();
    }

    if (!title) {
        title = "";
    }

    if (!content) {
        content = "";
    }

    var newNote = $(
        "<div class='" +
        className +
        "'><span class='time'>" +
        currTime +
        "</span>" +
        "<textarea class='note-title' placeholder='title' maxlength='50'>" +
        title +
        "</textarea>" +
        "<textarea rows='5' class='note-content' placeholder='your text' maxlength='400'>" +
        content +
        "</textarea>" +
        "<div class='delete'>x</div>" +
        "</div>"
    );

    newNote.appendTo(notes).draggable({
        start: function() {
            $(this).zIndex(++noteZindex);
        },
        stop: function() {
            saveNotes();
        },
        containment: "window",
        scroll: false
    });

    newNote.find(".delete").on("click", function() {
        newNote.remove();
        saveNotes();
    });

    newNote.find("textarea").each(function() {
        $(this).change(saveNotes);
    });

    if (posX !== 0 && posY !== 0) {
        newNote.offset({ top: posY, left: posX });
    }

    newNote.hover(
        function() {
            newNote.zIndex(newNote.zIndex() + noteZindex);
            theme_selector.appendTo(newNote);
            setTimeout(function() {
                theme_selector.css({ opacity: 1 });
            }, 100);
        },
        function() {
            newNote.zIndex(newNote.zIndex() - noteZindex);
            theme_selector.css({ opacity: 0 });
        }
    );

    setTimeout(function() {
        newNote.css({
            opacity: 1,
            transform: "rotate(" + (Math.ceil(Math.random() * 12) - 6) + "deg)"
        });
    }, 100);

    if (save) {
        saveNotes();
    }
}

function saveNotes() {
    var notesArray = [];
    var allNotes = notes.find("> div");

    for (var i = 0; i < allNotes.length; i++) {
        var e = allNotes[i];
        var pos = $(e).offset();
        notesArray.push({
            class: $(e).attr("class"),
            title: $(e)
                .find(".note-title")
                .val(),
            content: $(e)
                .find(".note-content")
                .val(),
            time: $(e)
                .find(".time")
                .text(),
            posX: pos.left,
            posY: pos.top
        });
    }

    let prevCount = count;
    count = notesArray.length;

    if ((prevCount > 0 && count === 0) || (prevCount === 0 && count > 0)) {
        checkCount();
    }

    var json = JSON.stringify(notesArray);
    localStorage.setItem("savedNotes", json);
}

//load notes from local storage
function loadNotes() {
    var localNotes = localStorage.getItem("savedNotes");
    if (localNotes) {
        var notesArray = JSON.parse(localNotes);
        count = notesArray.length;
        for (i = 0; i < count; i++) {
            var note = notesArray[i];
            addNewNote(
                note.title,
                note.content,
                note.class,
                note.time,
                note.posX,
                note.posY,
                false
            );
        }
    }
}

function setTime() {
    time.text(moment().format("LT"));
}

function changeParentTheme(style) {
    let parent = theme_selector.parent();
    let classList = parent.attr("class").split(" ");
    for (class_ in classList) {
        if (classList[class_].startsWith("s-")) {
            parent.removeClass(classList[class_]);
            break;
        }
    }
    parent.addClass("s-" + style);
    saveNotes();
}

function checkCount() {
    if (count > 0) {
        $(".controls h2").text("don't forget these! ヽ(´ ▽ `✽)ノ");
        $(".controls").addClass("success");
    } else {
        $(".controls h2").text("no thoughts (︶｡︶✽)");
        $(".controls").removeClass("success");
    }
}

$(document).ready(function() {
    notes = $("#notes");
    time = $("#time");
    theme_selector = $("#theme-selector");
    loadNotes();

    $("#new-btn").click(function() {
        addNewNote();
    });

    theme_selector.find("div").each(function(i) {
        $(this).on("click", function() {
            changeParentTheme(i + 1);
        });
    });

    setTime();
    setInterval(setTime, 60 * 1000);

    // initial sample notes
    if (count === 0) {
        setTimeout(function() {
            addNewNote("all i wanted", "was a little bit of everything\n\nall of the time");
            addNewNote("went out", "to look for a reason\nto hide again");
        }, 100);
        count = 2;
    }

    checkCount();
});