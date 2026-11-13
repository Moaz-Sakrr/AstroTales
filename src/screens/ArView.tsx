import DeviceModel from '../components/DeviceModel'
import type { Device } from '../content/types'
import { en } from '../content/i18n/en'

// What a phone opens after scanning the QR: just the machine and the AR button, no game state needed.
export default function ArView({ device }: { device: Device }) {
  return (
    // h-svh (not min-h): the model fills the leftover height, which needs a fixed page height
    <main className="flex h-svh flex-col bg-navy-950">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <h1 className="text-xl font-bold">{device.nickname}</h1>
        <a href={location.pathname} className="grid min-h-11 place-items-center rounded-full px-4 font-semibold text-fact underline underline-offset-2">
          {en.ar.open}
        </a>
      </header>
      <DeviceModel device={device} className="flex-1" />
    </main>
  )
}
