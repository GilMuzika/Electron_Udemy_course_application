const { ipcRenderer, shell } = require("electron");
const fs = require('fs');
const path = require('path');

//get "readerJSforInjection.js" content
let readerJSforInjection;
fs.readFile(path.join(__dirname, 'readerJSforInjection.js'), (err, data) => {
readerJSforInjection = data.toString();

});


//referenceto the "items_" HTML node
let itemsNode = document.getElementById('items_');

//Track items in storage
exports.storage = JSON.parse(localStorage.getItem('read-items')) || [];

//Persists storage
exports.save = () => {
    //local built-in storage only supports simple strings, not objects
    localStorage.setItem('read-items', JSON.stringify(this.storage));
};

//changing selection of element by keys
exports.changeSelectionByKeys = (keyOfDirection) => {
    //get currently selected item
    let currentlySelectedItem = this.getSelectedItem().node;

    //handle up/down
    switch (keyOfDirection) {
        case 'ArrowUp':
            if(currentlySelectedItem.previousElementSibling) {
                currentlySelectedItem.classList.remove('selected');
                currentlySelectedItem.previousElementSibling.classList.add('selected');
            }
            break;
        case 'ArrowDown':
            if(currentlySelectedItem.nextElementSibling) {
                currentlySelectedItem.classList.remove('selected');
                currentlySelectedItem.nextElementSibling.classList.add('selected');
            }
            break;
    
        default:
            alert(`You pressed "${keyOfDirection}" key, you should only use Up and Down arrows`);
            break;
    }
};

//Open selected item in native browser
exports.openNative = (thisItem) => {
    //Only if we have items (in case of menu open)

    // "!collection.length" = "collection.length === 0"
    if(!this.storage.length) 
            return;

    //Get selected item
    //return {node: selectedItem, index: itemIndex};
    let currentlySelectedItem = thisItem === undefined ? this.getSelectedItem() : { node: thisItem, index: thisItem.dataset.index };
    //Get item's url
    let selectedItemUrl = currentlySelectedItem.node.dataset.url;

    //Open in user's default browser
    shell.openExternal(selectedItemUrl);



};

//Open item for reading 
exports.OpenForRead = async(thisItem) => {
    
    //Only if we have items (in case of menu open)

    // "!collection.length" = "collection.length === 0"
    if(!this.storage.length) 
            return;

    //Get selected item
    //return {node: selectedItem, index: itemIndex};
    let currentlySelectedItem = thisItem === undefined ? this.getSelectedItem() : { node: thisItem, index: thisItem.dataset.index };
    //Get item's url
    let selectedItemUrl = currentlySelectedItem.node.dataset.url;

    let screenDimentions = await ipcRenderer.invoke('getting-screen-dimentions');
    

    //opening the url in proxy window
    let readerWin = window.open(selectedItemUrl, '', `
        maxWidth=${screenDimentions.xAviliable}, 
        maxHeight=${screenDimentions.yAviliable},
        width=${   Math.round(screenDimentions.xAviliable - (screenDimentions.xAviliable / 10))     },
        height=${screenDimentions.yAviliable},
        x=0,
        y=0,
        backgroundColor=#DEDEDE,
        nodeIntegration=0,
        contextIsolation=1, 
    `);

    //replacing '{{{index}}}' tag in "readerJSforInjection.js" file with item index (currentlySelectedItem.index)
    let readerJSforInjectionWithReplacing = readerJSforInjection.replace(" '{{{index}}}' ", currentlySelectedItem.index);
    //inject JavaScript into the redaer window, from separate file
    readerWin.eval(readerJSforInjectionWithReplacing);
    //alert(`Opening item with url:\n${selectedItemUrl}`);


    
};



//Add a new item
exports.addItem = (item, isNewBool = false) => {
    
    //create a new DOM node
    let itemNode = document.createElement('div');

    //assign "read-item" class to it (from main.css)
    itemNode.setAttribute('class', 'read-item_');

    //Set item's url as data attribute
    itemNode.setAttribute('data-url', item.url);
    debugger;
    let currentIndex = isNewBool ? this.storage.length : item.index;
    itemNode.setAttribute('data-index', currentIndex);

    //add innerHTML to itemNode
    itemNode.innerHTML = `<img src="${item.screenshot}"/><h2>${item.title}</h2>`;

    //attach click handler to each element for 'se;ect' function when the element is added
   // itemNode.addEventListener('click', this.select);
    itemNode.addEventListener('click', (e) => {
        this.select(e);
    });

    //Attach double-click handler to open the item
    itemNode.addEventListener('dblclick', (e) => { 
        debugger;
        let thisItem  = e.target.parentNode;
        this.OpenForRead(thisItem); 
    });

    //Append the node to "items_"
    itemsNode.appendChild(itemNode);

    //preselecting the first item automatically. If this is the first item select it.
    if(document.getElementsByClassName('read-item_').length === 1) {
        itemNode.classList.add('selected');
    }

    //saving item to the storage
    if(isNewBool) {
        debugger;
        item.index = this.storage.length;
        this.storage.push(item); 
        this.save();
    }
    
};

//Add (load back) items from storahe when app loads
this.storage.forEach(item => {
    this.addItem(item);
});

//set item as selected
exports.select = e => {
    //Remove currently selcted item class if exists
    let selectedElement = this.getSelectedItem().node;
    if(selectedElement) {
        selectedElement.classList.remove('selected');
    }

    e.currentTarget.classList.add('selected');
};

//Listen for 'item-done' message from the reader window
//HTML5 standard messagig API provides a built-in event
window.addEventListener('message', e => {
    //check for correct message
    if(e.data.action ===  'delete-reader-item') {
        debugger;
        //delete item from the collection at given index. The reader window isn't know with which items it dealing, so the index must be pased to it along with the url
        this.storage.length > 1 ?  this.delete(e.data.itemIndex) : this.delete(0);

        //close the reader window
        //"e.source" is the reference to the window from which the message was sent.
        e.source.close();
    }  
});

//Delete item function
exports.delete = (index) => {
    debugger;
    //remove item from the DOM
    let readItemCollection = [];
    for(let s in itemsNode.childNodes) {
        if(itemsNode.childNodes[s].className && itemsNode.childNodes[s].className.includes('read-item_')) {
            readItemCollection.push({
                node: itemsNode.childNodes[s], 
                originIndex: s
            });
        }
    }
    debugger;
    if(itemsNode.childNodes.length > 3)
        itemsNode.removeChild(    itemsNode.childNodes[readItemCollection[index].originIndex]   );
    else itemsNode.removeChild(itemsNode.childNodes[3]);

    readItemCollection.length !== 1 ?  readItemCollection.splice(index, 1) : readItemCollection = [];

    //remove item from the storage
    this.storage.length >1 ? this.storage.splice(index, 1) : this.storage.splice(0, 1); //splice function removes section from an array, starting with index that defined by the first argument. The length (quantity of elements) of the section defined by the second argument.

    //persists storage
    this.save();

    for(let s in this.storage) {
        this.storage[s].index = s;
    }
    for(let s in readItemCollection) {
        readItemCollection[s].node.dataset.index = s;
    }


    //Select previous item ortop item
    if(this.storage.length) {
        let newSelectedItemIndex = index === 0 ? 0 : index - 1;
        //select item at new index
        document.getElementsByClassName('read-item_')[newSelectedItemIndex].classList.add('selected');
    }

};

//Get selected item index
exports.getSelectedItem = () => {
    //get selected item
    let selectedItem = document.getElementsByClassName('read-item_ selected')[0];
    //url -> selectedItem.dataset.url

    //and its index
    let itemIndex = 0;
    let child = selectedItem;
    while((child = child.previousSibling) !== null)
             itemIndex++;

    return {node: selectedItem, index: itemIndex};
};
