const dropArea = document.getElementById('fileDropBox');
const dropArea2 = document.getElementById('fileDropBox-2');

const DragAndDrop = (function () {
  let LoadingCB = null;
  let FinishedCB = null;

  const _Init = (loadingCallback, finishedCallback) => {
    LoadingCB = loadingCallback;
    FinishedCB = finishedCallback;
  };

  const preventDefault = (event) => {
    event.stopPropagation();
    event.preventDefault();
    return false;
  };

  const getFile = (event) => {
    if (!LoadingCB || !FinishedCB) {
      return false;
    }

    const files = event.dataTransfer.files;
    if (!files || files.length <= 0) {
      return false;
    }

    LoadingCB(files[0]);

    files[0].arrayBuffer().then(FinishedCB);
    return false;
  };

  return {
    Init: _Init,
    PreventDefault: preventDefault,
    GetFile: getFile,
  };
})();

(function () {
  ['drop', 'dragover', 'dragleave'].forEach((eventName) => {
    dropArea.addEventListener(eventName, DragAndDrop.PreventDefault);
	dropArea2.addEventListener(eventName, DragAndDrop.PreventDefault);
  });
  dropArea.addEventListener('drop', DragAndDrop.GetFile);
  dropArea2.addEventListener('drop', DragAndDrop.GetFile);
})();