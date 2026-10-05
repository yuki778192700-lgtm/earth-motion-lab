const MAX_ENTRIES = 100
const LABEL_SELECTOR = [
  '.orbit-marker-label', '.obliquity-label', '.terminator-label',
  '.sunlight-label', '.hemisphere-label', '.observer-marker-label',
  '.subsolar-label', '.solar-altitude-label', '.local-time-marker',
  '.thermal-zone-label', '.planned-scene-notice',
].join(',')

type DiagnosticKind = 'start' | 'stop' | 'label-added' | 'label-removed' | 'root-error' | 'window-error'
export interface LabelDiagnosticEntry {
  sequence: number
  timestamp: string
  moduleId: string
  kind: DiagnosticKind
  details: Record<string, unknown>
}

export function isLabelLifecycleError(message: string): boolean {
  return message.includes('Attempted to synchronously unmount a root')
    || (message.includes('removeChild') && message.includes('not a child'))
}

/** 有界、只读诊断记录；不订阅或修改模拟状态。 */
export function createLabelDiagnosticsRecorder(
  getModuleId: () => string,
  emit: (entry: LabelDiagnosticEntry) => void,
  now: () => number = Date.now,
) {
  const entries: LabelDiagnosticEntry[] = []
  let sequence = 0
  return {
    record(kind: DiagnosticKind, details: Record<string, unknown> = {}) {
      const entry = { sequence: ++sequence, timestamp: new Date(now()).toISOString(), moduleId: getModuleId(), kind, details }
      entries.push(entry)
      if (entries.length > MAX_ENTRIES) entries.shift()
      emit(entry)
    },
    recent() { return entries.slice(-30).map(entry => ({ ...entry, details: { ...entry.details } })) },
    size() { return entries.length },
  }
}

/** 仅由main.tsx的DEV分支安装。记录真实DOM变化，不包装Html或改变卸载顺序。 */
export function installLabelLifecycleDiagnostics(getModuleId: () => string): () => void {
  const recorder = createLabelDiagnosticsRecorder(getModuleId, entry => {
    console.info(`[EarthLabelDiagnostics] ${JSON.stringify(entry)}`)
  })
  const ids = new WeakMap<Element, number>()
  let nextId = 0
  let stopped = false
  const labelsIn = (node: Node): Element[] => node instanceof Element
    ? [...(node.matches(LABEL_SELECTOR) ? [node] : []), ...node.querySelectorAll(LABEL_SELECTOR)]
    : []
  const recordLabel = (kind: 'label-added' | 'label-removed', label: Element, parent: Node | null) => {
    if (!ids.has(label)) ids.set(label, ++nextId)
    recorder.record(kind, {
      labelId: ids.get(label), className: label.className,
      text: label.textContent?.trim().slice(0, 120),
      mutationParent: parent?.nodeName, connectedAtObservation: label.isConnected,
    })
  }
  const observer = new MutationObserver(records => {
    for (const mutation of records) {
      for (const node of mutation.removedNodes) for (const label of labelsIn(node)) recordLabel('label-removed', label, mutation.target)
      for (const node of mutation.addedNodes) for (const label of labelsIn(node)) recordLabel('label-added', label, mutation.target)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
  document.querySelectorAll(LABEL_SELECTOR).forEach(label => recordLabel('label-added', label, label.parentNode))
  const originalError = console.error
  const errorText = (value: unknown): string => value instanceof Error ? `${value.name}: ${value.message}` : typeof value === 'string' ? value : ''
  const diagnosticError: typeof console.error = (...args: unknown[]) => {
    const message = args.map(errorText).join(' ')
    if (isLabelLifecycleError(message)) {
      // MutationObserver回调在提交结束后执行；调用栈必须在原console.error调用现场捕获。
      recorder.record('root-error', { message, stack: new Error('Label lifecycle call site').stack, recentLabels: recorder.recent().filter(entry => entry.kind.startsWith('label-')) })
    }
    // 不吞错、不改变React行为，也不把错误降级成普通日志。
    originalError.apply(console, args)
  }
  const onError = (event: ErrorEvent) => {
    if (isLabelLifecycleError(event.message)) recorder.record('window-error', {
      message: event.message, stack: event.error instanceof Error ? event.error.stack : undefined,
      filename: event.filename, line: event.lineno,
      recentLabels: recorder.recent().filter(entry => entry.kind.startsWith('label-')),
    })
  }
  console.error = diagnosticError
  window.addEventListener('error', onError)
  recorder.record('start', { scope: 'development only; DOM lifecycle, not React effect lifecycle' })
  return () => {
    if (stopped) return
    stopped = true
    observer.disconnect()
    window.removeEventListener('error', onError)
    if (console.error === diagnosticError) console.error = originalError
    recorder.record('stop')
  }
}
