const fs = require('fs');
const path = require('path');

/**
 * 复制文件
 * @param {string} source 源文件路径
 * @param {string} target 目标路径（可以是文件路径或目录路径）
 */
function copyFile(source, target) {
  // 获取源文件名
  const fileName = path.basename(source);
  
  // 判断目标路径是否是目录
  let targetPath = target;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    targetPath = path.join(target, fileName);
  }

  // 确保目标目录存在
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    fs.copyFileSync(source, targetPath);
    console.log(`Successfully copied ${source} to ${targetPath}`);
  } catch (err) {
    console.error(`Error copying file: ${err.message}`);
    process.exit(1);
  }
}

/**
 * 复制目录
 * @param {string} source 源目录路径
 * @param {string} target 目标目录路径
 * @param {Object} options 选项
 * @param {boolean} options.merge 是否合并目录
 */
function copyDir(source, target, options = { merge: true }) {
  // 如果目标存在且不是目录，报错
  if (fs.existsSync(target) && !fs.statSync(target).isDirectory()) {
    console.error(`Target exists and is not a directory: ${target}`);
    process.exit(1);
  }

  // 确保目标目录存在
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // 读取源目录内容
  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      copyDir(sourcePath, targetPath, options);
    } else {
      if (fs.existsSync(targetPath) && !options.merge) {
        console.warn(`Skipping existing file: ${targetPath}`);
        return;
      }
      copyFile(sourcePath, targetPath);
    }
  });
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node copy.js <source> <target> [--no-merge]');
    process.exit(1);
  }

  const options = {
    merge: !args.includes('--no-merge')
  };

  // 移除选项参数
  const paths = args.filter(arg => !arg.startsWith('--'));
  const [source, target] = paths.map(arg => path.resolve(process.cwd(), arg));

  // 检查源路径是否存在
  if (!fs.existsSync(source)) {
    console.error(`Source path does not exist: ${source}`);
    process.exit(1);
  }

  try {
    // 根据源路径类型选择复制方法
    const stat = fs.statSync(source);
    if (stat.isDirectory()) {
      copyDir(source, target, options);
      console.log(`Successfully copied directory from ${source} to ${target}`);
    } else {
      copyFile(source, target);
    }
  } catch (err) {
    console.error(`Error during copy operation: ${err.message}`);
    process.exit(1);
  }
}

// 执行主函数
main();
