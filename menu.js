//Modules
const { Menu, shell } = require('electron');


//Module function to create the app menu
module.exports.currentMenu = (mainWindowWebContents) => {
    //Menu template
    let template = [
        {
            label: '&Items',
            submenu: [{
                label: '&Add New',
                accelerator: 'CommandOrControl + Shift + A',
                click: () => mainWindowWebContents.send('menu-show-modal')
                },
                {
                    label: '&Read Item',
                    accelerator: 'CommandOrControl + Shift + R',
                    click: () =>  mainWindowWebContents.send('menu-open-item')
                },
                {
                    label: 'Delete item',
                    accelerator: 'CommandOrControl + Delete',
                    click: () => mainWindowWebContents.send('menu-delete-item')
                },
                {
                    label: 'Open in browser',
                    accelerator: 'CommandOrControl + Shift + Enter',
                    click: () => mainWindowWebContents.send('menu-open-item-native')
                },
                {
                    label: 'Search',
                    accelerator: 'CommandOrControl + S',
                    click: () => mainWindowWebContents.send('menu-focus-search')
                }

            ]
        },
        {
            role: 'editMenu',
        }, 
        {
            role: 'windowMenu'
        },
        {
            role: 'appMenu'
        },
        {
            label: '&Help',
            role: 'help',
            submenu: [{
                label: 'Learn',
                click: () => {
                    shell.openExternal('https://github.com/GilMuzika/Electron_Udemy_course_application');
                }
            }]
        }
    ];

    //creATE MAC APP MENU
    //process.platform -> 'win32' or 'win64' for Windows, 'linux' for Linux, amd 'darwin' for Mac
    if(process.platform === 'darwin')
            template.unshift({role: 'appMenu'}); //unshift is add element to the beginning of the array

    //Build menu from template
    let menu = Menu.buildFromTemplate(template);
    
    Menu.setApplicationMenu(menu);
};