"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

const markdownPlugins = [remarkGfm, remarkBreaks];

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
    return (
      <a
        href={href}
        {...props}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  table: ({ children, ...props }) => (
    <div className="markdown-table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
  img: ({ alt, ...props }) => <img alt={alt ?? ""} loading="lazy" decoding="async" {...props} />,
};

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = "markdown-preview" }: MarkdownPreviewProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={markdownPlugins} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
