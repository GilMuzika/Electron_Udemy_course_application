//Modules
const { BrowserWindow } = require('electron');

//Offscreen browserWindow
let offscreenWindow;

//Export readItem function
module.exports = (url, callback) => {
    
    offscreenWindow  = new BrowserWindow({
        width: 500,
        height: 500,
        show: false, 
        webPreferences: {
            offscreen: true
        },
    });
    //load item url
    offscreenWindow.loadURL(url);

    //wait forcontent to finish load
    offscreenWindow.webContents.on('did-finish-load', () => {
        //get page title
        let title = offscreenWindow.getTitle();

        //get screenshot (thumbnail)
        offscreenWindow.webContents.capturePage().then(resImage => {
            //get image as dataURL
            let screenshot = resImage.toDataURL();

            //Execute callback with the new item object
            callback({
                title,
                screenshot, 
                url,
                index: -1,
            });
            offscreenWindow.close();
            offscreenWindow = null;
        });


    });

};


