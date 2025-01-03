const fs = require('fs');
const path = require('path');

// 定义文件路径
const basePath = path.join(__dirname,"../../", 'libs/ngx-file-preview/src/assets/icon');
const colorPath = path.join(basePath, 'color');
const fontPath = path.join(basePath, 'font');
const colorCssFile = path.join(colorPath, 'nfp.css');
const colorDemoFile = path.join(colorPath, 'demo_index.html');
const fontCssFile = path.join(fontPath, 'nfp.css');
const fontDemoFile = path.join(fontPath, 'demo_index.html');

// 文件重命名逻辑
function renameFilesWithSubstring(directory, oldSubstring, newSubstring) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    if (file.includes(oldSubstring)) {
      const oldFilePath = path.join(directory, file);
      const newFileName = file.replace(oldSubstring, newSubstring);
      const newFilePath = path.join(directory, newFileName);

      fs.renameSync(oldFilePath, newFilePath);
      console.log(`Renamed: ${oldFilePath} -> ${newFilePath}`);
    }
  });
}

// 内容替换逻辑
function replaceInFile(filePath, searchValue, replaceValue) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated references in: ${filePath}`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
}

// 执行文件重命名
renameFilesWithSubstring(colorPath, 'iconfont', 'nfp');
renameFilesWithSubstring(fontPath, 'iconfont', 'nfp');

// 更新引用
replaceInFile(fontCssFile, 'iconfont', 'nfp');
replaceInFile(fontDemoFile, 'iconfont', 'nfp');
replaceInFile(colorCssFile, 'iconfont', 'nfp');
replaceInFile(colorDemoFile, 'iconfont', 'nfp');

console.log('All tasks completed.');
