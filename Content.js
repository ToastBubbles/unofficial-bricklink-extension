let table = document.getElementsByClassName('mainPrintList')[0]

// Get the tbody inside the table
let tbody = table.getElementsByTagName('tbody')[0];

// Get all the tr elements inside the tbody
let rows = tbody.children

let highlightUsedParts = false;
let highlightNewParts = false;

// Function to toggle the feature based on the enabled state
function toggleFeature(key, enabled) {
    if (key === 'highlightUsed') {
        highlightUsedParts = enabled;
    } else if (key === 'highlightNew') {
        highlightNewParts = enabled;
    }

    // Apply highlighting based on the updated states
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.getElementsByTagName('td');
        let conditionCell;
        for (let j = 0; j < cells.length; j++) {
            if (cells[j].getAttribute('align') === 'CENTER') {
                conditionCell = cells[j].children[0];
                break; // Stop the loop once the condition is met
            }
        }
        if (conditionCell) {
            let conditionText = conditionCell.textContent.trim();
            if ((highlightUsedParts && conditionText === "Used")) {
                conditionCell.style.backgroundColor = "yellow";
                conditionCell.style.padding = '0.5em';
            } else if ((highlightNewParts && conditionText === "New")) {
                conditionCell.style.backgroundColor = "cyan";
                conditionCell.style.padding = '0.5em';
            } else {
                conditionCell.style.backgroundColor = "transparent";
                conditionCell.style.padding = '0';
            }
        }

    }
}

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // console.log("got message", message.action);
    if (message.action === 'toggleFeature') {
        console.log(message);
        toggleFeature(message.key, message.enabled);
    }
});

// Load the initial state of the features
chrome.storage.sync.get(['highlightUsed', 'highlightNew'], function (data) {
    if (data.highlightUsed !== undefined) {
        highlightUsedParts = data.highlightUsed;
    }
    if (data.highlightNew !== undefined) {
        highlightNewParts = data.highlightNew;
    }

    // Apply highlighting based on the initial states
    toggleFeature('highlightUsed', highlightUsedParts);
    toggleFeature('highlightNew', highlightNewParts);
});


for (let i = 0; i < rows.length; i++) {
    if (i == 0) {
        let row = rows[i];
        let newCell = document.createElement('td');
        let boldCell = document.createElement('b');
        boldCell.textContent = '✓';
        newCell.setAttribute("align", "CENTER")

        newCell.appendChild(boldCell)
        row.insertBefore(newCell, row.firstChild);
    }
    else if (i == 1) {
        let row = rows[i];
        let td2 = row.children[1];
        td2.setAttribute("colspan", "6")
    }
    else {
        let row = rows[i];
        let newCell = document.createElement('td');
        let checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                // Apply strikethrough style to text in the current row
                let cells = row.getElementsByTagName('td');
                let fonts = row.getElementsByTagName('font');
                for (let f = 0; f < fonts.length; f++) {
                    fonts[f].setAttribute("color", "#999999")
                }

                for (let j = 0; j < cells.length; j++) {
                    if (j != 2)
                        cells[j].style.color = "#999999"

                }
                cells[2].children[0].style.opacity = '0.2'
                let img = cells[1].getElementsByTagName('img')[0]
                img.style.opacity = '0.5';
                cells[3].style.textDecoration = 'line-through';
            } else {
                // Remove strikethrough style
                let cells = row.getElementsByTagName('td');
                let fonts = row.getElementsByTagName('font');
                for (let f = 0; f < fonts.length; f++) {
                    fonts[f].setAttribute("color", "#000")
                }
                for (let j = 0; j < cells.length; j++) {
                    cells[j].style.textDecoration = 'none';
                    cells[j].style.color = "inherit"

                }
                cells[2].children[0].style.opacity = '1'
                let img = cells[1].getElementsByTagName('img')[0]
                img.style.opacity = '1';
            }
        });

        newCell.appendChild(checkbox);
        row.insertBefore(newCell, row.firstChild);
    }

}