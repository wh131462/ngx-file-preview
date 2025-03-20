export interface FileReaderMessage {
  type: 'readFile';
  url: string;
  fileType: 'arraybuffer' | 'text' | 'json'; // 明确支持的格式类型
}

export interface FileReaderResponse {
  type: 'success' | 'error';
  data?: ArrayBuffer;
  text?: string;
  json?: any;       // 实际返回解析后的JSON对象
  error?: string;
}

self.addEventListener('message', async (e: MessageEvent<FileReaderMessage>) => {
  const { type, url, fileType } = e.data;

  if (type === 'readFile') {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }

      let result: FileReaderResponse = { type: 'success' };
      const clonedResponse = response.clone();

      switch (fileType) {
        case 'arraybuffer':
          result.data = await clonedResponse.arrayBuffer();
          break;

        case 'text':
          result.text = await clonedResponse.text();
          break;

        case 'json':
          // 先获取文本用于错误提示，再解析JSON
          const textData = await clonedResponse.text();
          try {
            result.json = JSON.parse(textData);
          } catch (parseError:any) {
            throw new Error(`JSON解析失败: ${parseError.message}`);
          }
          break;

        default:
          throw new Error(`不支持的文件类型: ${fileType}`);
      }

      // 使用Transferable传输ArrayBuffer提升性能
      if (fileType === 'arraybuffer') {
        self.postMessage(result, { transfer: [result.data!] });
      } else {
        self.postMessage(result);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      self.postMessage({
        type: 'error',
        error: errorMessage
      });
    }
  }
});
