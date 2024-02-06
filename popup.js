document.addEventListener('DOMContentLoaded', function () {
    let checkboxUsed = document.getElementById('checkboxUsed');
    let checkboxNew = document.getElementById('checkboxNew');
    let checkboxQty = document.getElementById('checkboxQty');
    let checkboxCol = document.getElementById('checkboxColSearch');
    // let externalTrackingUrlBtn = document.getElementById('externalTrackingUrlBtn')
    let status = document.getElementById('status');

    // Load checkbox state from Chrome storage
    chrome.storage.sync.get(['highlightUsed', 'highlightNew', 'highlightQty', 'showColSearch'], function (data) {
        if (data.highlightUsed !== undefined) {
            checkboxUsed.checked = data.highlightUsed;
        }
        if (data.highlightNew !== undefined) {
            checkboxNew.checked = data.highlightNew;
        }
        if (data.highlightQty !== undefined) {
            checkboxQty.checked = data.highlightQty;
        }
        if (data.showColSearch !== undefined) {
            checkboxCol.checked = data.showColSearch;
        }
        // if (data.externalTrackingUrl !== undefined) {
        //     externalTrackingUrl.value = data.externalTrackingUrl
        // }
    });

    // Add event listener to checkboxUsed
    checkboxUsed.addEventListener('change', function () {
        let isChecked = checkboxUsed.checked;
        updateCheckboxState('highlightUsed', isChecked);
    });

    // Add event listener to checkboxNew
    checkboxNew.addEventListener('change', function () {
        let isChecked = checkboxNew.checked;
        updateCheckboxState('highlightNew', isChecked);
    });

    // Add event listener to checkboxUsed
    checkboxQty.addEventListener('change', function () {
        let isChecked = checkboxQty.checked;
        updateCheckboxState('highlightQty', isChecked);
    });
    // Add event listener to checkboxUsed
    checkboxCol.addEventListener('change', function () {
        let isChecked = checkboxCol.checked;
        updateCheckboxState('showColSearch', isChecked);
    });
    // Add event listener to checkboxUsed
    // externalTrackingUrlBtn.addEventListener('click', function () {
    //     // let isChecked = checkboxCol.checked;
    //     let url = document.getElementById('externalTrackingUrl').value
    //     updateCheckboxState('externalTrackingUrl', url);
    // });

    // Function to update checkbox state in Chrome storage and send message to content script
    function updateCheckboxState(storageKey, isChecked) {
        // Save checkbox state to Chrome storage
        chrome.storage.sync.set({ [storageKey]: isChecked }, function () {
            // Notify user that state is saved
            status.textContent = isChecked ? 'Feature enabled!' : 'Feature disabled!';

            // Send message to content script
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleFeature', key: storageKey, enabled: isChecked });
            });

            setTimeout(function () {
                status.textContent = '';
            }, 2000);
        });
    }

});