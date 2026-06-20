// Asset module declarations so TypeScript accepts font/image imports that
// Metro resolves at bundle time (returns an opaque asset id at runtime).
declare module '*.ttf' {
  const asset: number;
  export default asset;
}
declare module '*.otf' {
  const asset: number;
  export default asset;
}
declare module '*.png' {
  const asset: number;
  export default asset;
}
