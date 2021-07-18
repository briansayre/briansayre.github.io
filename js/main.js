$(document).ready(function () {

    $.ajax({
        url: "https://api.github.com/users/briansayre",
        type: 'GET',
        success: function (res) {
            $('#pic').append(
                '<img class="profile-pic" id="img" src="' + res.avatar_url + '" />'
            );
        }
    });

    $("#experience, #code").click(function (e) {
        let tab = e.target.innerText.trim();
        if (tab == "Experience") {
            $('#experience-section').removeClass('hidden');
            $('#code-section').addClass('hidden');
            $('#experience').addClass('has-text-weight-semibold');
            $('#code').removeClass('has-text-weight-semibold');
        } else if (tab == "Code") {
            $('#experience-section').addClass('hidden');
            $('#code-section').removeClass('hidden');
            $('#experience').removeClass('has-text-weight-semibold');
            $('#code').addClass('has-text-weight-semibold');
        }
    });

    $.ajax({
        url: "https://api.github.com/users/briansayre/starred",
        type: 'GET',
        success: function (res) {
            $.each(res, function (index, repo) {
                if (repo.homepage == "") {
                    repo.homepage = "https://github.com/briansayre"
                }
                let icon = "fas fa-code";
                if (repo.language == "HTML") {
                    icon = '<i class="fab fa-html5"></i>';
                } else if (repo.language == "Python") {
                    icon = '<i class="fab fa-python"></i>';
                } else if (repo.language == "JavaScript") {
                    icon = '<i class="fab fa-js-square"></i>';
                } else if (repo.language == "Java") {
                    icon = '<i class="fab fa-java"></i>';
                }
                $('#repos').append(
                    '<div class="column is-6">' + '\n' +
                    '<div class="card" id="repo">' + '\n' +
                    '<div class="card-content">' + '\n' +
                    '<span class="icon card-icon">' + '\n' +
                    icon + '\n' +
                    '</span>' + '\n' +
                    '<p class="is-size-5">' + '\n' +
                    repo.name + '\n' +
                    '</p>' + '\n' +
                    '<span>' + repo.language + '</span><br>' + '\n' +
                    '<span class="content">' + '\n' +
                    repo.description + '\n' +
                    '</span>' + '\n' +
                    '</div>' + '\n' +
                    '<footer class="card-footer">' + '\n' +
                    '<a href="' + repo.homepage + '" class="card-footer-item" target="_blank" >App</a>' + '\n' +
                    '<a href="' + repo.html_url + '" class="card-footer-item" target="_blank" >Code</a>' + '\n' +
                    '</footer>' + '\n' +
                    '</div>' + '\n' +
                    '</div>' + '\n'
                );
            })
        }
    });

    $.ajax({
        url: "https://official-joke-api.appspot.com/random_joke",
        type: 'GET',
        success: function (res) {
            $('#joke').append(
                '<span class="has-text-weight-semibold"> ' + res.setup + '</span> <br>' +
                '<span> ' + res.punchline + '</span>'
            );
        }
    });

});