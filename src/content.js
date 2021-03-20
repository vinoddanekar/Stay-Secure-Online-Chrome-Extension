var __fsEnableExtension = true;

window.addEventListener('load', (event) => {
    __fsReadSettings();
    if (__fsEnableExtension) {
        __fsInitializeExtension();
    }
    __fsInitializePopup();
});

__fsReadSettings = function () {
    __fsEnableExtension = true;
}
__fsInitializeExtension = function () {
    var url = window.location.href;
    console.log('Initial: ' + url);
    if (url.startsWith('http://')) {
        __fsForceHttps(url);
    }
}

__fsShowMessage = function (message) {
    var wrapperDiv = document.createElement('div');
    wrapperDiv.className = "fsHttpWarningWrapper-1";
    var warningDiv = document.createElement('div');
    warningDiv.innerHTML = message;
    warningDiv.className = "fsHttpWarning";
    wrapperDiv.appendChild(warningDiv);
    document.body.appendChild(wrapperDiv);
}

__fsForceHttps = function (url) {
    chrome.storage.local.get('_WhiteListWebSiteStore', function (result) {
        var items = __fsGetItems(result);
        var isWhiteListed = false;
        for (index = 0; index < items.length; index++) {
            if (url.startsWith(items[index]) && items[index] != "") {
                isWhiteListed = true;
                break;
            }
        }
        if (isWhiteListed) {
            __fsShowMessage("SSO: This site was whitelisted by you");
        } else {
            __fsNavigateHttps(url);
        }
    });
}

__fsNavigateHttps = function (url) {
    var newUrl = url;
    newUrl = newUrl.substr(4);
    newUrl = "https" + newUrl;
    window.location.href = newUrl;
    //console.log('Result: ' + newUrl);

    return newUrl;
}

__fsInitializePopup = function () {
    __fsInputActiveHttpUrl();
    var btnAddUrl = document.getElementById("btnAddUrl");
    if (btnAddUrl != null)
        btnAddUrl.addEventListener("click", onbtnAddUrlClick);
    function onbtnAddUrlClick() {
        var url = document.getElementById("txtUrlToAdd").value;
        if (btnAddUrl.value == 'Remove')
            __fsRemoveUrl(url);
        else
            __fsAddUrl(url);
    }
}

__fsInputActiveHttpUrl = function () {
    var txtAddUrl = document.getElementById("txtUrlToAdd");
    if (txtAddUrl == null)
        return;

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        txtAddUrl.focus();
        var urlParts = tabs[0].url.split("/");
        if (urlParts[0] == 'https:') { urlParts[0] = 'http:'; }

        var host = urlParts[0] + "//" + urlParts[2]
        if (host.startsWith('http://')) {
            txtAddUrl.value = host;
            __fsUpdateButtonText();
        }
    });
}

__fsOpenUrl = function () {
    var txtAddUrl = document.getElementById("txtUrlToAdd");
    if (txtAddUrl == null)
        return;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        chrome.tabs.update(tab.id, { url: txtAddUrl.value });
    });
}

__fsUpdateButtonText = function () {
    var txtAddUrl = document.getElementById("txtUrlToAdd");
    var btnAddUrl = document.getElementById("btnAddUrl");
    var url = txtAddUrl.value;
    btnAddUrl.value = "Add";
    btnAddUrl.className = 'btn-add';
    if (txtAddUrl.value != '') {
        chrome.storage.local.get('_WhiteListWebSiteStore', function (result) {
            var items = __fsGetItems(result);
            var isWhiteListed = __fsHasItem(items, url);
            if (isWhiteListed) {
                btnAddUrl.value = "Remove";
                btnAddUrl.className = 'btn-remove';
            }
        });
    }
}

__fsHasItem = function (items, url) {
    var found = false;
    for (index = 0; index < items.length; index++) {
        if (url.startsWith(items[index]) && items[index] != "") {
            found = true;
            break;
        }
    }
    return found;
}

__fsAddUrl = function (url) {
    chrome.storage.local.get('_WhiteListWebSiteStore', function (result) {
        var items = __fsGetItems(result);
        items.push(url);
        chrome.storage.local.set({ '_WhiteListWebSiteStore': items });
        var btnAddUrl = document.getElementById("btnAddUrl");
        __fsShowSuccessMessage('Website added! <a href="#" id="hplOpenUrl">Open it now</a>');
        btnAddUrl.value = "Remove";
        btnAddUrl.className = 'btn-remove';

        var hplOpenUrl = document.getElementById("hplOpenUrl");
        if (hplOpenUrl != null)
            hplOpenUrl.addEventListener("click", __fsOpenUrl);

    });
}

__fsRemoveUrl = function (url) {
    chrome.storage.local.get('_WhiteListWebSiteStore', function (result) {
        var items = __fsGetItems(result);
        items.pop(url);
        chrome.storage.local.set({ '_WhiteListWebSiteStore': items });
        var btnAddUrl = document.getElementById("btnAddUrl");
        __fsShowSuccessMessage('Website removed!');
        btnAddUrl.value = "Add";
        btnAddUrl.className = 'btn-add';
    });
}

__fsShowSuccessMessage = function (message) {
    var divMessage = document.getElementsByClassName("success-message")[0];
    divMessage.innerHTML = message;
    divMessage.style.display = 'inline-block';
    //__fsOpenUrl

    setTimeout(() => {
        divMessage.style.display = 'none';
    }, 5000);
}

__fsGetItems = function (localStorageResult) {
    var items;
    if (localStorageResult == undefined || localStorageResult._WhiteListWebSiteStore == undefined) {
        items = [];
    }
    else {
        items = localStorageResult._WhiteListWebSiteStore;
    }

    return items;
}

__fsFindIndex = function (url) {
    chrome.storage.local.get('_WhiteListWebSiteStore', function (result) {
        var items = __fsGetItems(result);
        var index = items.findIndex(url);
        return index;
    });
}
