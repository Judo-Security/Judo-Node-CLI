const fs = require('fs');

var fileName = '';
var splitIndex = 0;
var name = '';
var extension = '';
var counter = 0;
/**
 * Reads and format output file name
 * @param {string} outputFile output file name
 */
function readOutputFile({secretType, outputFile}) {
  return new Promise((resolve, reject) => {
    if ((secretType ? secretType === 2 : true) && outputFile && outputFile.length > 0) {
      fileName = outputFile;
      splitIndex = fileName.lastIndexOf('.');
      name = fileName.slice(0, splitIndex);
      extension = fileName.slice(splitIndex);
      checkDuplicate(resolve);
    } else {
      resolve(fileName);
    }
  });
}

/**
 * Check duplicate file in directory
 * @param {function} resolve resove promise
 */
function checkDuplicate(resolve) {
  //This method will check the duplicate files in the current directory
  fs.access(fileName, fs.constants.F_OK, (err) => {
      if (err) {
        // file doesn't exist
        resolve(fileName);
      } else {
          counter++;
          fileName = name + `(${counter})` + extension;
          checkDuplicate(resolve);
      }
    });
}

module.exports = readOutputFile;