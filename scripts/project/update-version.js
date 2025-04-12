const fs = require('fs');
const path = require('path');

// 读取package.json中的版本号
const packageJsonPath = path.join(__dirname, '../../libs/ngx-file-preview/package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 更新version.ts文件
const versionFilePath = path.join(__dirname, '../../libs/ngx-file-preview/src/version.ts');
const versionFileContent = `/**
 * 当前的版本号
 */
export const version = '${version}';
`;

fs.writeFileSync(versionFilePath, versionFileContent, 'utf8');
console.log(`Version updated to ${version}`);
