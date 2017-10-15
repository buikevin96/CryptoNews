$.getJSON("/articles", function(data){
    // For each entry of that json...
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        // Append each of the propties to the table
        $("#results".append("<tr><td>" + data[i].title + "</td>" +
                            "<td>" + data[i].link + "</td>" +
                            "<td>" + data[i].id + "</td></tr>");
    }
});

//Handle Scrape Button
$("#scrape").on("click", function(){
    $.ajax({
        method: "GET",
        url: "/home",
    }).done(function(data){
        console.log(data)
        window.location = "/home" // Redirects to the homepage
    })
});

//Set clicked nav option to active
$(".navbar-nav li").click(function(){
    $(".navbar-nav li").removeClass("active");
    $(this.addClass("active");
});

// Handle Save Article Button
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data){
        window.location = "/"
    })
});

// Handle Delete Article Button
$(".delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).done(function(data){
        window.location = "/saved"
    })
});

// Handle Save Note Button
$(".saveNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId.val()){
        alert("Please Enter A Note To Save")
    }else {
        $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
                text: $("#noteText" + thisId).val()
            }
        }).done(function(data){
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#noteText" + thisId).val("");
            $(".modalNote").modal("hide");
            window.location = "/saved"
        });
    })
});

// Handle Delete Note Button
$(".deleteNote".on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function(data){
        console.log(data)
        $(".modalNote").modal("hide");
    })
});
