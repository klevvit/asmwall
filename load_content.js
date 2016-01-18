$in = $("#content");
var initialTitle = "asmwall - NASM handbook - A Wall to Remember";
function renderPage(command) {
    $in.empty();
    function forHeader(line, f) {
        if (line[0] !== '#')
            return false;
        var content = line.replace(/#/g, '').replace(/`/g, '');
        var level = line.indexOf(' ');
        f($.trim(content), level);
        return true;
    }
    if (command) {
        document.title = command + ' - ' + initialTitle;
        $in.removeClass("instructions");
        var md = ""; // markdown code of the current section
        var isCurrent = false; // whether we are inside the needed section
        lines.forEach(function (line) {
            forHeader(line, function (content) {
                isCurrent = (command === content);
            });
            if (isCurrent)
                md += line + '\n';
        });
        if (md)
            $in.html(marked(md));
        else
            $.get("404.md", function(data) {
                document.title = "404 - " + initialTitle;
                $in.html(marked(data));
            });
    } else {
        document.title = initialTitle;
        $in.addClass("instructions");
        var $list = $("<ul></ul>");
        lines.forEach(function (line) {
            forHeader(line, function(content, level) {
                switch (level) {
                    case 1:
                    case 2:
                        if (!$list.is(":empty"))
                            $list = $("<ul></ul>");
                        var headerTag = '<h' + (level+1) + '>' +
                                        '</h' + (level+1) + '>';
                        $(headerTag)
                            .text(content)
                            .appendTo($in)
                            .after($list);
                        break;

                    case 3:
                        var $a = $("<a></a>")
                            .addClass("block-link");
                        var href = '?' + content.replace(/ /g, '_');
                        $a
                            .attr("href", href)
                            .text(content);
                        $('<li></li>')
                            .append($a)
                            .appendTo($list);
                        break;
                }
            });
        });
    }
}

function urlToCommand(url) {
    if (!url)
        return "";
    return url.slice(1).replace(/_/g, ' ').replace(/\//g, '');
}

// first load

var lines;
$.get("data.md", function (data) {
    lines = data.split('\n');
    var command = urlToCommand(location.search);
    renderPage(command);
    history.replaceState(command, null, location.search);
    $in.removeClass("long");
});
$(document).on("click", "a", function () {
    // Note: this.href is an absolute URL like
    // https://bugaevc.github.io/asmwall/?cdecl
    // while $(this).attr("href") is exactly the given value
    // which is in this case just "?cdecl"
    var href = $(this).attr("href");
    var command = urlToCommand(href);
    renderPage(command);
    history.pushState(command, null, href);
    return false;
});
window.addEventListener('popstate', function(e) {
    renderPage(e.state);
});
