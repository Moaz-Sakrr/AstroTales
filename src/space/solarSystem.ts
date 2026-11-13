import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// The solar system, real order and real tilts. Sizes and distances are squeezed so a kid can see
// everything at once (real scale would make the planets invisible dots).
// Textures: Solar System Scope (CC BY 4.0), based on NASA imagery. Credited on the Space screen.

export type BodyId = 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'deep'
type Def = { id: BodyId; name: string; tex: string; r: number; dist: number; period: number; tilt: number; spin: number; atmos?: number; parent?: BodyId; lumpy?: boolean }

const YEAR = 60 // seconds for one Earth orbit on screen; other periods keep their real ratio (years)
export const BODIES: Def[] = [
  { id: 'mercury', name: 'Mercury', tex: '2k_mercury.jpg', r: 0.45, dist: 9, period: 0.24, tilt: 0.03, spin: 0.2 },
  { id: 'venus', name: 'Venus', tex: '2k_venus_atmosphere.jpg', r: 0.9, dist: 12.5, period: 0.62, tilt: 177.4, spin: 0.1, atmos: 0xffd9a0 },
  { id: 'earth', name: 'Earth', tex: '2k_earth_daymap.jpg', r: 1, dist: 17, period: 1, tilt: 23.4, spin: 1, atmos: 0x6fb8ff },
  // shortcut: the Moon's real month (0.075 yr) looks frantic at this speed, so it orbits slower than real.
  { id: 'moon', name: 'The Moon', tex: '2k_moon.jpg', r: 0.27, dist: 2.4, period: 0.3, tilt: 6.7, spin: 0.2, parent: 'earth' },
  { id: 'mars', name: 'Mars', tex: '2k_mars.jpg', r: 0.6, dist: 22, period: 1.88, tilt: 25.2, spin: 0.97, atmos: 0xff9e6b },
  // 'Deep space' world: a lumpy asteroid parked in the main belt (stands in for Eros, Vesta and Ceres)
  { id: 'deep', name: 'Deep space', tex: '2k_moon.jpg', r: 0.5, dist: 28.5, period: 4.6, tilt: 12, spin: 0.6, lumpy: true },
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
const PARK_DIR = new THREE.Vector3(1, 0.35, 1).normalize() // the parked ship sits on this side of its world
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

    const mesh = new THREE.Mesh(b.lumpy ? asteroidGeometry(b.r) : new THREE.SphereGeometry(b.r, 64, 64), new THREE.MeshStandardMaterial({ map: tex(b.tex), roughness: 1, metalness: 0 }))
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

  // The ship, its exhaust trail and speed streaks live in their own scene, drawn after the planets.
  // While flying we clear depth in between, so no planet can ever cover the ship.
  const shipScene = new THREE.Scene()
  shipScene.add(new THREE.PointLight(0xffffff, 3.2, 0, 0), new THREE.AmbientLight(0x8899cc, 0.35))
  const ship = makeShip()
  const trail = makeTrail()
  const streaks = makeStreaks()
  // soft fill from the viewer's side so the ship never turns into a black silhouette against the Sun
  const fill = new THREE.DirectionalLight(0xfff1d6, 1.1)
  fill.target = ship
  shipScene.add(ship, trail.points, streaks.lines, fill)
  renderer.autoClear = false

  // ---- motion state ----
  type Mode = 'loading' | 'intro' | 'free' | 'flight' | 'orbit'
  let mode: Mode = 'loading'
  let home: BodyId = o.shipAt
  let introT = 0
  let flight = {
    to: 'moon' as BodyId,
    t: 0,
    dur: 4,
    curve: new THREE.CubicBezierCurve3(),
    out: 1, // how far the curve's handles reach out from each world's parking side…
    lift: 1, // …and up over the planets' plane
    roll: false,
    camFrom: new THREE.Vector3(),
    lookFrom: new THREE.Vector3(),
    camDist: 1,
    swing: 0.6,
  }
  let timeScale = 1 // the planets nearly freeze while the ship flies, so it never chases a moving target
  const lastFocus = new THREE.Vector3()
  // Phones (portrait) get a wider lens and a steeper, closer overview: the playable inner worlds, out to the
  // asteroid belt, fill the screen width instead of a thin strip; the giants are a drag/pinch away.
  const portrait = () => camera.aspect < 1
  const baseFov = () => (portrait() ? 55 : 45)
  const overview = () => {
    if (!portrait()) return new THREE.Vector3(0, 62, 108)
    const halfWidth = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)
    const d = 31 / Math.tan(halfWidth)
    return new THREE.Vector3(0, Math.sin(1.05) * d, Math.cos(1.05) * d)
  }
  camera.fov = baseFov()
  camera.updateProjectionMatrix()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const pos = (id: BodyId, out = new THREE.Vector3()) => meshes.get(id)!.getWorldPosition(out)
  // Which side of a world the parked ship sits on. A moon's is its far side from its planet, turning with
  // its orbit, so the planet is always a backdrop and never comes between the camera and the ship.
  const parentPos = new THREE.Vector3()
  const parkDir = (id: BodyId, out = new THREE.Vector3()) => {
    const parent = def(id).parent
    if (!parent) return out.copy(PARK_DIR)
    return pos(id, out).sub(pos(parent, parentPos)).setY(0).normalize().setY(0.25).normalize()
  }
  const parkOffset = (id: BodyId) => parkDir(id).multiplyScalar(Math.hypot(1, 0.35, 1) * (def(id).r * 1.6 + 0.45))
  const orbitAngle = (id: BodyId) => {
    pos(id, parentPos).sub(pos(def(id).parent ?? id, center))
    return Math.atan2(parentPos.x, parentPos.z)
  }
  let lastAngle = 0

  // Push p out of every body (and the Sun) it gets too close to. weight 0..1 fades the push in and out.
  const tmp = new THREE.Vector3()
  const center = new THREE.Vector3()
  const keepOut = (p: THREE.Vector3, scale: number, weight: number) => {
    const push = (c: THREE.Vector3, min: number) => {
      const d = p.distanceTo(c)
      if (d < min && d > 1e-6) p.lerp(tmp.copy(p).sub(c).multiplyScalar(min / d).add(c), weight)
    }
    for (const b of BODIES) push(pos(b.id, center), b.r * scale + 0.25)
    push(center.set(0, 0, 0), 5 * scale)
  }

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
    const to = pos(id)
    const d = from.distanceTo(to)
    // arc up over the planets' plane; arc much higher if the straight line would cut past the Sun
    const nearSun = new THREE.Line3(from, to).closestPointToPoint(center.set(0, 0, 0), true, tmp).length() < 9
    const lift = nearSun ? Math.max(10, d * 0.3) : Math.max(1, d * 0.28)
    const curve = new THREE.CubicBezierCurve3(from, from.clone(), to.clone(), to.clone())
    flight = {
      to: id,
      t: 0,
      dur: reduced ? 1.2 : THREE.MathUtils.clamp(3 + d / 7, 4, 7),
      curve,
      out: Math.min(d * 0.3, 6),
      lift,
      roll: !reduced && d > 6,
      camFrom: camera.position.clone(),
      lookFrom: (mode === 'intro' ? target : controls.target).clone(),
      camDist: THREE.MathUtils.clamp(parkOffset(id).length() * 3, def(id).r * 2.5, def(id).r * 25),
      // arrival shot: camera swung round from the ship's side so ship and world share the frame;
      // a narrow phone screen gets a smaller swing so the ship isn't left outside it
      swing: portrait() ? 0.25 : 0.6,
    }
    curve.v1.copy(from).addScaledVector(parkDir(home), flight.out).add(tmp.set(0, lift, 0))
    camPos.copy(camera.position).sub(from) // both kept as offsets from the ship
    camLook.copy(flight.lookFrom).sub(from)
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
    if (mode !== 'flight') camera.fov = baseFov() // phone rotated
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', onResize)

  if (import.meta.env.DEV) Object.assign(window, { __space: { camera, renderer, controls } })

  const labels = [...o.labels.querySelectorAll<HTMLElement>('[data-body]')].map((el) => ({ el, id: el.dataset.body as BodyId }))

  // ---- frame loop ----
  const clock = new THREE.Clock()
  const v = new THREE.Vector3()
  const target = new THREE.Vector3()
  // flight scratch: damped camera (offsets from the ship), ship heading, chase framing
  const camPos = new THREE.Vector3()
  const camLook = new THREE.Vector3()
  const want = new THREE.Vector3()
  const wantLook = new THREE.Vector3()
  const tan = new THREE.Vector3()
  const side = new THREE.Vector3()
  const nozzle = new THREE.Vector3()
  const lastNozzle = new THREE.Vector3()
  const qFly = new THREE.Quaternion()
  const qRoll = new THREE.Quaternion()
  const UPRIGHT = new THREE.Quaternion()
  let raf = 0
  camera.position.copy(pos('earth').add(new THREE.Vector3(2, 1, 3)))

  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    timeScale += ((mode === 'flight' ? 0.04 : 1) - timeScale) * Math.min(1, dt * 3)
    orbiters.forEach((p) => (p.node.rotation.y += p.speed * dt * timeScale))
    spinners.forEach((s) => (s.node.rotation.y += s.speed * dt))
    belt.rotation.y += 0.004 * dt * timeScale
    const { flame, glow: nozzleGlow } = ship.userData as { flame: THREE.Object3D; glow: THREE.Sprite }
    let thrust = 0
    let speed = 0

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
      // Choreography (s = 0..1): lift off upright → pitch onto the arc → boost (FOV kick, streaks,
      // a barrel roll on long trips) → brake → swing the camera round and settle upright in parking orbit.
      flight.t += dt
      const s = Math.min(flight.t / flight.dur, 1)
      const dest = pos(flight.to)
      const { curve } = flight
      curve.v3.copy(dest).add(parkOffset(flight.to)) // ends exactly where the parked ship sits: no jump on arrival
      curve.v2.copy(curve.v3).addScaledVector(parkDir(flight.to, v), flight.out).add(tmp.set(0, flight.lift, 0))
      curve.getPoint(ease(s), ship.position)
      keepOut(ship.position, 1.5, smooth(0, 0.1, s) * (1 - smooth(0.85, 1, s)))
      curve.getTangent(Math.min(ease(s), 0.999), tan)

      speed = reduced ? 0 : smooth(0.15, 0.35, s) * (1 - smooth(0.62, 0.86, s))
      thrust = (1 - smooth(0.82, 1, s)) * (0.6 + 1.3 * speed)

      qFly.setFromUnitVectors(UP, tan)
      if (flight.roll) qFly.multiply(qRoll.setFromAxisAngle(UP, Math.PI * 2 * smooth(0.36, 0.6, s)))
      ship.quaternion.copy(UPRIGHT).slerp(qFly, smooth(0, 0.12, s) * (1 - smooth(0.86, 1, s)))

      // camera: leave the old view → chase from behind, above and a little to the side → arrival framing
      side.crossVectors(tan, UP)
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0)
      side.normalize()
      const chase = tmp.copy(ship.position).addScaledVector(tan, -(1.2 + 0.5 * speed)).addScaledVector(UP, 0.4).addScaledVector(side, 0.4)
      const arrive = parkDir(flight.to, v).applyAxisAngle(UP, flight.swing).setY(0.45).normalize().multiplyScalar(flight.camDist).add(dest)
      const leave = smooth(0, 0.22, s)
      const settle = smooth(0.68, 1, s)
      want.copy(flight.camFrom).lerp(chase, leave).lerp(arrive, settle)
      keepOut(want, 1.25, 1)
      // the eye finds the ship before the camera gets there, so lift-off is never framed off-screen
      wantLook.copy(flight.lookFrom).lerp(chase.copy(ship.position).addScaledVector(tan, 0.8), smooth(0, 0.12, s)).lerp(dest, settle)
      // damp relative to the ship, so the camera eases its framing but never falls behind at full speed
      const damp = 1 - Math.exp(-dt * 5)
      camPos.lerp(want.sub(ship.position), damp)
      camLook.lerp(wantLook.sub(ship.position), damp)
      camera.position.copy(camPos).add(ship.position)
      if (!reduced) {
        // engine rumble at ignition, a faint buzz at full speed
        const shake = 0.03 * smooth(0, 0.03, s) * (1 - smooth(0.05, 0.28, s)) + 0.006 * speed
        camera.position.add(tmp.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(shake))
      }
      camera.lookAt(tmp.copy(camLook).add(ship.position))
      camera.fov = baseFov() + 16 * speed
      camera.updateProjectionMatrix()

      if (flight.t >= flight.dur) {
        home = flight.to
        mode = 'orbit'
        camera.fov = baseFov()
        camera.updateProjectionMatrix()
        lastFocus.copy(dest)
        lastAngle = orbitAngle(home)
        controls.target.copy(dest)
        controls.minDistance = def(home).r * 1.8
        controls.maxDistance = def(home).r * 30
        controls.enabled = true
        o.onArrive(home)
      }
    } else if (mode === 'orbit') {
      // keep the camera riding along with the world we orbit (and turning with a moon's orbit, like the ship)
      pos(home, v)
      camera.position.add(target.copy(v).sub(lastFocus))
      if (def(home).parent) {
        const a = orbitAngle(home)
        camera.position.sub(v).applyAxisAngle(UP, a - lastAngle).add(v)
        lastAngle = a
      }
      controls.target.copy(v)
      lastFocus.copy(v)
    }

    if (controls.enabled) controls.update()

    // engine: layered flame + nozzle glow, and a glowing exhaust trail left behind in space
    const flicker = 1 + Math.sin(performance.now() / 35) * 0.12 + Math.random() * 0.1
    flame.visible = nozzleGlow.visible = thrust > 0.01
    flame.scale.set(0.85 + 0.15 * thrust, Math.min(thrust, 0.5 + 0.5 * thrust) * flicker, 0.85 + 0.15 * thrust)
    nozzleGlow.scale.setScalar((0.12 + 0.18 * thrust) * flicker)
    ship.updateMatrixWorld()
    ship.localToWorld(nozzle.set(0, -0.26, 0))
    if (thrust > 0.2 && !reduced) {
      for (let i = 0; i < 6; i++) {
        trail.emit(tmp.lerpVectors(lastNozzle, nozzle, i / 6).addScalar((Math.random() - 0.5) * 0.04))
      }
    }
    lastNozzle.copy(nozzle)
    trail.update(dt)
    streaks.update(dt, ship.position, mode === 'flight' ? tan : UP, speed)

    placeLabels(mode !== 'flight' && mode !== 'loading')

    fill.position.copy(camera.position)
    renderer.clear()
    renderer.render(scene, camera)
    if (mode === 'flight') renderer.clearDepth()
    renderer.render(shipScene, camera)
  }

  // Name tags follow their planet. Tags never pile up: the most important (data-priority) and nearest
  // are placed first, and any tag that would overlap one already placed fades out.
  const LABEL_H = 30 // visible chip + leader line; the rest of the 44px tap target is empty
  function placeLabels(visible: boolean) {
    const [w, h] = size()
    const placed: { x: number; y: number; w: number }[] = []
    const items = labels.map((l) => {
      const b = def(l.id)
      const below = !!b.parent // a moon's tag hangs under it so it doesn't cover its planet's tag
      const p = pos(l.id, new THREE.Vector3())
      p.y += b.r * (below ? -1.15 : 1.15)
      const dist = p.distanceTo(camera.position)
      p.project(camera)
      return { ...l, below, dist, p, rank: Number(l.el.dataset.priority ?? 0), width: l.el.offsetWidth }
    })
    items.sort((a, b) => b.rank - a.rank || a.dist - b.dist)
    for (const { el, below, p, width } of items) {
      // kept inside the screen: on a narrow phone a world near the edge would otherwise get half a tag
      const x = THREE.MathUtils.clamp((p.x * 0.5 + 0.5) * w, width / 2 + 4, w - width / 2 - 4)
      const y = (-p.y * 0.5 + 0.5) * h
      const top = below ? y : y - LABEL_H
      const free = !placed.some((r) => Math.abs(r.x - x) < (r.w + width) / 2 + 6 && Math.abs(r.y - top) < LABEL_H)
      const show = visible && p.z < 1 && free
      if (show) placed.push({ x, y: top, w: width })
      el.style.opacity = show ? '1' : '0'
      el.style.visibility = show ? 'visible' : 'hidden'
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${below ? '0' : '-100%'})`
    }
  }
  frame()

  return {
    flyTo,
    dispose() {
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
      controls.dispose()
      for (const s of [scene, shipScene]) {
        s.traverse((node) => {
          const n = node as THREE.Mesh
          n.geometry?.dispose()
          ;[n.material].flat().forEach((m) => {
            if (!m) return
            Object.values(m).forEach((val) => val instanceof THREE.Texture && val.dispose())
            m.dispose()
          })
        })
      }
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

// Potato-shaped rock: a sphere pushed in and out by a few overlapping waves (deterministic, no noise lib).
function asteroidGeometry(r: number) {
  const geo = new THREE.IcosahedronGeometry(r, 5)
  const p = geo.attributes.position
  const v = new THREE.Vector3()
  const stretch = new THREE.Vector3(1.5, 0.85, 1) // elongated like Eros
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize()
    const bump = 1 + 0.18 * Math.sin(v.x * 3.1 + 1) * Math.cos(v.y * 2.3) + 0.08 * Math.sin(v.z * 7 + v.x * 5)
    v.multiplyScalar(r * bump).multiply(stretch)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
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
  // the soft round glow texture keeps rocks from rendering as squares up close
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xa89f91, size: 0.12, map: glowTexture(), transparent: true, depthWrite: false }))
}

// The kid's rocket (same design as components/Rocket.tsx) pointing along +Y, window and star facing +Z,
// with a flame cone behind it.
function makeShip() {
  const g = new THREE.Group()
  const cream = new THREE.MeshStandardMaterial({ color: 0xefe8da, emissive: 0x2a2620, roughness: 0.6, metalness: 0.2 })
  const navy = new THREE.MeshStandardMaterial({ color: 0x1e2740, roughness: 0.5, metalness: 0.3 })
  const orange = new THREE.MeshStandardMaterial({ color: 0xf28c28, emissive: 0xf28c28, emissiveIntensity: 0.5, roughness: 0.4 })
  const glow = new THREE.MeshBasicMaterial({ color: 0xffb347 })
  const metal = new THREE.MeshStandardMaterial({ color: 0x5a6178, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide })
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    g.add(m)
    return m
  }

  // hull: cylinder (y -0.16..0.10) under an elliptical dome (0.10..0.32)
  const R = 0.08
  const domeR = (y: number) => R * Math.sqrt(Math.max(0, 1 - ((y - 0.1) / 0.22) ** 2))
  const dome = Array.from({ length: 13 }, (_, i) => new THREE.Vector2(domeR(0.1 + (i * 0.22) / 12), 0.1 + (i * 0.22) / 12))
  add(new THREE.LatheGeometry([new THREE.Vector2(0, -0.16), new THREE.Vector2(R, -0.16), ...dome], 40), cream)
  // navy nose cap (top 5 dome rings) + orange ring, slightly proud of the hull so they don't z-fight
  add(new THREE.LatheGeometry(dome.slice(8).map((p) => new THREE.Vector2(p.x * 1.02, p.y)), 40), navy)
  add(new THREE.TorusGeometry(dome[8].x * 1.02, 0.005, 8, 40), orange, 0, dome[8].y).rotation.x = Math.PI / 2
  add(new THREE.CylinderGeometry(0.003, 0.003, 0.05, 6), metal, 0, 0.34)
  add(new THREE.SphereGeometry(0.007, 10, 8), orange, 0, 0.37)

  // navy belt + skirt
  add(new THREE.CylinderGeometry(R * 1.01, R * 1.01, 0.016, 40, 1, true), navy, 0, -0.015)
  add(new THREE.CylinderGeometry(R * 1.01, R * 1.01, 0.03, 40, 1, true), navy, 0, -0.145)
  add(new THREE.TorusGeometry(R * 1.015, 0.003, 6, 40), glow, 0, -0.145).rotation.x = Math.PI / 2

  // window: an orange frame patch and a dark glass patch wrapped on the cylinder, facing +Z
  const patch = (r: number, h: number, arc: number) => new THREE.CylinderGeometry(r, r, h, 16, 1, true, -arc / 2, arc)
  add(patch(R * 1.01, 0.084, 1.1), orange, 0, 0.045)
  add(patch(R * 1.02, 0.07, 0.9), new THREE.MeshStandardMaterial({ color: 0x141b30, emissive: 0x1b2440, roughness: 0.15, metalness: 0.6 }), 0, 0.045)

  // star below the window
  const star = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 ? 0.009 : 0.022
    if (i) star.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    else star.moveTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  add(new THREE.ShapeGeometry(star), orange, 0, -0.075, R + 0.001)

  // engine block + three glowing nozzles
  add(new THREE.CylinderGeometry(0.06, 0.05, 0.03, 24), navy, 0, -0.175)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const [x, z] = [Math.sin(a) * 0.03, Math.cos(a) * 0.03]
    add(new THREE.CylinderGeometry(0.016, 0.026, 0.05, 16, 1, true), metal, x, -0.215, z)
    add(new THREE.CircleGeometry(0.023, 16), glow, x, -0.235, z).rotation.x = Math.PI / 2
  }

  // four armored legs at the diagonals, so they never cover the window or the star
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Group()
    leg.rotation.y = Math.PI / 4 + (i * Math.PI) / 2
    const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, tilt: number) => {
      const m = new THREE.Mesh(geo, mat)
      m.position.set(x, y, 0)
      m.rotation.z = tilt
      leg.add(m)
    }
    part(new THREE.BoxGeometry(0.03, 0.14, 0.04), cream, 0.09, -0.06, 0.35)
    part(new THREE.BoxGeometry(0.034, 0.025, 0.044), orange, 0.116, -0.135, 0.35)
    part(new THREE.BoxGeometry(0.018, 0.09, 0.022), navy, 0.125, -0.19, 0.15)
    part(new THREE.BoxGeometry(0.05, 0.012, 0.04), new THREE.MeshStandardMaterial({ color: 0xc9c0ae, roughness: 0.6 }), 0.132, -0.24, 0)
    g.add(leg)
  }

  // flame hangs from the nozzles (scale.y = thrust): orange shell, yellow body, white-hot core
  const flame = new THREE.Group()
  flame.position.y = -0.24
  for (const [r, h, color, opacity] of [
    [0.05, 0.3, 0xff8a3d, 0.55],
    [0.034, 0.2, 0xffc65a, 0.65],
    [0.016, 0.1, 0xffffff, 0.95],
  ]) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r, h, 20, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    cone.rotation.x = Math.PI
    cone.position.y = -h / 2
    flame.add(cone)
  }
  g.add(flame)
  const nozzleGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffa040, blending: THREE.AdditiveBlending, depthWrite: false }))
  nozzleGlow.position.y = -0.27
  g.add(nozzleGlow)
  g.userData = { flame, glow: nozzleGlow }
  return g
}

// Glowing exhaust left behind in space: a ring buffer of points that cool from yellow to red to nothing.
function makeTrail(n = 480) {
  const position = new Float32Array(n * 3)
  const color = new Float32Array(n * 3)
  const age = new Float32Array(n).fill(Infinity)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(color, 3))
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ size: 0.1, map: glowTexture(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  points.frustumCulled = false
  let head = 0
  return {
    points,
    emit(at: THREE.Vector3) {
      position.set([at.x, at.y, at.z], head * 3)
      age[head] = 0
      head = (head + 1) % n
    },
    update(dt: number) {
      for (let i = 0; i < n; i++) {
        age[i] += dt
        const k = Math.max(0, 1 - age[i] / 1.3) * 0.55 // dim per point: they overlap and add up
        color.set([k, 0.6 * k * k, 0.22 * k * k * k], i * 3)
      }
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
    },
  }
}

// Warp streaks: short lines rushing past the ship, brighter and longer the faster it goes (speed 0..1).
function makeStreaks(n = 80) {
  const seg = new Float32Array(n * 6)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(seg, 3))
  const mat = new THREE.LineBasicMaterial({ color: 0xcfe2ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  const lines = new THREE.LineSegments(geo, mat)
  lines.frustumCulled = false
  const seeds = Array.from({ length: n }, () => ({ a: Math.random() * Math.PI * 2, r: 0.5 + Math.random() * 2.2, z: Math.random() * 10 - 4 }))
  const right = new THREE.Vector3()
  const up = new THREE.Vector3()
  const p = new THREE.Vector3()
  return {
    lines,
    update(dt: number, center: THREE.Vector3, fwd: THREE.Vector3, speed: number) {
      lines.visible = speed > 0.01
      if (!lines.visible) return
      mat.opacity = speed * 0.35
      right.crossVectors(fwd, UP)
      if (right.lengthSq() < 1e-6) right.set(1, 0, 0)
      right.normalize()
      up.crossVectors(right, fwd)
      const len = 0.3 + speed * 1.8
      seeds.forEach((s, i) => {
        s.z -= dt * (4 + 26 * speed)
        if (s.z < -4) s.z += 10
        p.copy(center).addScaledVector(right, Math.cos(s.a) * s.r).addScaledVector(up, Math.sin(s.a) * s.r).addScaledVector(fwd, s.z)
        seg.set([p.x, p.y, p.z], i * 6)
        p.addScaledVector(fwd, -len)
        seg.set([p.x, p.y, p.z], i * 6 + 3)
      })
      geo.attributes.position.needsUpdate = true
    },
  }
}
