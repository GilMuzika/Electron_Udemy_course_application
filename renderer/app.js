const { ipcRenderer } = require("electron");
const items  = require('./items');

//https://github.com/sindresorhus/devtools-detect
//restricted to rrenderer only!!!!!
//use the global 'window' object!
const devToolsDetect = require('devtools-detect');

ipcRenderer.on('keyboard-shortcut-pressed', (e, data) => {
    let isOpenMessageStr = devToolsDetect.isOpen ? 'DevTools is Closed' : 'Open';
});

//const getName = obj => Object.keys(obj)[0];

//--------------------------------------------------------------------------------------------------------------
//Dom Nodes

let modalWinowDiv = document.getElementById('modal_'),
showModalButton = document.getElementById('show-modal_'),
closeModalButton = document.getElementById('close-modal_'),
addItemButton = document.getElementById('add-item_'),
urlTextField = document.getElementById('url_'),
searchField = document.getElementById('search_');

//listen for keyup event on search and filtering
searchField.addEventListener('keyup', (e) => {
    //key up
    Array.from(document.getElementsByClassName('read-item_')).forEach((oneItem) => {

        let isMatchBool = oneItem.innerText.toLowerCase().includes(e.target.value.toLowerCase());
        oneItem.style.display = isMatchBool ? 'flex' : 'none';

    }); 
}); 



let elementsArr;

//show modal window
showModalButton.addEventListener('click', () => {
    modalWinowDiv.style.display = 'flex';
    urlTextField.focus();
});
//hide modal window
closeModalButton.addEventListener('click', () => {
    modalWinowDiv.style.display = 'none';
});
//
addItemButton.addEventListener('click', async(e) => {
    await addNewItemCallBack(e);
});


const addNewItemCallBack = async (e) => {
    debugger;
    let isUrlValidBool =  await ipcRenderer.invoke('ask-regex-text', [urlTextField.value]);
    if(urlTextField.value && isUrlValidBool) {
        //sent the item url to the main process (again ;-) )
        ipcRenderer.send('new-item-url-for-processing', urlTextField.value);
    }
    
    elementsArr = [e.target, closeModalButton, urlTextField];
    toggleModalButtons(elementsArr);
};

ipcRenderer.on('new-item-processed-back', (e, argData) => {
//alert(JSON.stringify(argData));
console.log(argData);
toggleModalButtons(elementsArr);
//add to the "items_" node
items.addItem(argData, true);
closeModalButton.click();


});

urlTextField.addEventListener('focus', async(e) => {
    let isUrlValid = await ipcRenderer.invoke('is-clipboardis-url-valid');
    if(isUrlValid.isValid === true) {
        e.target.value = isUrlValid.theUrl;
    }
});

//urlTextField listen to pressing Enter
urlTextField.addEventListener('keyup', (e) => {
    if(e.key === 'Enter')
        addItemButton.click();
});

//Navigate item selection with up/down arrows
//global event listener is used
document.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp' || e.key ===  'ArrowDown') {
       items.changeSelectionByKeys(e.key);
    }else if(e.key === 'Enter') {
        items.OpenForRead();
    }

});

ipcRenderer.on('menu-show-modal', () => {
    showModalButton.click();
    /*
    alert('שלום');
    debugger;
    let isUrlValid = await ipcRenderer.invoke('is-clipboardis-url-valid');
    if(isUrlValid.isValid === true) {
        
        //the property "value" of the text field "urlTextField" must contain the input URL, we can put the URL to it either "by hand" through the user interface, or programmatically.
        urlTextField.value = isUrlValid.theUrl;

    }
    addNewItemCallBack({target: addItemButton});*/
});

ipcRenderer.on('menu-open-item', () => {
    items.OpenForRead();
});

ipcRenderer.on('menu-delete-item', () => {
    debugger; 
    let selectedItem = items.getSelectedItem();
    items.delete(selectedItem.index - 3);
});

//Open item in native browser from menu
ipcRenderer.on('menu-open-item-native', () => {
    items.openNative();
});
//menu-focus-search
ipcRenderer.on('menu-focus-search', () => {
    searchField.focus();    
});

//Disable & enable modalbuttons
let toggleModalButtons = (elementsArr) => {
        for(let s in elementsArr) {
            if(elementsArr[s].disabled === true) {
                elementsArr[s].disabled = false;
                elementsArr[s].style = elementsArr[s].currentIdentity;
                if(elementsArr[s].innerText !== undefined || null || "") 
                    elementsArr[s].innerText = elementsArr[s][`currentIdentity_${s}`];
                if(elementsArr[s].value !== undefined || null || "")
                    elementsArr[s].value = elementsArr[s].currentIdentity;
            } else {
                elementsArr[s]['currentIdentity'] = elementsArr[s].style;
                if(elementsArr[s].innerText !== undefined || null || "")
                    elementsArr[s][`currentIdentity_${s}`] = elementsArr[s].innerText;
                if(elementsArr[s].value !== undefined || null || "")
                    elementsArr[s]['currentIdentity'] = elementsArr[s].value;

                elementsArr[s].disabled = true;
                elementsArr[s].style.opacity = 0.5;
                if(elementsArr[s].innerText !== undefined || null || "")
                    elementsArr[s].innerText = 'Adding...';
                if(elementsArr[s].value !== undefined || null || "")
                    elementsArr[s].value = "Adding in process...";
            }
    }
};











