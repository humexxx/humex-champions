import { useEffect } from "react";

interface MetaTag {
  name: string;
  content: string;
}

const useDocumentMetadata = (title: string, metaTags?: MetaTag[]) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const metaElements: HTMLMetaElement[] = [];

    if (metaTags) {
      metaTags.forEach(({ name, content }) => {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
        metaElements.push(meta);
      });
    }

    return () => {
      document.title = previousTitle;
      metaElements.forEach((meta) => {
        document.head.removeChild(meta);
      });
    };
  }, [title, metaTags]);
};

export default useDocumentMetadata;
