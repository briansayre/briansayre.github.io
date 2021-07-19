$(document).ready(function () {

    var languages = []
    var languagesFilter = []
    var repos;

    $.ajax({
        url: "https://official-joke-api.appspot.com/jokes/programming/random",
        type: 'GET',
        success: function (res) {
            $('#joke').append(
                '<span class="has-text-weight-semibold"> ' + res[0].setup + '</span> <br>' +
                '<br><span> ' + res[0].punchline + '</span>'
            );
        }
    });

    $("#experience, #code").click(function (e) {
        let tab = e.target.innerText.trim();
        if (tab == "Experience") {
            $('#experience-section').removeClass('hidden');
            $('#code-section').addClass('hidden');
            $('#experience').addClass('selected-tab');
            $('#code').removeClass('selected-tab');
        } else if (tab == "Code") {
            $('#experience-section').addClass('hidden');
            $('#code-section').removeClass('hidden');
            $('#experience').removeClass('selected-tab');
            $('#code').addClass('selected-tab');
        }
    });


    $.ajax({
        url: "https://api.github.com/users/briansayre/starred",
        type: 'GET',
        success: function (res) {
            repos = $('#repos');
            $.each(res, function (index, repo) {
                //languagesFilter = languages;
                if (repo.homepage == "") {
                    repo.homepage = "https://github.com/briansayre"
                }
                if (repo.language == "C++") {
                    repo.language = "C";
                }
                if (!languages.includes(repo.language)) {
                    languages.push(repo.language);
                }
                let icon = '<i class="fas fa-code"></i>';
                if (repo.language == "HTML") {
                    icon = '<i class="fab fa-html5"></i>';
                } else if (repo.language == "Python") {
                    icon = '<i class="fab fa-python"></i>';
                } else if (repo.language == "JavaScript") {
                    icon = '<i class="fab fa-js-square"></i>';
                } else if (repo.language == "Java") {
                    icon = '<i class="fab fa-java"></i>';
                } else if (repo.language == "C" || repo.language == "C++") {
                    icon = '<i class="fab fa-cuttlefish"></i>';
                }
                repos.append(
                    '<div class="column is-6 ' + repo.language + '">' + '\n' +
                    '<div class="card is-shadowless" id="repo">' + '\n' +
                    '<div class="card-content">' + '\n' +
                    '<span class="icon card-icon">' + '\n' +
                    icon + '\n' +
                    '</span>' + '\n' +
                    '<p class="is-size-5">' + '\n' +
                    repo.name + '\n' +
                    '</p>' + '\n' +
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