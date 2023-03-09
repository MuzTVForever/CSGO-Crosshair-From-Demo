const dropArea = document.getElementById('fileDropBox');
const dropArea2 = document.getElementById('fileDropBox-2');

const DragNDrop = (function () {
  let LoadingCB = null;
  let FinishedCB = null;

  const _Init = (loadingCallback, finishedCallback) => {
    LoadingCB = loadingCallback;
    FinishedCB = finishedCallback;
  };

  const _PreventDefault = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  };

  const _GetFile = (ev) => {
    if (!LoadingCB || !FinishedCB) {
      return false;
    }

    const files = ev.dataTransfer.files;
    if (!files || files.length <= 0) {
      return false;
    }

    LoadingCB(files[0]);

    files[0].arrayBuffer().then(FinishedCB);
    return false;
  };

  return {
    Init: _Init,
    PreventDefault: _PreventDefault,
    GetFile: _GetFile,
  };
})();

(function () {
  ['drop', 'dragover', 'dragleave'].forEach((eventName) => {
    dropArea.addEventListener(eventName, DragNDrop.PreventDefault);
	dropArea2.addEventListener(eventName, DragNDrop.PreventDefault);
  });
  dropArea.addEventListener('drop', DragNDrop.GetFile);
  dropArea2.addEventListener('drop', DragNDrop.GetFile);
})();