
const path = require('path');
const os = require('os');
const fs = require('fs');
let iconFile;
let platform = os.platform();
const iconFileWindows = path.resolve(__dirname, "src/icons/win/icon.ico");
const copyrightDate = "Copyright (c) 2016, Massachusetts Institute of Technology";

const iconFileMac = path.resolve(__dirname, "src/icons/mac/icon.icns");
const iconFileLinux = path.resolve(__dirname, "src/icons/png/512x512.png");
if (platform === 'darwin') {
  iconFile = iconFileMac;
}
else if (platform === 'win32') {
  iconFile = iconFileWindows;
}
else if (platform === 'linux') {
  iconFile = iconFileLinux;
}

module.exports = {
  "packagerConfig": {
    "icon": iconFile,
    appCopyright: copyrightDate
  },
  "makers": [
    {
      "name": "@electron-forge/maker-zip",
      "platforms": [
        "darwin",
        "win32",
        "linux"
      ]
    }
  ]

}
