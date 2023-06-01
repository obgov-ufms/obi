import { TbAlpha, TbNumbers } from "react-icons/tb";
import {
  DocumentNode,
  TypedDocumentNode,
  TextDocumentNodeMetadata,
  DataDefinitionDocumentNodeMetadata,
  ValueDocumentNodeMetadata,
  FormulaDocumentNodeMetadata,
} from "@/domain/DocumentNode";
import { useDocument } from "@/state/DocumentContext";
import * as markdown from "@/util/markdown";
import { MdInterests } from "react-icons/md";
import { ReactNode, useState } from "react";

const DocumentNodeComponentMap = {
  text: TextDocumentNodeComponent,
  data_definition: DataDefinitioDocumentNodeComponent,
  value: ValueDocumentNodeComponent,
  formula: FormulaDocumentNodeComponent,
} as const;

export function DocumentNodeComponent(props: { node: DocumentNode }) {
  const Component = DocumentNodeComponentMap[props.node.metadata.kind] as (props: {
    node: DocumentNode;
  }) => JSX.Element;

  return <Component node={props.node} />;
}

function TextDocumentNodeComponent(props: { node: TypedDocumentNode<TextDocumentNodeMetadata> }) {
  const { textNodeOnFocus, textNodeOnBlur, textNodeOnKeyDown } = useDocument();
  const [content, setContent] = useState<ReactNode>(
    markdown.processor.processSync(props.node.metadata.value).result
  );

  return (
    <div
      className="text-node whitespace-normal w-full"
      spellCheck="false"
      style={{ overflowWrap: "anywhere" }}
      contentEditable
      suppressContentEditableWarning
      onFocus={textNodeOnFocus(props.node, setContent)}
      onBlur={textNodeOnBlur(props.node, setContent)}
      onKeyDown={textNodeOnKeyDown}
    >
      {content}
    </div>
  );
}

function DataDefinitioDocumentNodeComponent(props: {
  node: TypedDocumentNode<DataDefinitionDocumentNodeMetadata>;
}) {
  return (
    <div className="my-2 p-1 rounded-lg bg-white border border-slate-100 shadow-sm flex flex-col gap-2">
      <header className="pt-3 px-3 text-xs font-mono text-slate-500 font-semibold">
        Tipo de dado
      </header>
      <div>
        <header
          className="bg-slate-300 py-2 px-3 rounded-t-md flex items-center gap-1"
          spellCheck="false"
          contentEditable
          suppressContentEditableWarning
        >
          <MdInterests className="text-slate-600" />
          <span className="text-slate-700 font-semibold ">
            {props.node.metadata.name}
          </span>
        </header>
        <div className="bg-gray-100 rounded-b-md border border-slate-200 text-sm">
          {Object.entries(props.node.metadata.schema).map(([name, type], i) => (
            <div
              className="flex justify-between items-center gap-14 px-3 py-2"
              key={i}
            >
              <span
                contentEditable
                suppressContentEditableWarning
                spellCheck="false"
                className="text-slate-700"
              >
                {name}
              </span>
              <span
                className="text-slate-400 italic font-mono mt-1"
                contentEditable
                suppressContentEditableWarning
                spellCheck="false"
              >
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValueDocumentNodeComponent(props: { node: TypedDocumentNode<ValueDocumentNodeMetadata> }) {
  const { updateNode } = useDocument();
  
  return (
    <div className="my-2 p-4 rounded-lg bg-white border border-slate-100 shadow-sm flex flex-col gap-2">
      <header className="text-xs font-mono text-slate-500 font-semibold">
        Valor
      </header>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-md px-2 py-[.1rem]">
          <TbNumbers className="text-slate-600" />
          <span
            className="text-slate-500 font-mono"
            contentEditable
            suppressContentEditableWarning
            spellCheck="false"
          >
            {props.node.metadata.name}
          </span>
        </div>
        <span className="font-mono text-slate-700">= </span>
        <span
          className="font-mono bg-slate-200/80 text-slate-600 font-semibold rounded px-2 py-[.1rem]"
          contentEditable
          suppressContentEditableWarning
        >
          {props.node.metadata.value}
        </span>
      </div>
      {props.node.metadata.type === "number" && (
        <input
          type="range"
          min={-10}
          max={10}
          step={0.01}
          value={props.node.metadata.value}
          onChange={(ev) =>
            updateNode({ ...props.node, metadata: {...props.node.metadata, value: ev.target.value } })
          }
        />
      )}
    </div>
  );
}

function FormulaDocumentNodeComponent(props: { node: TypedDocumentNode<FormulaDocumentNodeMetadata> }) {
  return (
    <div className="my-2 p-4 rounded-lg bg-white border border-slate-100 shadow-sm flex flex-col gap-2">
      <header className="text-xs font-mono text-slate-500 font-semibold">
        Fórmula
      </header>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-md px-2 py-[.1rem]">
          <TbAlpha className="text-slate-700" />
          <span
            className="text-slate-500 font-mono"
            contentEditable
            suppressContentEditableWarning
            spellCheck="false"
          >
            {props.node.metadata.name}
          </span>
        </div>
        <span className="font-mono text-slate-700">= </span>
        {props.node.metadata.symbols.map((symbol, i) => {
          if (Number(symbol)) {
            return (
              <span className="font-mono text-slate-600" key={i}>
                {symbol}
              </span>
            );
          }

          if (["*", "-", "+", "/"].includes(symbol)) {
            return (
              <span className="font-mono italic text-slate-700" key={i}>
                {symbol}
              </span>
            );
          }

          return (
            <span
              className="font-mono bg-slate-200/80 text-slate-600 font-semibold rounded px-2 py-[.1rem]"
              key={i}
            >
              {symbol}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default DocumentNodeComponent;
