let debug = true;

$(document).ready(function () {

    var languages = []
    var languagesFilter = []
    var repos;
    var colors;

    $.ajax({
        url: "https://raw.githubusercontent.com/ozh/github-colors/master/colors.json",
        type: 'GET',
        success: function (res) {
            colors =  JSON.parse(res);
        }
    });

    $.ajax({
        url: "https://karljoke.herokuapp.com/jokes/programming/random",
        type: 'GET',
        success: function (res) {
            $('#joke').append(
                '<span class="has-text-weight-semibold"> ' + res[0].setup + '</span> <br>' +
                '<br><span> ' + res[0].punchline + '</span>'
            );
        }
    });

    
    var lookupColor = function (str) {
        if (str == null) return "#878787";
        console.log(str);
        return colors[str].color;
    }


    $("#experience, #code").click(function (e) {
        let tab = e.target.innerText.trim();
        if (tab == "Experience") {
            $('#code-section').hide();
            $('#experience-section').show();
            $('#experience').addClass('selected-tab');
            $('#code').removeClass('selected-tab');
            $('#experience').addClass('is-active');
            $('#code').removeClass('is-active');
        } else if (tab == "Code") {
            $('#experience-section').hide();
            $('#code-section').show();
            $('#experience').removeClass('selected-tab');
            $('#code').addClass('selected-tab');
            $('#experience').removeClass('is-active');
            $('#code').addClass('is-active');
        }
    });
    
    $("#viewExp").click(function () {
        $(".dropdown-menu").hide(100);
        window.scrollTo(0, 0);
        $('#code-section').hide();
        $('#experience-section').show();
    });

    $("#viewCode").click(function () {
        $(".dropdown-menu").hide(100);
        window.scrollTo(0, 0);
        $('#experience-section').hide();
        $('#code-section').show();
    });

    $(document).bind("contextmenu", function (event) {
        if (!debug) event.preventDefault();
        var top = event.pageY;
        if ($(window).height() - event.clientY < 300) {
            top -= 314;
        }
        $(".dropdown-menu").finish().toggle(100).
            css({
                top: top + "px",
                left: event.pageX + "px"
            });
    });

    $(document).bind("mousedown", function (e) {
        if (!$(e.target).parents(".dropdown-menu").length > 0) {
            $(".dropdown-menu").hide(100);
        }
    });

    $.ajax({
        url: "https://api.github.com/users/briansayre/starred",
        type: 'GET',
        success: function (res) {
            repos = $('#repos');
            $.each(res, function (index, repo) {
                if (repo.homepage == "") {
                    repo.homepage = "https://github.com/briansayre"
                }
                if (repo.language == "C++") {
                    repo.language = "C";
                }
                if (!languages.includes(repo.language)) {
                    languages.push(repo.language);
                }
                repos.append(
                    '<div class="column is-6 ' + repo.language + '">' + '\n' +
                    '<div class="card is-shadowless" id="repo">' + '\n' +
                    '<div class="card-content">' + '\n' +
                    '<span class="dot" style="background-color: ' + lookupColor(repo.language) + ';"></span>' + '\n' +
                    '<span class="is-size-5">' + '\n' +
                    repo.name + '\n' +
                    '</span><br>' + '\n' +
                    '<span><i>' + repo.language + '</i></span><br><br>' + '\n' +
                    '<span class="content">' + '\n' +
                    repo.description + '\n' +
                    '</span>' + '\n' +
                    '</div>' + '\n' +
                    '<footer class="card-footer">' + '\n' +
                    '<a href="' + repo.homepage + '" class="card-footer-item" target="_blank" >View app</a>' + '\n' +
                    '<a href="' + repo.html_url + '" class="card-footer-item" target="_blank" >View code</a>' + '\n' +
                    '</footer>' + '\n' +
                    '</div>' + '\n' +
                    '</div>' + '\n'
                );
            })

            tags = $('.tags');
            languages.forEach(function (item, index) {
                tags.append(
                    '<span class="tag taggle is-clickable is-unselectable is-white" id="' + item + '" data-filter="' + item + '">' + item + '</span>'
                );
            });

            tags.append('<button class="delete taggle is-medium" id="all" data-filter="all"></button>')
            $('#all').hide();

            $(".taggle").click(function (e) {

                e.preventDefault();
                curLang = $(this).data('filter');

                if (curLang == "all") {
                    languagesFilter = [];
                } else if (languagesFilter.includes(curLang)) {
                    languagesFilter.splice(languagesFilter.indexOf(curLang), 1);
                } else {
                    languagesFilter.push(curLang);
                }

                languages.forEach(function (item, index) {
                    $('.' + item).hide();
                    $('#' + item).removeClass("is-link");
                    $('#' + item).addClass("is-white");
                });
                languagesFilter.forEach(function (item, index) {
                    $('.' + item).show();
                    $('#' + item).removeClass("is-white");
                    $('#' + item).addClass("is-link");
                });

                if (languagesFilter.length == 0) {
                    $('#all').hide();
                    languages.forEach(function (item, index) {
                        $('.' + item).show();
                    });
                } else {
                    $('#all').show();
                }

            });
        }
    });

});
