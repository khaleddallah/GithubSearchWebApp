// ========================= INITIALIZE =============================
document.addEventListener('DOMContentLoaded', (event) => {
    // Hide spinner on initial load
    document.getElementById("spiner").style.display = "none";
    
    // Hide template card
    document.getElementById("cards").firstElementChild.style.display = "none";
    
    // Add event listeners
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
    
    // Listen for Enter key press in search input
    document.addEventListener("keyup", function (e) {
        if (e.code === 'Enter') {
            SendReq();
        }
    });
    
    // Add tooltips to all elements with data-bs-toggle="tooltip"
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
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
        return element.getElementsByClassName(field)[0].innerHTML.toLowerCase().includes(value.toLowerCase());
    }
}

function FilterElement(element, filters) {
    for (var i = 0; i < filters.length; i++) {
        if (!CheckFilterOnElement(element, filters[i].getAttribute("field"), filters[i].getAttribute("typeMMO"), filters[i].value)) {
            element.style.display = "none";
            return false;
        }
    }
    
    // For template card
    if (element.getElementsByClassName("name")[0].innerHTML == "...") {
        return false;
    }
    
    return true;
}

function FilterAll() {
    var filters = GetActiveFilter();
    var elements = document.getElementsByClassName("card");
    var visibleCount = 0;
    
    for (var i = 0; i < elements.length; i++) {
        if (FilterElement(elements[i], filters)) {
            elements[i].style.display = "block";
            visibleCount++;
        }
    }
    
    // Show/hide no results message
    if (visibleCount === 0 && elements.length > 1) {
        document.getElementById("noresult").style.display = "block";
        document.getElementById("noresult").querySelector("p").innerHTML = "No repositories match your filter criteria. Try adjusting your filters.";
    } else {
        document.getElementById("noresult").style.display = "none";
    }
    
    // Add animation to visible cards
    const visibleCards = Array.from(elements).filter(card => card.style.display === "block");
    visibleCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
        card.classList.add("animate-in");
    });
}

// ========================= ORDER =============================
function OrderBy() {
    var orderBy = document.getElementById("order").value;
    var direction = document.getElementById("orderAZ").value.toLowerCase();
    
    var elements = Array.from(document.getElementsByClassName("card")).filter(x => x.style.display != "none");
    
    // Skip if no visible elements
    if (elements.length <= 1) return;
    
    var cardsData = [];
    for (var i = 0; i < elements.length; i++) {
        cardsData.push({
            "name": elements[i].getElementsByClassName("name")[0].innerHTML,
            "language": elements[i].getElementsByClassName("language")[0].innerHTML,
            "created_at": elements[i].getElementsByClassName("created_at")[0].innerHTML,
            "pushed_at": elements[i].getElementsByClassName("pushed_at")[0].innerHTML,
            "updated_at": elements[i].getElementsByClassName("updated_at")[0].innerHTML,
            "watchers": elements[i].getElementsByClassName("watchers")[0].innerHTML,
            "stars": elements[i].getElementsByClassName("stars")[0].innerHTML,
            "forks": elements[i].getElementsByClassName("forks")[0].innerHTML,
            "issues": elements[i].getElementsByClassName("issues")[0].innerHTML,
            "element": elements[i]
        });
    }
    
    cardsData.sort(function (a, b) {
        var x, y;
        
        // Handle numeric fields differently
        if (["watchers", "stars", "forks", "issues"].includes(orderBy)) {
            x = parseInt(a[orderBy]) || 0;
            y = parseInt(b[orderBy]) || 0;
        } else {
            x = a[orderBy].toLowerCase();
            y = b[orderBy].toLowerCase();
        }
        
        if (direction == "asc") {
            return x < y ? -1 : x > y ? 1 : 0;
        } else {
            return x > y ? -1 : x < y ? 1 : 0;
        }
    });
    
    // Reorder the cards in the DOM
    const cardParent = document.getElementById("cards");
    cardsData.forEach(card => {
        cardParent.appendChild(card.element);
    });
}

// ========================= SEARCH =============================
function SendReq() {
    searchInput = document.getElementById("searchInput").value;
    
    if (searchInput.length == 0) {
        // Show toast notification instead of alert
        showToast("Please enter a user or organization name", "warning");
        return;
    } else {
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
        
        // Clear the cards
        var cardParent = document.getElementById("cards");
        let cardsCount = cardParent.children.length;
        for (let i = 1; i < cardsCount; i++) {
            cardParent.children[1].remove();
        }
        
        // Show loading message
        document.getElementById("noresult").style.display = "block";
        document.getElementById("noresult").querySelector("i").className = "fas fa-spinner fa-spin";
        document.getElementById("noresult").querySelector("h4").innerText = "Searching repositories...";
        document.getElementById("noresult").querySelector("p").innerText = `Looking for repositories from ${searchInput}`;
        
        xhr.onload = function () {
            document.getElementById("noresult").style.display = "none";
            searchButton.style.display = "block";
            spinner.style.display = "none";
            
            if (xhr.status != 200) {
                showToast(`Error ${xhr.status}: ${xhr.statusText}`, "danger");
                document.getElementById("noresult").style.display = "block";
                document.getElementById("noresult").querySelector("i").className = "fas fa-exclamation-triangle";
                document.getElementById("noresult").querySelector("h4").innerText = "Error occurred";
                document.getElementById("noresult").querySelector("p").innerText = `Could not fetch repositories for ${searchInput}. Please try again.`;
            } else {
                repos = xhr.response["data"];
                
                if (repos.length === 0) {
                    // No repositories found
                    document.getElementById("noresult").style.display = "block";
                    document.getElementById("noresult").querySelector("i").className = "fas fa-folder-open";
                    document.getElementById("noresult").querySelector("h4").innerText = "No repositories found";
                    document.getElementById("noresult").querySelector("p").innerText = `${searchInput} doesn't have any public repositories or the username doesn't exist.`;
                    return;
                }
                
                var cardParent = document.getElementById("cards");
                var card = cardParent.firstElementChild;
                card.style.display = "none";
                
                // Add new cards
                for (var repo in repos) {
                    var clone = card.cloneNode(true);
                    clone.style.display = "block";
                    
                    // Set repository name with link
                    clone.getElementsByClassName("name")[0].innerHTML = repos[repo]["name"];
                    
                    // Set language with appropriate styling
                    const language = repos[repo]["primaryLanguage"] ? repos[repo]["primaryLanguage"]["name"] : "No language";
                    clone.getElementsByClassName("language")[0].innerHTML = language;
                    
                    // Set dates
                    clone.getElementsByClassName("created_at")[0].innerHTML = repos[repo]["createdAt"].substring(0, 10);
                    clone.getElementsByClassName("pushed_at")[0].innerHTML = repos[repo]["pushedAt"].substring(0, 10);
                    clone.getElementsByClassName("updated_at")[0].innerHTML = repos[repo]["updatedAt"].substring(0, 10);
                    
                    // Set stats
                    clone.getElementsByClassName("watchers")[0].innerHTML = repos[repo]["watchers"]["totalCount"];
                    clone.getElementsByClassName("stars")[0].innerHTML = repos[repo]["stargazerCount"];
                    clone.getElementsByClassName("forks")[0].innerHTML = repos[repo]["forkCount"];
                    clone.getElementsByClassName("issues")[0].innerHTML = repos[repo]["issues"]["totalCount"];
                    
                    // Add GitHub link
                    const repoUrl = `https://github.com/${searchInput}/${repos[repo]["name"]}`;
                    clone.querySelector(".card-header").innerHTML += `<a href="${repoUrl}" target="_blank" class="btn btn-sm btn-outline-warning float-end"><i class="fas fa-external-link-alt me-1"></i>View on GitHub</a>`;
                    
                    // Add animation delay based on index
                    clone.style.animationDelay = `${repo * 0.05}s`;
                    clone.classList.add("animate-in");
                    
                    cardParent.appendChild(clone);
                }
                
                // Show success message
                showToast(`Found ${repos.length} repositories for ${searchInput}`, "success");
                
                FilterAll();
                OrderBy();
            }
        };
        
        xhr.onerror = function() {
            searchButton.style.display = "block";
            spinner.style.display = "none";
            showToast("Network error occurred. Please check your connection and try again.", "danger");
            
            document.getElementById("noresult").style.display = "block";
            document.getElementById("noresult").querySelector("i").className = "fas fa-wifi";
            document.getElementById("noresult").querySelector("h4").innerText = "Connection Error";
            document.getElementById("noresult").querySelector("p").innerText = "Could not connect to the server. Please check your internet connection and try again.";
        };
    }
}

// ========================= TOAST NOTIFICATIONS =============================
function showToast(message, type = "info") {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.className = "position-fixed bottom-0 end-0 p-3";
        toastContainer.style.zIndex = "5";
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = "toast-" + Date.now();
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function () {
        toast.remove();
    });
}
