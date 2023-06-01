// import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import remarkGemoji from "remark-gemoji";
import rehypeReact from "rehype-react";
import { unified /*, Plugin*/ } from "unified";
// import { Root } from "mdast";
// import { visit } from "unist-util-visit";
import {  
  createElement,
  Fragment,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { TypedDocumentNode, ValueDocumentNodeMetadata } from "@/domain/DocumentNode";
import { useDocument } from "@/state/DocumentContext";

/*
const documentValueReferences: Plugin<any[], Root> = (options) => (tree) =>
  visit(tree, "text", (node, index, parent) => {
    if (node.value.includes("$PI")) {
      const nodes = node.value
        .split("$PI")
        .flatMap((value) => [
          { type: "text" as const, value },
          { type: "inlineCode" as const, value: "3.14" },
        ])
        .slice(0, -1);

      parent!.children = [
        ...parent!.children.slice(0, index! - 1),
        ...nodes,
        ...parent!.children.slice(index! + 1),
      ];
    }
  });
*/

export const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkGemoji)
  .use(remarkSmartypants)
  .use(remarkRehype)
  .use(rehypeReact, {
    createElement,
    Fragment,
    components: {
      code: Code,
    },
  });

function Code(props: PropsWithChildren) {
  const { nodes } = useDocument()
  const [content, setContent] = useState((props.children as string[])[0]);
  const [references, setReferences] = useState<Record<string, number[]>>({});

  useEffect(() => {
    nodes
      .filter(({ metadata }) => metadata.kind === "value")
      .forEach((node) => {
        const indexOf = content.indexOf(`$${(node as TypedDocumentNode<ValueDocumentNodeMetadata>).metadata.name}`);

        if (indexOf !== -1) {
          setReferences((references) => ({
            ...references,
            [(node as TypedDocumentNode<ValueDocumentNodeMetadata>).metadata.name]: [
              ...(references?.[(node as TypedDocumentNode<ValueDocumentNodeMetadata>).metadata.name] ?? []),
              indexOf,
            ],
          }));
        }
      });
  }, []);

  useEffect(() => {
    nodes
      .filter(({ metadata }) => metadata.kind === "value")
      .forEach((node) => {
        references?.[(node as TypedDocumentNode<ValueDocumentNodeMetadata>).metadata.name]?.forEach((ref) => {
          setContent((content) =>
            [
              content.slice(0, ref),
              (node as TypedDocumentNode<ValueDocumentNodeMetadata>).metadata.value,
              content.slice(ref + (node as TypedDocumentNode<ValueDocumentNodeMetadata>).metadata.value.length + 1),
            ].join("")
          );
        });
      });
  }, [nodes, references]);

  return <code>{content}</code>;
}
