import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ShareImageModal } from '@/components/share/ShareImageModal';
import { ShareContent } from '@/types/share';

interface ShareSheetContextValue {
  share: (content: ShareContent) => void;
}

const ShareSheetContext = createContext<ShareSheetContextValue | null>(null);

export function ShareProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [content, setContent] = useState<ShareContent | null>(null);
  const [visible, setVisible] = useState(false);

  const share = useCallback((next: ShareContent) => {
    setContent(next);
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ share }), [share]);

  return (
    <ShareSheetContext.Provider value={value}>
      {children}
      <ShareImageModal visible={visible} content={content} onClose={close} />
    </ShareSheetContext.Provider>
  );
}

export function useShareSheet(): ShareSheetContextValue {
  const ctx = useContext(ShareSheetContext);
  if (!ctx) {
    return { share: () => undefined };
  }
  return ctx;
}

export default ShareProvider;
