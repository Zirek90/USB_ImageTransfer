const { remote } = require('electron');
const dialog = remote.dialog;
const fs = require('fs-extra');
const { basename } = require('path');
const drivelist = require('drivelist');

const close = document.querySelector("#close");
const min = document.querySelector("#min");
const grabImage = document.querySelector("#drag-file > p");
const sendImage = document.querySelector("#send-file > p");
const preview = document.querySelector("#preview");
const list_of_usb_title = document.querySelector("#usb_title");
const list_of_usb = document.querySelector("#list_of_usb");

let file = []
let usbList = []
let selectedUsb;


closeWindow = () => {
    const window = remote.getCurrentWindow()
    window.close()
}

minimizeWindow = () => {
    const window = remote.getCurrentWindow()
    window.minimize()
}

let options = {
    filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
    ],
    properties: ['openFile', 'multiSelections']
}

getImage = () => {
    dialog.showOpenDialog(options)
        .then(res => {
            while(preview.firstChild) {
                preview.removeChild(preview.firstChild)
            }
            file = []
            let validator = true
            file.forEach(el => {
                if (el.toString() == res.filePaths.toString()) validator = false
            })

            res.filePaths.length && validator && file.push(res.filePaths)
        })
        .then(() => {
            createPreview()
            findUsbAndDisplay()
        })
}

createPreview = () => {
    file.length && file[0].forEach(el => {
        let image = document.createElement('img');
        image.classList.add('chosed_img')
        image.src = el
        preview.appendChild(image)
    })
}

findUsbAndDisplay = () => {
    // Loop through all storages and select only USB ones
    // then push to array to let user choose which pendrive to use
    file.length && drivelist.list()
        .then((drives) => {
            drives.forEach((drive) => {
                usbList = []
                if (drive.isUSB) {
                    const mountPath = drive.mountpoints[0].path;
                    if (!usbList.includes(mountPath)) {
                        usbList.push({ path: mountPath, name: drive.description });
                    }
                }
            })
        })
        .then(() => {
            usbList.forEach((el) => {
                while (list_of_usb.firstChild) {
                    list_of_usb.removeChild(list_of_usb.firstChild)
                }
                list_of_usb_title.style.display = "block"
                const p = document.createElement("p")
                const usb_name = document.createTextNode(el.name)
                p.appendChild(usb_name)
                list_of_usb.appendChild(p)
                p.addEventListener('click', (e) => {
                    if (preview.children.length) {
                        sendImage.style.display = "flex"
                    }
                    usbList.forEach((el) => {
                        if (el.name == e.target.innerText) {
                            selectedUsb = el.path
                        }
                    })
                })
            })
        })
}



sendImageToUSB = () => {
    file[0].forEach((el) => {
        const dir = `${selectedUsb}/images/`
        const name = basename(el.toString())
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        fs.copy(el.toString(), `${dir}${name}`, { overwrite: true })
    })
    file = [];
    sendImage.style.display = "none" 
    while(preview.firstChild) {
        preview.removeChild(preview.firstChild)
    }
}

close.addEventListener('click', closeWindow)
min.addEventListener('click', minimizeWindow)


grabImage.addEventListener('click', getImage)
sendImage.addEventListener('click', sendImageToUSB)


