// jshint esversion: 9

const DriveFile = (function() {

  const FOLDER_ID = '1dVjR_6Z8da7WiV3yq8csbOhpA2RlEGxg';

  class DriveFile {
    constructor(fileName = 'trfc-membres.json', folderId = FOLDER_ID) {
      this.fileName = fileName;
      this.folder = DriveApp.getFolderById(folderId);
      const files = this.folder.getFilesByName(this.fileName);
      this.file = files.hasNext() ? files.next() : null;
      this.fileId = this.file ? this.file.getId() : null;
    }

    createFile(content) {
      if (null !== this.file) throw new Error(`Le fichier ${this.fileName} existe déjà`);
      const file = this.folder.createFile(this.fileName, content);
      this.file = file;
      this.fileId = file.getId();
      return this;
    }

    updateFile(content) {
      if (null === this.file) throw new Error(`Le fichier ${this.fileName} n'exite pas`);
      this.file.setContent(content);
      return this;
    }

    readFile(format = 'json') {
      if (null === this.file) throw new Error(`Le fichier ${this.fileName} n'exite pas`);
      const fileContent = this.file.getBlob().getDataAsString();
      return 'json' === format ? JSON.parse(fileContent) : fileContent;
    }

    removeFile() {
      this.file.setTrashed(true);
      this.file = null;
      this.fileId = null;
      return this;
    }

  }

  return DriveFile;
})();

if ('undefined' !== typeof module) module.exports = DriveFile;