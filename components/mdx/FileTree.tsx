import { File, Folder } from "lucide-react";

type FileTreeProps = {
  items: string[];
  title?: string;
};

export function FileTree({ items, title = "Structure des fichiers" }: FileTreeProps) {
  return (
    <figure className="mdx-file-tree">
      <figcaption>{title}</figcaption>
      <ul>
        {items.map((item) => {
          const depth = item.match(/^\s*/)?.[0].length ?? 0;
          const label = item.trim();
          const isFolder = label.endsWith("/");

          return (
            <li key={item} style={{ paddingLeft: `${depth * 0.75}rem` }}>
              {isFolder ? (
                <Folder size={16} aria-hidden="true" />
              ) : (
                <File size={16} aria-hidden="true" />
              )}
              <code>{label}</code>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
