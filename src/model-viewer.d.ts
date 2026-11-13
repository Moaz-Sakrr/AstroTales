import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { ModelViewerElement } from '@google/model-viewer'

// Lets TSX use <model-viewer>. Hyphenated attributes (camera-controls, ar-modes…) need no typing.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> & { src: string; alt: string; ar?: boolean }
    }
  }
}
