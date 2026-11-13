import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// The solar system, real order and real tilts. Sizes and distances are squeezed so a kid can see
// everything at once (real scale would make the planets invisible dots).
// Textures: Solar System Scope (CC BY 4.0), based on NASA imagery. Credited on the Space screen.

export type BodyId = 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'
type Def = { id: BodyId; name: string; tex: string; r: number; dist: number; period: number; tilt: number; spin: number; atmos?: number; parent?: BodyId }

const YEAR = 60 // seconds for one Earth orbit on screen; other periods keep their real ratio (years)
export const BODIES: Def[] = [
  { id: 'mercury', name: 'Mercury', tex: '2k_mercury.jpg', r: 0.45, dist: 9, period: 0.24, tilt: 0.03, spin: 0.2 },
  { id: 'venus', name: 'Venus', tex: '2k_venus_atmosphere.jpg', r: 0.9, dist: 12.5, period: 0.62, tilt: 177.4, spin: 0.1, atmos: 0xffd9a0 },
  { id: 'earth', name: 'Earth', tex: '2k_earth_daymap.jpg', r: 1, dist: 17, period: 1, tilt: 23.4, spin: 1, atmos: 0x6fb8ff },
  // shortcut: the Moon's real month (0.075 yr) looks frantic at this speed, so it orbits slower than real.
  { id: 'moon', name: 'The Moon', tex: '2k_moon.jpg', r: 0.27, dist: 2.4, period: 0.3, tilt: 6.7, spin: 0.2, parent: 'earth' },
  { id: 'mars', name: 'Mars', tex: '2k_mars.jpg', r: 0.6, dist: 22, period: 1.88, tilt: 25.2, spin: 0.97, atmos: 0xff9e6b },
  { id: 'jupiter', name: 'Jupiter', tex: '2k_jupiter.jpg', r: 2.8, dist: 34, period: 11.86, tilt: 3.1, spin: 2.4 },
  { id: 'saturn', name: 'Saturn', tex: '2k_saturn.jpg', r: 2.4, dist: 46, period: 29.46, tilt: 26.7, spin: 2.2 },
  { id: 'uranus', name: 'Uranus', tex: '2k_uranus.jpg', r: 1.6, dist: 56, period: 84, tilt: 97.8, spin: 1.4, atmos: 0x9fe7f0 },
  { id: 'neptune', name: 'Neptune', tex: '2k_neptune.jpg', r: 1.55, dist: 65, period: 164.8, tilt: 28.3, spin: 1.5, atmos: 0x6f8fff },
]
const def = (id: BodyId) => BODIES.find((b) => b.id === id)!

type Options = {
  parent: HTMLElement
  labels: HTMLElement // children with data-body="<id>" are positioned over their planet
  shipAt: BodyId
  skipIntro: boolean
  onReady: () => void
  onIntroDone: () => void
  onArrive: (id: BodyId) => void
  onPick: (id: BodyId) => void
}

const UP = new THREE.Vector3(0, 1, 0)
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2)
const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

export function createSolarSystem(o: Options) {
  const size = () => [o.parent.clientWidth, o.parent.clientHeight] as const
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(...size())
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  o.parent.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, size()[0] / size()[1], 0.01, 3000)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.enabled = false

  const manager = new THREE.LoadingManager(() => start())
  const loader = new THREE.TextureLoader(manager)
  const tex = (file: string) => {
    const t = loader.load(`/textures/${file}`)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }

  const sky = tex('2k_stars_milky_way.jpg')
  sky.mapping = THREE.EquirectangularReflectionMapping
  scene.background = sky
  scene.backgroundIntensity = 0.5

  // Sun: textured sphere + additive glow sprite, and the light every planet is lit by
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), new THREE.MeshBasicMaterial({ map: tex('2k_sun.jpg') })))
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffb347, blending: THREE.AdditiveBlending, depthWrite: false }))
  glow.scale.setScalar(32)
  scene.add(glow)
  scene.add(new THREE.PointLight(0xffffff, 3.2, 0, 0))
  scene.add(new THREE.AmbientLight(0x8899cc, 0.06))

  const meshes = new Map<BodyId, THREE.Mesh>()
  const anchors = new Map<BodyId, THREE.Object3D>()
  const orbiters: { node: THREE.Object3D; speed: number }[] = []
  const spinners: { node: THREE.Object3D; speed: number }[] = []

  BODIES.forEach((b, i) => {
    const host = b.parent ? anchors.get(b.parent)! : scene
    const pivot = new THREE.Object3D()
    pivot.rotation.y = i * 2.39996 // golden angle: planets start spread around the Sun
    host.add(pivot)
    orbiters.push({ node: pivot, speed: (Math.PI * 2) / (b.period * YEAR) })
    host.add(orbitLine(b.dist))

    const anchor = new THREE.Object3D()
    anchor.position.x = b.dist
    pivot.add(anchor)
    anchors.set(b.id, anchor)

    const tilt = new THREE.Object3D()
    tilt.rotation.z = THREE.MathUtils.degToRad(b.tilt)
    anchor.add(tilt)

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(b.r, 64, 64), new THREE.MeshStandardMaterial({ map: tex(b.tex), roughness: 1, metalness: 0 }))
    mesh.userData.id = b.id
    tilt.add(mesh)
    meshes.set(b.id, mesh)
    spinners.push({ node: mesh, speed: b.spin * 0.25 })

    if (b.atmos) tilt.add(atmosphere(b.r, b.atmos))
    if (b.id === 'earth') {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(b.r * 1.015, 64, 64),
        new THREE.MeshStandardMaterial({ alphaMap: tex('2k_earth_clouds.jpg'), transparent: true, depthWrite: false }),
      )
      tilt.add(clouds)
      spinners.push({ node: clouds, speed: 0.32 })
    }
    if (b.id === 'saturn') tilt.add(saturnRing(b.r, tex('2k_saturn_ring_alpha.png')))
  })

  const belt = asteroidBelt()
  scene.add(belt)

  const ship = makeShip()
  scene.add(ship)

  // ---- motion state ----
  type Mode = 'loading' | 'intro' | 'free' | 'flight' | 'orbit'
  let mode: Mode = 'loading'
  let home: BodyId = o.shipAt
  let introT = 0
  let flight = { from: new THREE.Vector3(), to: 'moon' as BodyId, t: 0, dur: 4 }
  const lastFocus = new THREE.Vector3()
  const overview = () => new THREE.Vector3(0, 62, 108).multiplyScalar(camera.aspect < 1 ? 1.9 : 1)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const pos = (id: BodyId, out = new THREE.Vector3()) => meshes.get(id)!.getWorldPosition(out)
  const parkOffset = (id: BodyId) => new THREE.Vector3(1, 0.35, 1).multiplyScalar(def(id).r * 1.6 + 0.45)

  function start() {
    o.onReady()
    if (o.skipIntro || reduced) {
      camera.position.copy(overview())
      enterFree()
    } else {
      mode = 'intro'
    }
  }

  function enterFree() {
    mode = 'free'
    controls.target.set(0, 0, 0)
    controls.minDistance = 4
    controls.maxDistance = 240
    controls.enabled = true
    o.onIntroDone()
  }

  function flyTo(id: BodyId) {
    if (mode === 'flight' || mode === 'loading') return
    controls.enabled = false
    const from = ship.position.clone()
    flight = { from, to: id, t: 0, dur: reduced ? 1 : THREE.MathUtils.clamp(from.distanceTo(pos(id)) / 5, 3, 6.5) }
    mode = 'flight'
  }

  // ---- tap a planet (a tap, not a drag) ----
  const ray = new THREE.Raycaster()
  let down = { x: 0, y: 0 }
  const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY })
  const onUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || mode === 'flight' || mode === 'loading') return
    const r = renderer.domElement.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
    const hit = ray.intersectObjects([...meshes.values()], false)[0]
    if (hit) o.onPick(hit.object.userData.id)
  }
  renderer.domElement.addEventListener('pointerdown', onDown)
  renderer.domElement.addEventListener('pointerup', onUp)

  const onResize = () => {
    const [w, h] = size()
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', onResize)

  if (import.meta.env.DEV) Object.assign(window, { __space: { camera, renderer, controls } })

  const labels = [...o.labels.querySelectorAll<HTMLElement>('[data-body]')].map((el) => ({ el, id: el.dataset.body as BodyId }))

  // ---- frame loop ----
  const clock = new THREE.Clock()
  const v = new THREE.Vector3()
  const target = new THREE.Vector3()
  let raf = 0
  camera.position.copy(pos('earth').add(new THREE.Vector3(2, 1, 3)))

  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    orbiters.forEach((p) => (p.node.rotation.y += p.speed * dt))
    spinners.forEach((s) => (s.node.rotation.y += s.speed * dt))
    belt.rotation.y += 0.004 * dt
    const flame = ship.userData.flame as THREE.Mesh
    flame.visible = mode === 'flight'
    flame.scale.y = 1 + Math.sin(performance.now() / 40) * 0.25

    if (mode !== 'flight') {
      ship.position.copy(pos(home)).add(parkOffset(home))
      ship.quaternion.identity()
    }

    if (mode === 'intro') {
      introT += dt
      const p = ease(Math.min(introT / 6, 1))
      const near = ship.position.clone().add(new THREE.Vector3(0.9, 0.35, 1.4))
      camera.position.lerpVectors(near, overview(), p)
      camera.lookAt(target.lerpVectors(ship.position, new THREE.Vector3(), smooth(0.1, 0.9, p)))
      if (p >= 1) enterFree()
    } else if (mode === 'flight') {
      flight.t += dt
      const p = ease(Math.min(flight.t / flight.dur, 1))
      const dest = pos(flight.to)
      const away = flight.from.clone().sub(dest).setY(0).normalize()
      const end = dest.clone().addScaledVector(away, def(flight.to).r * 3)
      const prev = ship.position.clone()
      ship.position.lerpVectors(flight.from, end, p)
      ship.position.y += Math.sin(Math.PI * p) * flight.from.distanceTo(end) * 0.12
      const dir = ship.position.clone().sub(prev)
      if (dir.lengthSq() > 1e-8) ship.quaternion.setFromUnitVectors(UP, dir.normalize())
      const heading = new THREE.Vector3(0, 1, 0).applyQuaternion(ship.quaternion)
      const chase = ship.position.clone().addScaledVector(heading, -1.5).add(new THREE.Vector3(0, 0.5, 0))
      const arrival = dest.clone().addScaledVector(away, def(flight.to).r * 7).add(new THREE.Vector3(0, def(flight.to).r * 2.5, 0))
      const k = smooth(0.7, 1, p)
      camera.position.lerpVectors(chase, arrival, k)
      camera.lookAt(target.lerpVectors(ship.position, dest, k))
      if (flight.t >= flight.dur) {
        home = flight.to
        mode = 'orbit'
        lastFocus.copy(dest)
        controls.target.copy(dest)
        controls.minDistance = def(home).r * 1.8
        controls.maxDistance = def(home).r * 30
        controls.enabled = true
        o.onArrive(home)
      }
    } else if (mode === 'orbit') {
      // keep the camera riding along with the world we orbit
      pos(home, v)
      camera.position.add(target.copy(v).sub(lastFocus))
      controls.target.copy(v)
      lastFocus.copy(v)
    }

    if (controls.enabled) controls.update()

    const [w, h] = size()
    for (const { el, id } of labels) {
      const below = id === 'moon' // the Moon's label sits under it so it doesn't cover Earth's
      pos(id, v).y += def(id).r * (below ? -1.5 : 1.5)
      v.project(camera)
      const show = v.z < 1 && mode !== 'flight' && mode !== 'loading'
      el.style.visibility = show ? 'visible' : 'hidden'
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px) translate(-50%, ${below ? '0' : '-100%'})`
    }
    renderer.render(scene, camera)
  }
  frame()

  return {
    flyTo,
    dispose() {
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
      controls.dispose()
      scene.traverse((node) => {
        const n = node as THREE.Mesh
        n.geometry?.dispose()
        ;[n.material].flat().forEach((m) => {
          if (!m) return
          Object.values(m).forEach((val) => val instanceof THREE.Texture && val.dispose())
          m.dispose()
        })
      })
      sky.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

// ---------- builders ----------

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, 'rgba(255,230,170,1)')
  grad.addColorStop(0.25, 'rgba(255,190,90,0.55)')
  grad.addColorStop(1, 'rgba(255,150,50,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

// Soft rim glow: brightest where the surface turns away from the camera.
function atmosphere(r: number, color: number) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r * 1.07, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(color) } },
      vertexShader: `varying vec3 n; varying vec3 view;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); n = normalize(normalMatrix*normal); view = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 c; varying vec3 n; varying vec3 view;
        void main(){ float f = pow(1.0 - max(dot(n, view), 0.0), 3.0); gl_FragColor = vec4(c, f * 0.9); }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
}

function saturnRing(r: number, map: THREE.Texture) {
  const inner = r * 1.25
  const outer = r * 2.3
  const geo = new THREE.RingGeometry(inner, outer, 128)
  // the ring texture is a radial strip: map distance-from-center to u
  const p = geo.attributes.position
  const uv = geo.attributes.uv
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) uv.setXY(i, (v.fromBufferAttribute(p, i).length() - inner) / (outer - inner), 0.5)
  const ring = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map, transparent: true, side: THREE.DoubleSide, color: 0xd9ccb0, depthWrite: false }))
  ring.rotation.x = -Math.PI / 2
  return ring
}

function orbitLine(radius: number) {
  const pts = Array.from({ length: 256 }, (_, i) => {
    const a = (i / 256) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
  })
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x7f8fd6, transparent: true, opacity: 0.22 }))
}

// Main belt between Mars and Jupiter.
function asteroidBelt() {
  const n = 2400
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const d = 26.5 + Math.random() * 4.5
    arr.set([Math.cos(a) * d, (Math.random() - 0.5) * 0.8, Math.sin(a) * d], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xa89f91, size: 0.09 }))
}

// Simple rocket pointing along +Y, with a flame cone behind it.
function makeShip() {
  const g = new THREE.Group()
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f4fa, roughness: 0.45, metalness: 0.3 })
  const red = new THREE.MeshStandardMaterial({ color: 0xe5484d, roughness: 0.5 })
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.36, 20), white))
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 20), red)
  nose.position.y = 0.26
  g.add(nose)
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.12, 0.08), red)
    const a = (i / 3) * Math.PI * 2
    fin.position.set(Math.cos(a) * 0.09, -0.13, Math.sin(a) * 0.09)
    fin.rotation.y = -a
    g.add(fin)
  }
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.28, 16),
    new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  flame.rotation.x = Math.PI
  flame.position.y = -0.33
  g.add(flame)
  g.userData.flame = flame
  return g
}
