const shuffle = <T>(a: T[]) => {
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export type Mine = { x: number; y: number }
export type Tile = Readonly<{
  hasMine: boolean
  hasFlag: boolean
  open: boolean
  nearMines: number
  h: number
  w: number
}>

type TileImpl = Readonly<{
  hasMine: boolean
  hasFlag: boolean
  open: boolean
  nearMines: number
}>

export const initTiles = (height: number, width: number, mines: number) => {
  return Tiles.init(height, width, mines)
}

type Params = Readonly<{
  height: number
  width: number
  mines: number
  tiles: readonly TileImpl[]
  status: Status
  opened: number
  flaged: number
}>
export type Status = 'start' | 'gaming' | 'win' | 'lose'

const addMines = (params: Params, h: number, w: number) => {
  const { tiles: tiles_, mines, height, width } = params
  const tiles = tiles_.map(t => ({ ...t }))
  const i = h * width + w
  const allKeys = Array.from(tiles.keys()).filter(j => j !== i)
  const keys = shuffle(allKeys).slice(0, mines)
  for (const key of keys) tiles[key].hasMine = true
  for (let h = 0; h < height; ++h) {
    for (let w = 0; w < width; ++w) {
      let count = 0
      for (let hi = -1; hi <= 1; ++hi) {
        for (let wi = -1; wi <= 1; ++wi) {
          const ha = h + hi
          const wa = w + wi
          if (0 <= ha && ha < height && 0 <= wa && wa < width) {
            if (tiles[ha * width + wa].hasMine) ++count
          }
        }
      }
      tiles[h * width + w].nearMines = count
    }
  }
  return tiles
}

export type { Tiles }
class Tiles {
  private constructor(readonly params: Params) {}

  get height(): number {
    return this.params.height
  }
  get width(): number {
    return this.params.width
  }
  get mines(): number {
    return this.params.mines
  }
  get status(): Status {
    return this.params.status
  }
  get opened(): number {
    return this.params.opened
  }
  get flaged(): number {
    return this.params.flaged
  }

  static init(height: number, width: number, mines: number) {
    if (height * width <= mines + 2) throw new Error('height * width <= mines')
    const tiles = Array.from({ length: height * width }, () => ({
      hasMine: false,
      hasFlag: false,
      open: false,
      nearMines: 0,
    }))
    return new Tiles({
      height,
      width,
      mines,
      tiles,
      status: 'start',
      opened: 0,
      flaged: 0,
    })
  }

  get(h: number, w: number) {
    const { tiles, width } = this.params
    return tiles[h * width + w]
  }
  *iter() {
    const { height, width, tiles } = this.params
    for (let h = 0; h < height; ++h) {
      for (let w = 0; w < width; ++w) {
        yield { h, w, ...tiles[h * width + w] }
      }
    }
  }
  flag(h: number, w: number, hasFlag?: boolean) {
    const { width, tiles, status, flaged } = this.params
    const i = h * width + w
    if (status !== 'gaming') return this
    if (tiles[i].open) return this
    const has = hasFlag ?? !tiles[i].hasFlag
    if (tiles[i].hasFlag === has) return this
    const newTiles = tiles.slice()
    newTiles[i] = { ...newTiles[i], hasFlag: has }
    const nextFlaged = has ? flaged + 1 : flaged - 1
    return new Tiles({ ...this.params, tiles: newTiles, flaged: nextFlaged })
  }
  open(h: number, w: number) {
    const { height, width, opened } = this.params
    let { status } = this.params
    let tiles = this.params.tiles.slice()
    const i = h * width + w
    if (status === 'start') {
      tiles = addMines(this.params, h, w)
      status = 'gaming'
    }
    if (status !== 'gaming') return this
    if (tiles[i].open) return this
    if (tiles[i].hasFlag) return this
    if (tiles[i].nearMines) {
      tiles[i] = { ...tiles[i], open: true }
    } else {
      const tsk: [h: number, w: number][] = []
      const push = (h: number, w: number) => {
        if (0 <= h && h < height && 0 <= w && w < width) {
          const i = h * width + w
          if (!tiles[i].open && !tiles[i].hasMine) {
            tiles[i] = { ...tiles[i], open: true }
            tiles[i].nearMines || tsk.push([h, w])
          }
        }
      }
      push(h, w)
      let tmp: [h: number, w: number] | undefined
      while ((tmp = tsk.shift())) {
        const [h, w] = tmp
        for (let hi = -1; hi <= 1; ++hi)
          for (let wi = -1; wi <= 1; ++wi) if (hi || wi) push(h + hi, w + wi)
      }
    }
    if (tiles[i].hasMine) status = 'lose'
    else if (tiles.every(t => t.hasMine || t.open)) {
      status = 'win'
      tiles = tiles.map(t => (t.hasMine ? { ...t, hasFlag: true } : t))
    }
    return new Tiles({
      ...this.params,
      tiles,
      status,
      opened: opened + 1,
    })
  }
}
