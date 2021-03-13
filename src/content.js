/*
TODO
1. allow remove url - done
2. allow disable plugin
3. while adding make sure http - done
4. ignore non-http while fetching - done
5. show warning for http sites - done
6. for http form show warning - done
7. change icon color green for https, red for http
8. if site is added then change button to 'remove' else 'add' - done
9. when on https, allow add site to exception and redirect back so that no trouble to user

http://scratchpads.org/explore/sites-list
*/
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

__fsShowHttpWarning = function () {
    var message = "Force Security: It may not be safe to upload or download data on this site.";
    __fsShowMessage(message);
}

__fsShowMessage = function (message) {
    var wrapperDiv = document.createElement('div');
    wrapperDiv.className = "fsHttpWarningWrapper-1";
    var warningDiv = document.createElement('div');
    warningDiv.innerText = message;
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
            __fsShowMessage("Force Security: This site was whitelisted by you");
        } else {
            __fsNavigateHttps(url);
        }
    });
}

__fsNavigateHttps = function (url) {
    var newUrl = url;
    newUrl = newUrl.substr(4);
    newUrl = "https" + newUrl;
    //window.location.href = newUrl;
    console.log('Result: ' + newUrl);

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
        var urlParts = tabs[0].url.split("/");
        var host = urlParts[0] + "//" + urlParts[2]
        if (host.startsWith('http://')) {
            txtAddUrl.value = host;
            __fsUpdateButtonText();
        }
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
        btnAddUrl.value = "Remove";
        btnAddUrl.className = 'btn-remove';

    });
}

__fsRemoveUrl = function (url) {
    chrome.storage.local.get('_WhiteListWebSiteStore', function (result) {
        var items = __fsGetItems(result);
        items.pop(url);
        chrome.storage.local.set({ '_WhiteListWebSiteStore': items });
        var btnAddUrl = document.getElementById("btnAddUrl");
        btnAddUrl.value = "Add";
        btnAddUrl.className = 'btn-add';

    });
}

__fsGetItems = function (localStorageResult) {
    var items;
    if (localStorageResult == null) {
        items = { '_WhiteListWebSiteStore': [] };
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
