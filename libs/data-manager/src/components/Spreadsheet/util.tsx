export const gridTemplateRule = (n: number) =>
  `auto repeat(${n - 1}, minmax(0, 1fr))`;

export const numberToLetters = (n: number) => {
  const ordA = "a".charCodeAt(0);
  const ordZ = "z".charCodeAt(0);
  const len = ordZ - ordA + 1;

  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s;
};
