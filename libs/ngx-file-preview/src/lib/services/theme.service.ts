import {Injectable, Renderer2} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AutoThemeConfig, ThemeMode} from '../types/theme.types';

@Injectable()
export class ThemeService {
  private readonly THEME_KEY = 'fp-theme-mode';
  private themeSubject$ = new BehaviorSubject<ThemeMode>('dark');
  private autoConfig: AutoThemeConfig = {
    dark: {start: 18, end: 6}
  };

  private autoChangeTimer: any;
  systemThemeQuery: MediaQueryList | null = null;
  private systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;
  private localDomElement: HTMLElement | null = null;
  constructor(private renderer: Renderer2) {
  }

  /**
   * 绑定最外围元素
   * @param domElement
   */
  bindElement(domElement: HTMLElement) {
    this.localDomElement = domElement;
  }

  ngOnInit() {
    if (window.matchMedia) {
      this.systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemThemeListener = (e) => {
        if (this.theme === 'auto') {
          this.checkAndApplyAutoTheme();
        }
      };
      this.systemThemeQuery.addEventListener('change', this.systemThemeListener);
    }
    this.applyTheme('dark');
  }

  get theme() {
    return this.themeSubject$.getValue();
  }

  getThemeObservable() {
    return this.themeSubject$.asObservable();
  }

  setMode(mode: ThemeMode) {
    this.themeSubject$.next(mode);
    if (mode === 'auto') {
      this.startAutoCheck();
    } else {
      this.stopAutoCheck();
      this.applyTheme(mode);
    }
  }

  setAutoConfig(config: AutoThemeConfig) {
    this.autoConfig = {...this.autoConfig, ...config};
    if (this.themeSubject$.getValue() === 'auto') {
      this.checkAndApplyAutoTheme();
    }
  }

  private startAutoCheck() {
    this.checkAndApplyAutoTheme();
    this.autoChangeTimer = setInterval(() => {
      this.checkAndApplyAutoTheme();
    }, 60000); // 每分钟检查一次
  }

  private stopAutoCheck() {
    if (this.autoChangeTimer) {
      clearInterval(this.autoChangeTimer);
      this.autoChangeTimer = null;
    }
  }

  private checkAndApplyAutoTheme() {
    const hour = new Date().getHours();
    const {start, end} = this.autoConfig.dark;

    // 检查是否在暗色时间范围内
    const isDarkTime = start > end
      ? (hour >= start || hour < end)  // 跨夜间
      : (hour >= start && hour < end); // 同一天内

    // 检查系统主题
    const prefersDark = this.systemThemeQuery?.matches ?? false;

    // 优先使用时间判断，其次使用系统主题
    this.applyTheme(isDarkTime || prefersDark ? 'dark' : 'light');
  }

  private applyTheme(theme: 'light' | 'dark') {
    // 更新当前主题
    this.themeSubject$.next(theme);
    if(this.localDomElement){
      // 移除现有主题
      this.renderer.removeAttribute(this.localDomElement, 'data-nfp-theme');
      // 应用新主题
      if (theme === 'dark') {
        this.renderer.setAttribute(this.localDomElement, 'data-nfp-theme', 'dark');
      } else {
        this.renderer.setAttribute(this.localDomElement, 'data-nfp-theme', 'light');
      }
    }
    // 保存到本地存储
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setMode(newTheme);
  }

  ngOnDestroy() {
    this.stopAutoCheck();

    // 清理系统主题监听
    if (this.systemThemeQuery && this.systemThemeListener) {
      this.systemThemeQuery.removeEventListener('change', this.systemThemeListener);
    }
  }
}
