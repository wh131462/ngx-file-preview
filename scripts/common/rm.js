const fs = require('fs');
const path = require('path');

/**
 * 删除文件
 * @param {string} filePath 文件路径
 */
function removeFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log(`Successfully removed file: ${filePath}`);
  } catch (err) {
    console.error(`Error removing file: ${err.message}`);
    process.exit(1);
  }
}

/**
 * 递归删除目录
 * @param {string} dirPath 目录路径
 */
function removeDir(dirPath) {
  try {
    // 读取目录内容
    const files = fs.readdirSync(dirPath);

    // 递归删除所有文件和子目录
    for (const file of files) {
      const curPath = path.join(dirPath, file);
      if (fs.statSync(curPath).isDirectory()) {
        // 递归删除子目录
        removeDir(curPath);
      } else {
        // 删除文件
        removeFile(curPath);
      }
    }

    // 删除空目录
    fs.rmdirSync(dirPath);
    console.log(`Successfully removed directory: ${dirPath}`);
  } catch (err) {
    console.error(`Error removing directory: ${err.message}`);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node rm.js <path1> [path2] [path3] ...');
    process.exit(1);
  }

  // 处理所有传入的路径
  args.forEach(arg => {
    const targetPath = path.resolve(process.cwd(), arg);

    // 检查路径是否存在
    if (!fs.existsSync(targetPath)) {
      console.warn(`Path does not exist: ${targetPath}`);
      return;
    }

    // 根据类型选择删除方法
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      removeDir(targetPath);
    } else {
      removeFile(targetPath);
    }
  });
}

// 执行主函数
main(); 