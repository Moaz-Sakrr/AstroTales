import { useEffect, useRef, useState } from 'react'
import type { ModelViewerElement } from '@google/model-viewer'
import { renderSVG } from 'uqr'
import Button from './Button'
import type { Device } from '../content/types'
import { en } from '../content/i18n/en'
import { useMedia } from '../hooks/useMedia'

const t = en.ar
const NASA_3D = 'https://science.nasa.gov/3d-resources/'

// model-viewer (and its WebGL code) is big: load it only when a 3D view opens.
// The Draco decoder location must be set before the library loads, or it fetches from Google's CDN.
let loadLib: Promise<unknown> | undefined
function loadModelViewer() {
  const w = window as unknown as { ModelViewerElement?: object }
  w.ModelViewerElement = { ...w.ModelViewerElement, dracoDecoderLocation: '/draco/' }
  return (loadLib ??= import('@google/model-viewer'))
}

export default function DeviceModel({ device, className = '' }: { device: Device; className?: string }) {
  const ref = useRef<ModelViewerElement>(null)
  const [ready, setReady] = useState(false)
  const [state, setState] = useState<'loading' | 'ar' | 'no-ar' | 'error'>('loading')
  const still = useMedia('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    loadModelViewer().then(() => setReady(true), () => setState('error'))
  }, [])

  useEffect(() => {
    const mv = ref.current
    if (!mv) return
    const onLoad = () => setState(mv.canActivateAR ? 'ar' : 'no-ar')
    const onError = () => setState('error')
    mv.addEventListener('load', onLoad)
    mv.addEventListener('error', onError)
    return () => {
      mv.removeEventListener('load', onLoad)
      mv.removeEventListener('error', onError)
    }
  }, [ready])

  if (!device.model3d) return null
  // The QR opens this same machine on a phone (App reads ?ar=).
  const link = `${location.origin}${location.pathname}?ar=${device.id}`

  return (
    <div className={`relative ${className}`}>
      {ready && state !== 'error' && (
        <model-viewer
          ref={ref}
          src={device.model3d}
          alt={device.name}
          ar // React 19 sets this as a property, so it must be a real boolean, not ""
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          camera-controls=""
          auto-rotate={still ? undefined : ''}
          shadow-intensity="1"
          style={{ width: '100%', height: '100%' }}
        >
          <Button slot="ar-button" className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">{t.button}</Button>
        </model-viewer>
      )}

      {state === 'loading' && <p className="pointer-events-none absolute inset-0 grid place-items-center text-text-muted">{t.loading}</p>}
      {state === 'error' && <p className="grid h-full place-items-center p-4 text-center text-text-muted">{t.error}</p>}

      {state === 'no-ar' && (
        <figure className="absolute right-3 top-3 w-36 rounded-2xl bg-paper p-2 text-center text-navy-900 sm:w-44">
          {/* QR needs a light quiet zone around it to scan reliably */}
          <div role="img" aria-label={t.qr} className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: renderSVG(link) }} />
          <figcaption className="mt-1 text-xs leading-snug">{t.scan}</figcaption>
        </figure>
      )}

      <a href={NASA_3D} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-3 text-xs text-fact underline underline-offset-2">
        {t.credit}
      </a>
    </div>
  )
}
