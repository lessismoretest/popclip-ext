// #popclip
// name: 字数统计
// identifier: com.lessismore.popclip.char-count
// entitlements: [dynamic]
// language: javascript
// module: true

exports.actions = (input) => {
  const text = input.text;
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  // 计算中文字符和英文字符
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  
  // 计算句子数量（中文：。！？｜英文：.!?）
  const sentenceCount = (text.match(/[。！？.!?]+/g) || []).length || (text.trim() ? 1 : 0);
  
  const resultText = `总字数: ${charCount}
中文: ${chineseChars}
英文: ${englishChars}
单词: ${wordCount}
句子: ${sentenceCount}`;
  
  return [{
    title: `${charCount} 字`,
    code: () => {
      popclip.showText(resultText, { style: 'large' });
    }
  }];
};
