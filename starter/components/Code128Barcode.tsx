const CODE_128_PATTERNS = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112",
] as const;

function code128BValues(value: string): number[] {
  const data = Array.from(value).map((char) => {
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      throw new Error("Code 128 labels only support printable ASCII.");
    }
    return code - 32;
  });
  const start = 104;
  const checksum =
    (start + data.reduce((sum, code, index) => sum + code * (index + 1), 0)) % 103;
  return [start, ...data, checksum, 106];
}

export function Code128Barcode({
  value,
  height = 72,
}: {
  value: string;
  height?: number;
}) {
  const codes = code128BValues(value);
  const quietZone = 10;
  let x = quietZone;
  const bars: Array<{ x: number; width: number }> = [];

  for (const code of codes) {
    const pattern = CODE_128_PATTERNS[code];
    if (!pattern) continue;
    let drawBar = true;
    for (const widthChar of pattern) {
      const width = Number(widthChar);
      if (drawBar) bars.push({ x, width });
      x += width;
      drawBar = !drawBar;
    }
  }

  const width = x + quietZone;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Barcode for ${value}`}
      className="h-20 w-full max-w-sm"
      preserveAspectRatio="none"
    >
      <rect width={width} height={height} fill="white" />
      {bars.map((bar) => (
        <rect key={`${bar.x}-${bar.width}`} x={bar.x} y="0" width={bar.width} height={height} fill="black" />
      ))}
    </svg>
  );
}
