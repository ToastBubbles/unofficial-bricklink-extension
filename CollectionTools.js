try {
    let showColSearch = false
    // Listen for messages from the popup script
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        // console.log("got message", message.action);
        if (message.action === 'toggleFeature') {
            console.log(message);
            toggleFeature(message.key, message.enabled);
        }
    });

    // Load the initial state of the features
    chrome.storage.sync.get(['showColSearch'], function (data) {

        if (data.showColSearch !== undefined) {
            showColSearch = data.showColSearch;
        }
        // Apply highlighting based on the initial states
        toggleFeature('showColSearch', showColSearch);

    });

    // Function to toggle the feature based on the enabled state
    function toggleFeature(key, enabled) {
        if (key === 'showColSearch') {
            showColSearch = enabled;
        }
        if (showColSearch) {




            console.log("working");

            function increaseItemsPerPage() {
                let dropdown = document.querySelectorAll("#MPI-viewPerPage-dropdown")[1];
                if (!dropdown) console.log("Element with ID 'MPI-viewPerPage-dropdown' not found");
                let increasedView = document.createElement('option');
                increasedView.textContent = "10000 per page";
                increasedView.setAttribute("value", '10000');
                dropdown.appendChild(increasedView);
                increasedView.selected = true;
            }
            increaseItemsPerPage()

            let body = document.getElementById("bl-my-personal-inventory");
            if (!body) console.log("Element with ID 'bl-my-personal-inventory' not found");
            let container = body.querySelector(".personal-inventory__container");
            if (!container) console.log("Element with class 'personal-inventory__container' not found");
            let childSections = container.getElementsByTagName("section");

            let allItems = []
            let items = []

            let newSearchConatiner = generateSearchbar()

            container.insertBefore(newSearchConatiner, childSections[childSections.length - 1])

            // console.log("*************");
            // console.log(container);
            // console.log("*************");
            // console.log(newSearchConatiner);
            // console.log("*************");
            // console.log(childSections[childSections.length - 1]);
            // console.log("*************");

            let inventoryContainer
            function reload() {
                allItems = []
                items = []
                console.log("reloading");
                let sb = document.getElementById("my-collection-searchbar")
                if (sb) sb.value = ''
                fetchInventoryData().then(() => {
                    inventoryContainer = childSections[childSections.length - 1].lastElementChild
                    // console.log(inventoryContainer);

                    for (let i = 0; i < inventoryContainer.children.length; i++) {
                        let infoNode = inventoryContainer.children[i].children[2]
                        // let partNumber = infoNode.firstChild.firstChild.textContent
                        let partName = infoNode.firstChild.textContent.split(': ').join('');
                        let color = infoNode.lastChild.textContent
                        allItems.push({
                            id: i,
                            element: inventoryContainer.children[i],
                            content: `${partName} ${color}`
                        })
                    }
                });
            }
            reload()



            function fetchInventoryData() {

                // Simulate an API call with a setTimeout
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // Resolve the promise after the API call completes
                        // ready = true

                        let sb = document.getElementById("my-collection-searchbar")
                        if (sb) { sb.disabled = false }

                        resolve();
                    }, 1500); // Adjust the delay as needed
                });
            }

            // let parentElement = document.getElementById('parentElement');

            // Attach an event listener to the parent element
            container.addEventListener('input', function (event) {
                // Check if the event occurred on the search bar
                if (event.target.id === 'my-collection-searchbar') {
                    // Handle search functionality
                    let searchTerm = event.target.value.toLowerCase();

                    let filteredItems = allItems.filter(item => {
                        return item.content.toLowerCase().includes(searchTerm);
                    });
                    updateUI(filteredItems);
                }
            });

            function generateSearchbar() {
                let section = document.createElement('section');
                section.classList.add("personal-inventory__add-item", "personal-inventory__container-full-width")
                let div0 = document.createElement('div')
                div0.classList.add("personal-inventory__add-item-title")
                div0.style.paddingBottom = '0.5em'
                div0.textContent = "Search within your collection"
                let div1 = document.createElement('div');
                div1.style.display = 'flex'
                let searchbar = document.createElement('input');
                searchbar.classList.add("text-input", "input-button-set__input", "l-full-width")
                searchbar.setAttribute('placeholder', 'Search for parts in your Collection');
                searchbar.setAttribute('id', 'my-collection-searchbar');

                searchbar.disabled = true
                let button = document.createElement('button');
                button.classList.add("personal-inventory__input-search-magnifier-button", "magnifire-0")
                let i = document.createElement('i');
                i.classList.add('far', 'fa-search');

                button.appendChild(i);
                div1.appendChild(searchbar);
                div1.appendChild(button);
                section.appendChild(div0)
                section.appendChild(div1);
                return section;
            }
            function updateUI(filteredItems) {
                // Clear the current UI
                inventoryContainer.innerHTML = '';
                // console.log(filteredItems);

                // Rebuild the UI with filtered items
                filteredItems.forEach(item => {
                    inventoryContainer.appendChild(item.element);
                });
            }

            function addEventListenerToTabs() {
                let tabSets = document.getElementById("MPI-nav-mySets"),
                    tabParts = document.getElementById("MPI-nav-myParts"),
                    tabMinifigs = document.getElementById("MPI-nav-myMinifigures"),
                    tabBooks = document.getElementById("MPI-nav-myBooks"),
                    tabGear = document.getElementById("MPI-nav-myGears"),
                    tabCatalogs = document.getElementById("MPI-nav-myCatalogs");

                let tabs = [tabSets, tabParts, tabMinifigs, tabBooks, tabGear, tabCatalogs]

                tabs.forEach(tab => {
                    tab.addEventListener('click', function (event) {
                        reload()
                    });
                })

            }
            addEventListenerToTabs()





        }
    }
} catch (error) {
    console.error("Error:", error.message);
}