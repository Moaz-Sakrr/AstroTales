import type { Device } from '../types'
import { reflecto } from './reflecto'
import { eagle } from './eagle'
import { rover } from './rover'
import { opportunity } from './opportunity'
import { ingenuity } from './ingenuity'
import { near } from './near'

export const devices: Record<string, Device> = Object.fromEntries(
  [reflecto, eagle, rover, opportunity, ingenuity, near].map((d) => [d.id, d]),
)

export const allDeviceIds = Object.keys(devices)
