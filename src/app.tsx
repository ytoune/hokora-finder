import { useMemo, useState } from "preact/hooks";
import { initTiles } from "./mine";
import type { Status } from "./mine";

const styles = {
  wrapper: {
    display: "grid",
    border: "1px solid",
  },
  button: {
    lineHeight: "2em",
    padding: "1em",
  },
  label: {
    display: "block",
  },
  openTile: {
    backgroundColor: "white",
    border: "none",
  },
} as const;

const Title = ({ status }: { status: Status }) => {
  switch (status) {
    case "lose":
      return <h2>お前あの祠を壊したんか！？</h2>;
    case "win":
      return <h2>探索完了</h2>;
    case "gaming":
      return <h2>探索中...</h2>;
    case "start":
      return <h2>山探索ゲーム</h2>;
    default:
      throw new Error("status:", status satisfies never);
  }
};

export const App = () => {
  const [tool, setTool] = useState<"flag" | "open">("open");
  const [height, setHeight] = useState(12);
  const [width, setWidth] = useState(12);
  const [mines, setMines] = useState(15);
  const [tiles, setTiles] = useState(() => initTiles(height, width, mines));
  const wrapperStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${tiles.width},2em)`,
      gridTemplateRows: `repeat(${tiles.height},2em)`,
      width: `calc(${tiles.width}*2em)`,
      height: `calc(${tiles.height}*2em)`,
    }),
    [tiles]
  );
  return (
    <div>
      <Title status={tiles.status} />
      祠を破壊しないように気を付けながら山を探索しよう
      <div style={{ ...styles.wrapper, ...wrapperStyle }}>
        {Array.from(tiles.iter()).map((tile) => (
          <button
            key={`${tile.h}:${tile.w}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setTiles((t) => t[tool](tile.h, tile.w));
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setTiles((t) => t.flag(tile.h, tile.w));
            }}
            style={tile.open ? styles.openTile : void 0}
          >
            {tile.open
              ? tile.hasMine
                ? "💥"
                : tile.nearMines || ""
              : tile.hasFlag
              ? "🚩"
              : "🌲"}
          </button>
        ))}
      </div>
      <div>
        <button
          type="button"
          style={styles.button}
          onClick={(e) => {
            e.preventDefault();
            setTool("open");
          }}
          disabled={tool === "open"}
        >
          💥
        </button>
        <button
          type="button"
          style={styles.button}
          onClick={(e) => {
            e.preventDefault();
            setTool("flag");
          }}
          disabled={tool === "flag"}
        >
          🚩
        </button>
        current: {tool}
      </div>
      <hr />
      <div>
        rest: {tiles.mines - tiles.flaged}, flag: {tiles.flaged}
      </div>
      <hr />
      <div>
        <button
          type="button"
          style={styles.button}
          onClick={(e) => {
            e.preventDefault();
            setTiles(initTiles(height, width, mines));
          }}
        >
          restart
        </button>
        <label style={styles.label}>
          height:{" "}
          <input
            type="number"
            name="height"
            value={height}
            onChange={(e) => setHeight(Number(e.currentTarget.value))}
          />
        </label>
        <label style={styles.label}>
          width:{" "}
          <input
            type="number"
            name="width"
            value={width}
            onChange={(e) => setWidth(Number(e.currentTarget.value))}
          />
        </label>
        <label style={styles.label}>
          hokoras:{" "}
          <input
            type="number"
            name="mines"
            value={mines}
            onChange={(e) => setMines(Number(e.currentTarget.value))}
          />
        </label>
      </div>
    </div>
  );
};
