import { Download, FileDown } from "lucide-react";

type DownloadCardProps = {
  description: string;
  fileType?: string;
  href: string;
  title: string;
};

export function DownloadCard({
  description,
  fileType = "Ressource",
  href,
  title
}: DownloadCardProps) {
  return (
    <a className="mdx-download-card" download href={href}>
      <span>
        <FileDown size={21} aria-hidden="true" />
      </span>
      <div>
        <small>{fileType}</small>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <Download size={19} aria-hidden="true" />
    </a>
  );
}
