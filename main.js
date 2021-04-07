// Modules
const {app, BrowserWindow, globalShortcut, ipcMain, clipboard, screen } = require('electron');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const path = require('path');
const readItem = require('./readItem');
const appMenu = require('./menu');

let primaryDisplay;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Create a new BrowserWindow when `app` is ready
function createWindow () {
  
  //window state keeper
  let state = windowStateKeeper({
    defaultWidth: 500,
    defaultHeight: 650
  });

  mainWindow = new BrowserWindow({
    x: state.x, y: state.y,
    width: state.width, height: state.height,
    minWidth: 350, 
    maxWidth: 650,
    minHeight: 300,
    webPreferences: { nodeIntegration: true },
    show: false
  })

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('renderer/main.html');

 //manage the window state with state keeper
 state.manage(mainWindow);

  // Open DevTools - Remove for PRODUCTION!
  //mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', mainWindow.show);


  appMenu.currentMenu(mainWindow.webContents);
}

// Electron `app` is ready
app.on('ready', () => { 
	createWindow();
	primaryDisplay = screen.getPrimaryDisplay();
});

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

let toggleDevToolsShortcutStr = 'CommandOrControl+Shift+D';
app.whenReady().then(() => {
	// Register a 'CommandOrControl+Shift+D' shortcut listener.
	const ret = globalShortcut.register(toggleDevToolsShortcutStr, () => {
		mainWindow.toggleDevTools();
		mainWindow.webContents.send('keyboard-shortcut-pressed');
	})

	if (!ret) {
		console.log('registration of keyboard shortcut failed')
	}

	// Check whether a shortcut is registered.
	//console.log(globalShortcut.isRegistered(toggleDevToolsShortcutStr))
})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister(toggleDevToolsShortcutStr)

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})


function validateUrl(value) {
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}
ipcMain.handle('ask-regex-text', async(e, arg) => {
	return validateUrl(arg[0]);
});

ipcMain.on('new-item-url-for-processing', (e, dataUrlReceived) => {
	
	console.log(dataUrlReceived);
	//Get new item and send it back to the renderer
	readItem(dataUrlReceived, (item) => {

		e.sender.send('new-item-processed-back', item); //item is sent to app.js
	});
});

ipcMain.handle('is-clipboardis-url-valid', async(e, arg) => {
	let isClipbordIsUrl  = validateUrl(clipboard.readText());
		if(isClipbordIsUrl) {
			return {isValid: true, theUrl: clipboard.readText()};
		}
		else return {isValid: false};
  });

  ipcMain.handle('getting-screen-dimentions', () => {
	return {
		xAviliable: primaryDisplay.workArea.width,
		yAviliable: primaryDisplay.workArea.height
	};
	
	
  });



