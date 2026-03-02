// Ambient declaration for .md imports (bundled as raw strings via webpack asset/source)
declare module "*.md" {
  const content: string;
  export default content;
}
