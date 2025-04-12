import ZH from "../../assets/i18n/zh.json";
import EN from "../../assets/i18n/en.json";

const LangMapping: Record<string, any> = {
  'zh': ZH,
}
export const I18nUtils = {
  /**
   * 获取语言包
   * @param locale
   */
  get(locale: string) {
    return new I18nParser(locale || 'zh')
  },
  /**
   * 注册语言包
   */
  register(locale: string, langJson: typeof ZH) {
    LangMapping[locale] = langJson;
  }
}

/**
 * 注册使用示例
 */
I18nUtils.register('en', EN)

/**
 * 单例模式优化语言包的获取 单个语言只会创建一个语言转化实例
 */
class I18nParser {
  static InstanceMap: Record<string, I18nParser> = {}
  public locale: string = 'zh';

  constructor(locale: string) {
    this.locale = locale
    if (I18nParser.InstanceMap[locale]) return I18nParser.InstanceMap[locale];
    I18nParser.InstanceMap[locale] = this
  }
  // 翻译
  public t(key: string, ...args:(string|number)[]): string {
    const translated = I18nParser.getValue(LangMapping[this.locale], key);
    if(args.length>0) return translated.replace(/\${(\d+)}/g, (match:any, index:number) => args[index]);
    if (translated) return translated
    return key;
  }

  // 获取深层值
  static getValue(data: Record<string, any>, prop: string | string[]): any {
    let ps = Array.isArray(prop) ? prop : prop.split('.');
    try {
      return ps.length == 1 ? data[ps.shift()!] : I18nParser.getValue(data[ps.shift()!], ps);
    } catch (e) {
      return undefined;
    }
  }
}
