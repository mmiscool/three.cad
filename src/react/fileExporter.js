const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

}


function saveArrayBuffer(buffer, filename) {

  // save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
  save(new Blob([buffer], { type: 'model/stl' }), filename);

}

function saveString(text, filename) {

  // save( new Blob( [ text ], { type: 'text/plain' } ), filename );
  save(new Blob([text], { type: 'application/json' }), filename);

}

export function STLExport() {
  if (sc.selected[0] && sc.selected[0].userData.type == 'mesh') {
    const result = STLexp.parse(sc.selected[0], { binary: true });
    saveArrayBuffer(result, 'box.stl');
  }
}


export async function saveFile(fileHandle, file, dispatch) {
  try {
    if (!fileHandle) {
      return await saveFileAs(file, dispatch);
    }
    await writeFile(fileHandle, file);

    dispatch({ type: 'set-modified', status: false })
  } catch (ex) {
    const msg = 'Unable to save file';
    console.error(msg, ex);
    alert(msg);
  }
  // app.setFocus();
};

export async function saveFileAs(file, dispatch) {
  let fileHandle;
  try {

    const opts = {
      types: [{
        // description: 'Text file',
        accept: { 'application/json': ['.json'] },
      }],
    };
    fileHandle = await showSaveFilePicker(opts)


  } catch (ex) {
    if (ex.name === 'AbortError') {
      return;
    }
    const msg = 'An error occured trying to open the file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }

  try {
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(file);
    // Close the file and write the contents to disk.
    await writable.close()

    dispatch({ type: 'set-file-handle', fileHandle, modified: false })

  } catch (ex) {

    const msg = 'Unable to save file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }

  // app.setFocus();
};


async function verifyPermission(fileHandle, withWrite) {
  const opts = {};
  if (withWrite) {
    opts.writable = true;
    // For Chrome 86 and later...
    opts.mode = 'readwrite';
  }
  // Check if we already have permission, if so, return true.
  if (await fileHandle.queryPermission(opts) === 'granted') {
    return true;
  }
  // Request permission to the file, if the user grants permission, return true.
  if (await fileHandle.requestPermission(opts) === 'granted') {
    return true;
  }
  // The user did nt grant permission, return false.
  return false;
}


export async function openFile(dispatch) {
  // if (!app.confirmDiscard()) {
  //   return;
  // }
  let fileHandle

  // If a fileHandle is provided, verify we have permission to read/write it,
  // otherwise, show the file open prompt and allow the user to select the file.
  try {
    fileHandle = await getFileHandle();
  } catch (ex) {
    if (ex.name === 'AbortError') {
      return;
    }
    const msg = 'An error occured trying to open the file.';
    console.error(msg, ex);
    alert(msg);
  }

  if (!fileHandle) {
    return;
  }
  const file = await fileHandle.getFile();

  readFile(file, fileHandle, dispatch);



  try {
    const text = await readFile(file);
    sc.loadState(text)
    dispatch({ type: 'set-file-handle', fileHandle })
    // app.setModified(false);
    // app.setFocus(true);
  } catch (ex) {
    const msg = `An error occured reading ${fileHandle}`;
    console.error(msg, ex);
    alert(msg);
  }


};
