let table = document.getElementsByClassName('mainPrintList')[0]

// Get the tbody inside the table
let tbody = table.getElementsByTagName('tbody')[0];

// Get all the tr elements inside the tbody
let rows = tbody.children

let highlightUsedParts = false;
let highlightNewParts = false;
let highlightQty = false;
let externalTrackingSite = "https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={n}"

// Function to toggle the feature based on the enabled state
function toggleFeature(key, enabled) {
    if (key === 'highlightUsed') {
        highlightUsedParts = enabled;
    } else if (key === 'highlightNew') {
        highlightNewParts = enabled;
    }
    else if (key === 'highlightQty') {
        highlightQty = enabled;
    }

    // Apply highlighting based on the updated states
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.getElementsByTagName('td');




        let qtyCell = cells[5]


        if (qtyCell && i > 1) {
            if (highlightQty && Number(qtyCell.textContent)) {
                if (Number(qtyCell.textContent) > 1) {

                    let value = Number(qtyCell.textContent)
                    qtyCell.textContent = ""
                    let boldChild = document.createElement("b")
                    boldChild.textContent = value
                    boldChild.style.backgroundColor = "orange"
                    boldChild.style.padding = "0.25em"
                    boldChild.style.borderRadius = "1em"


                    qtyCell.appendChild(boldChild)
                }
            } else {

                let boldChild = qtyCell.children[0]

                if (boldChild) {

                    let value = boldChild.textContent
                    boldChild.remove()
                    qtyCell.innerText = value
                }


            }
        }


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
                conditionCell.style.borderRadius = "1em"
                conditionCell.style.padding = '0.5em';
            } else if ((highlightNewParts && conditionText === "New")) {
                conditionCell.style.backgroundColor = "cyan";
                conditionCell.style.borderRadius = "1em"
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
chrome.storage.sync.get(['highlightUsed', 'highlightNew', 'highlightQty'], function (data) {
    if (data.highlightUsed !== undefined) {
        highlightUsedParts = data.highlightUsed;
    }
    if (data.highlightNew !== undefined) {
        highlightNewParts = data.highlightNew;
    }
    if (data.highlightQty !== undefined) {
        highlightQty = data.highlightQty;
    }
    // Apply highlighting based on the initial states
    toggleFeature('highlightUsed', highlightUsedParts);
    toggleFeature('highlightNew', highlightNewParts);
    toggleFeature('highlightQty', highlightQty);
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
    else if (i <= rows.length - 3) {
        let row = rows[i];
        let newCell = document.createElement('td');
        let checkbox = document.createElement('input');

        let hyperlink = row.children[2].getElementsByTagName("a")[0]
        hyperlink.target = '_blank'
        // console.log(hyperlink);

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
                    if (j != 2 && j != 5)
                        cells[j].style.color = "#999999"

                }
                cells[2].children[0].style.opacity = '0.2'
                cells[5].style.opacity = '0.2'
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
                cells[5].style.opacity = '1'
                let img = cells[1].getElementsByTagName('img')[0]
                img.style.opacity = '1';
            }
        });

        newCell.appendChild(checkbox);
        row.insertBefore(newCell, row.firstChild);
    } else {
        let row = rows[i];
        let td2 = row.children[0];
        td2.setAttribute("colspan", "4")
    }

}

if (externalTrackingSite) {
    let tdElement = document.querySelector('td[width="40%"]');

    if (tdElement) {
        let trackingTR = tdElement.firstElementChild.firstElementChild.lastElementChild
        if (trackingTR) {

            if (trackingTR.firstElementChild.textContent.includes("Tracking")) {

                if (trackingTR.lastElementChild.textContent.length > 1) {
                    let trackingNo = trackingTR.lastElementChild.textContent.trim()
                    // console.log(trackingNo);
                    if (trackingNo) {
                        let hyperlinkData = generateHyperlink(trackingNo)
                        if (hyperlinkData.success) {

                            let hyperlink = document.createElement('a')
                            hyperlink.href = hyperlinkData.url
                            hyperlink.textContent = trackingNo
                            hyperlink.target = "_blank"
                            trackingTR.lastElementChild.innerHTML = ""
                            trackingTR.lastElementChild.appendChild(hyperlink)
                        }
                    }
                }
            }
        }
    }
}

function generateHyperlink(trackingNo) {
    let url = externalTrackingSite

    if (url.includes("{n}")) {

        return { url: url.replace("{n}", formatTrackingNumber(trackingNo)), success: true }
    }
    return { url: trackingNo, success: false }
}

function formatTrackingNumber(trackingNo) {
    /*
    Basically, this will try to parse domestic tracking numbers 
    or return the first string to catch international tracking numbers

    94001234567898765432

    ^ will return 94001234567898765432

     9400 12345 67898 7654 32

    ^ will return 94001234567898765432
    
    NL12345678DE
    www.dhl.com/de

    ^ will return NL12345678DE
    */
    let arr = trackingNo.split(" ")

    if (arr.length == 1) return trackingNo

    let output = ""

    for (let i = 0; i < arr.length; i++) {

        if (parseInt(arr[i])) {
            output += arr[i]

        } else {
            if (output.length > 6) {
                break
            } else {
                output = arr[0]
                break
            }

        }
    }
    return output
}