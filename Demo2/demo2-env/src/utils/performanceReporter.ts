// src/utils/performanceReporter.ts

interface ReportData {
  url: string;
  lcp?: number;
  cls?: number;
  fid?: number;
  fcp?: number;
  ttfb?: number;
  timestamp: number;
}

export function reportWebVitals() {
  const report: ReportData = {
    url: window.location.href,
    timestamp: Date.now(),
  };

  // 1. 监听 LCP（最大内容绘制）
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      report.lcp = lastEntry.startTime;
      console.log('[性能监控] LCP:', report.lcp);
      // sendToServer(report);
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // 2. 监听 CLS（累积布局偏移）
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
      // 只统计用户无操作时的偏移（有操作的不算）
      if (!entry.hadRecentInput) {
        clsValue += entry.value ?? 0;
      }
    }
    report.cls = clsValue;
    console.log('[性能监控] CLS:', report.cls);
  }).observe({ entryTypes: ['layout-shift'] });

  // 3. 监听 FID（首次输入延迟）
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const firstEntry = entries[0] as PerformanceEntry & { processingStart: number };
    if (firstEntry) {
      report.fid = firstEntry.processingStart - firstEntry.startTime;
      console.log('[性能监控] FID:', report.fid);
    }
  }).observe({ entryTypes: ['first-input'] });

  // 4. 监听 FCP（首次内容绘制）
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const firstEntry = entries[0];
    if (firstEntry) {
      report.fcp = firstEntry.startTime;
      console.log('[性能监控] FCP:', report.fcp);
    }
  }).observe({ entryTypes: ['paint'] });

  // 5. TTFB（首字节时间）
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    for (const entry of entries) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        report.ttfb = navEntry.responseStart - navEntry.requestStart;
        console.log('[性能监控] TTFB:', report.ttfb);
      }
    }
  }).observe({ entryTypes: ['navigation'] });
}
