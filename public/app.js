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