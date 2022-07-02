
// ========================= INITIALIZE =============================
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("spiner").style.display = "none";
    document.getElementById("cards").firstElementChild.style.display = "none";
    document.getElementById("searchButton").addEventListener("click", function (event) {
        SendReq();
    });
    document.getElementById("updateButton").addEventListener("click", function (event) {
        FilterAll();
        OrderBy();
    });
    document.getElementById("order").addEventListener("change", function (event) {
        OrderBy();
    });
    document.getElementById("orderAZ").addEventListener("change", function (event) {
        OrderBy();
    });
    document.addEventListener("keyup", function (e) {
        if (e.code === 'Enter') {
            SendReq();
        }
    });
});



// ========================= FILTER =============================
function GetActiveFilter() {
    var filters = document.getElementsByClassName("filter");
    var activeFilters = Array.from(filters).filter(x => x.value != "");
    return activeFilters;
}

function CheckFilterOnElement(element, field, typeMMO, value) {
    if (typeMMO == "min") {
        return element.getElementsByClassName(field)[0].innerHTML >= value;
    }
    if (typeMMO == "max") {
        return element.getElementsByClassName(field)[0].innerHTML <= value;
    }
    if (typeMMO == "ov") {
        return element.getElementsByClassName(field)[0].innerHTML == value;
    }
}

function FilterElement(element, filters) {
    for (var i = 0; i < filters.length; i++) {
        if (!CheckFilterOnElement(element, filters[i].getAttribute("field"), filters[i].getAttribute("typeMMO"), filters[i].value)) {
            console.log("##" + element + " : " + filters[i].getAttribute("field") + " : " + filters[i].getAttribute("typeMMO") + " : " + filters[i].value);
            element.style.display = "none";
            return false;
        }
    }
    //for template card
    if (element.getElementsByClassName("name")[0].innerHTML == "...") {
        return false;
    }
    return true;
}

function FilterAll() {
    console.log("fitler ALL");
    var filters = GetActiveFilter();
    var elements = document.getElementsByClassName("card");
    for (var i = 0; i < elements.length; i++) {
        if (FilterElement(elements[i], filters)) {
            elements[i].style.display = "block";
        }
    }
}


// ========================= ORDER =============================
function OrderBy() {
    var orderBy = document.getElementById("order").value
    var direction = document.getElementById("orderAZ").value.toLowerCase();
    console.log("order by " + orderBy);
    var elements = Array.from(document.getElementsByClassName("card")).filter(x => x.style.display != "none");

    var cardsData = [];
    for (var i = 0; i < elements.length; i++) {
        cardsData.push(
            {
                "name": elements[i].getElementsByClassName("name")[0].innerHTML,
                "language": elements[i].getElementsByClassName("language")[0].innerHTML,
                "created_at": elements[i].getElementsByClassName("created_at")[0].innerHTML,
                "pushed_at": elements[i].getElementsByClassName("pushed_at")[0].innerHTML,
                "updated_at": elements[i].getElementsByClassName("updated_at")[0].innerHTML,
                "watchers": elements[i].getElementsByClassName("watchers")[0].innerHTML,
                "stars": elements[i].getElementsByClassName("stars")[0].innerHTML,
                "forks": elements[i].getElementsByClassName("forks")[0].innerHTML,
                "issues": elements[i].getElementsByClassName("issues")[0].innerHTML
            }
        )
    }

    cardsData.sort(function (a, b) {
        var x = a[orderBy].toLowerCase();
        var y = b[orderBy].toLowerCase();
        if (direction == "asc") {
            return x < y ? -1 : x > y ? 1 : 0;
        } else {
            return x > y ? -1 : x < y ? 1 : 0;
        }
    });
    for (var i = 0; i < cardsData.length; i++) {
        elements[i].getElementsByClassName("name")[0].innerHTML = cardsData[i]["name"];
        elements[i].getElementsByClassName("language")[0].innerHTML = cardsData[i]["language"];
        elements[i].getElementsByClassName("created_at")[0].innerHTML = cardsData[i]["created_at"];
        elements[i].getElementsByClassName("pushed_at")[0].innerHTML = cardsData[i]["pushed_at"];
        elements[i].getElementsByClassName("updated_at")[0].innerHTML = cardsData[i]["updated_at"];
        elements[i].getElementsByClassName("watchers")[0].innerHTML = cardsData[i]["watchers"];
        elements[i].getElementsByClassName("stars")[0].innerHTML = cardsData[i]["stars"];
        elements[i].getElementsByClassName("forks")[0].innerHTML = cardsData[i]["forks"];
        elements[i].getElementsByClassName("issues")[0].innerHTML = cardsData[i]["issues"];
    }
}



// ========================= SEARCH =============================
function SendReq() {
    searchInput = document.getElementById("searchInput").value;

    if (searchInput.length == 0) {
        alert("Please enter a user or org name");
        return;
    }
    else {
        var spinner = document.getElementById("spiner");
        spinner.style.display = "block";
        var searchButton = document.getElementById("searchButton");
        searchButton.style.display = "none";
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open("POST", '/test', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            value: document.getElementById("searchInput").value
        }));

        //clear the cards
        var cardParent = document.getElementById("cards");
        let cardsCount = cardParent.children.length;
        for (let i = 1; i < cardsCount; i++) {
            cardParent.children[1].remove();
        }

        xhr.onload = function () {
            document.getElementById("noresult").style.display = "none";
            searchButton.style.display = "block";
            spinner.style.display = "none";
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                document.getElementById("noresult").style.display = "block";
            } else {
                repos = xhr.response["data"];
                x = repos;
                var cardParent = document.getElementById("cards");
                var card = cardParent.firstElementChild;
                card.style.display = "none";

                // Add new cards
                for (var repo in repos) {
                    var clone = card.cloneNode(true);
                    clone.style.display = "block";
                    clone.getElementsByClassName("name")[0].innerHTML = repos[repo]["name"];
                    clone.getElementsByClassName("language")[0].innerHTML = repos[repo]["primaryLanguage"] ? repos[repo]["primaryLanguage"]["name"] : "No language";
                    clone.getElementsByClassName("created_at")[0].innerHTML = repos[repo]["createdAt"].substring(0, 10);
                    clone.getElementsByClassName("pushed_at")[0].innerHTML = repos[repo]["pushedAt"].substring(0, 10);
                    clone.getElementsByClassName("updated_at")[0].innerHTML = repos[repo]["updatedAt"].substring(0, 10);
                    clone.getElementsByClassName("watchers")[0].innerHTML = repos[repo]["watchers"]["totalCount"];
                    clone.getElementsByClassName("stars")[0].innerHTML = repos[repo]["stargazerCount"];
                    clone.getElementsByClassName("forks")[0].innerHTML = repos[repo]["forkCount"];
                    clone.getElementsByClassName("issues")[0].innerHTML = repos[repo]["issues"]["totalCount"];
                    cardParent.appendChild(clone);
                }

                FilterAll();
                OrderBy();
            }
        };
    }
}
