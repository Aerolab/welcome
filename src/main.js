'use strict';
//process.env.ELECTRON_HIDE_INTERNAL_MODULES = 'true';

const shell = require('shelljs');
const slugify = require('slugify');
const child_process = require('child_process');
const config = require('./config.json');
const fs = require('fs');
const os = require('os');
var electron = require('electron');
const ipcMain = electron.ipcMain;
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

const sudo = require('sudo-prompt')
var sudoOptions = {
    name: 'Aerolab',
    //icns: '/Applications/Electron.app/Contents/Resources/Electron.icns',
};

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

var startupOpts = {
    useContentSize: true,
    width: 1200,
    height: 900,
    minWidth: 1200,
    minHeight: 900,
    center: true,
    resizable: true,
    alwaysOnTop: false,
    fullscreen: false,
    transparent: true,
    skipTaskbar: true,
    kiosk: false,
    title: '',
    icon: null,
    show: false,
    frame: false,
    disableAutoHideCursor: false,
    autoHideMenuBar: false, 
    titleBarStyle: 'default'
};

app.on('ready', function() {
    mainWindow = new BrowserWindow(startupOpts);
    
    if (process.env.NODE_ENV === 'dev') {
        mainWindow.webContents.on('did-start-loading', function() {
            mainWindow.webContents.executeJavaScript('var script = document.createElement(\'script\');script.type = \'text/javascript\';script.src=\'http://localhost:35729/livereload.js\';document.body.appendChild(script);');
        });
    }
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
    mainWindow.show();
});

ipcMain.on('getConfig', (event) => { // send config to front
    event.sender.send('receivedConfig', config );
});

ipcMain.on('setUserInfo', (event, userInfo) => {
    sudo.exec(
        'sh -c "'+
            'scutil --set ComputerName \"' + userInfo.name + '\" && '+
            'scutil --set HostName \"' + userInfo.name + '\" && '+
            'scutil --set LocalHostName \"' + slugify(userInfo.name) + '\" && '+
            'defaults write /Library/Preferences/SystemConfiguration/com.apple.smb.server NetBIOSName -string \"' + userInfo.name + '\" '+
        '"', 
        sudoOptions, 
        function() {
            // Global Git Config
            child_process.execSync('git config --global user.name "' + userInfo.name + '"');
            child_process.execSync('git config --global user.email "' + userInfo.email + '"');

            // Create Private Key if needed
            if( ! fs.existsSync(os.homedir() +'/.ssh/id_rsa') ) {
                child_process.execSync('ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -C "' + userInfo.email + '"')
            }
            
            const publicKey = fs.readFileSync(os.homedir() +'/.ssh/id_rsa.pub');

            event.sender.send('setUserInfoReady', { publicKey });
            
        });

});

ipcMain.on('openLink', function(e, data) {
    child_process.execSync('open ' + data + '');
});