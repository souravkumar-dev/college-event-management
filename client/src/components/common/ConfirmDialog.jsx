import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(async () => false);

// const confirm = useConfirm();  if (await confirm({ title, text, confirmText })) { ... }
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const confirm = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), []);
  const close = (value) => { state?.resolve(value); setState(null); };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => close(false)}>
          <div className="card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-danger flex items-center justify-center shrink-0"><AlertTriangle size={20} /></div>
              <div>
                <h2 className="font-semibold text-ink">{state.title || 'Are you sure?'}</h2>
                {state.text && <p className="text-sm text-ink-muted mt-1">{state.text}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-outline" onClick={() => close(false)}>Keep</button>
              <button className="btn bg-danger text-white hover:bg-red-600" onClick={() => close(true)}>{state.confirmText || 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
