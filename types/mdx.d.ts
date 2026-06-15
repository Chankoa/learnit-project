declare module "*.mdx" {
  const MDXComponent: (
    props: Record<string, unknown>
  ) => import("react").ReactElement;

  export default MDXComponent;
}
