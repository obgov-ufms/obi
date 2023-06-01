import "./styles.css";
import { useDocument } from "@/state/DocumentContext";
import { MdClose } from "react-icons/md";
import { DocumentNodeComponent } from "./DocumentNode";
import "@vega/data-manager/dist/style.css"
import { Spreadsheet } from "@vega/data-manager";

export function Document() {
  const {
    openDocument,
    nodes,
    deleteNode,
    inputNodeOnKeyDown,
    inputNodeOnInput,
    inputNodeRef,
  } = useDocument();

  if (!openDocument) {
    return (<div className="h-full w-full bg-slate-100 text-slate-400 border border-slate-200/70 shadow-md shadow-slate-100 rounded-t-lg rounded-x-lg last:rounded-b-lg pt-4 flex items-center justify-center">
      Selecione um documento
    </div>)
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-full overflow-y-scroll bg-white border border-slate-200/70 shadow-md shadow-slate-100 rounded-t-lg rounded-x-lg last:rounded-b-lg pt-4 flex flex-col">
        {nodes.length > 0 && (
          <>
            {nodes.map((node, i) => (
              <div key={i} className="flex gap-4 items-center px-6">
                <DocumentNodeComponent node={node} />
                <button
                  className="h-7 w-7 rounded-full flex items-center justify-center text-transparent hover:text-slate-400 hover:bg-slate-100"
                  onClick={() => deleteNode(node)}
                >
                  <MdClose />
                </button>
              </div>
            ))}
          </>
        )}

        <div className="relative flex-1 w-full flex flex-col ">
          <div
            contentEditable
            suppressContentEditableWarning
            className="flex-1 w-full whitespace-pre-wrap px-6"
            style={{ overflowWrap: "anywhere" }}
            tabIndex={0}
            placeholder=""
            onKeyDown={inputNodeOnKeyDown}
            ref={inputNodeRef}
            onInput={inputNodeOnInput}
          />
          <AutocompleteSuggestion />
          <CommandSuggestion />
        </div>
      </div>
      {nodes.some(({ metadata }) => metadata.kind === "data_definition") && (
        <div className="rounded-b-lg rounded-x-lg flex flex-col overflow-auto">
          <Spreadsheet
            data={[
              {
                reclamacao: 255,
                solicitacao: 173,
                denuncia: 72,
                sugestao: 31,
                elogio: 56,
                comunicacao: 276,
                informacao: 197,
              },
              {
                reclamacao: 155,
                comunicacao: 220,
                denuncia: 39,
                sugestao: 18,
                elogio: 42,
                informacao: 266,
                solicitacao: 146,
              },
              {
                reclamacao: 83,
                comunicacao: 106,
                denuncia: 38,
                sugestao: 11,
                elogio: 15,
                informacao: 248,
                solicitacao: 115,
              },
            ]}
            colType="keys"
          />
        </div>
      )}
    </div>
  );
}

function AutocompleteSuggestion() {
  const { inputNodeCommandSuggestion, inputNodeValue } = useDocument();

  const inputNodeValueArgs = inputNodeValue.trim().split(" ");

  if (inputNodeCommandSuggestion.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full px-6 opacity-10 pointer-events-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {inputNodeValueArgs.map((arg) => (
            <span key={arg} className="opacity-0">
              {arg}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {inputNodeCommandSuggestion[0].usage
            .slice(inputNodeValueArgs.length - 1)
            .map((arg) => (
              <span key={arg}>{arg}</span>
            ))}
        </div>
      </div>
    </div>
  );
}

function CommandSuggestion() {
  const { inputNodeCommandSuggestion } = useDocument();

  if (inputNodeCommandSuggestion.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-8 left-8 w-72 max-h-72 overflow-auto rounded-lg border border-slate-200 select-none">
      <div className="bg-slate-50  rounded-lg flex flex-col shadow-md shadow-slate-100">
        {inputNodeCommandSuggestion.map((command, i) => (
          <div className="flex items-center gap-2 py-2 px-2 last:border-none border-b border-slate-200 hover:bg-slate-100 cursor-pointer">
            <div
              key={i}
              className="bg-slate-300 rounded w-10 h-10 flex items-center justify-center text-slate-600 text-xl"
            >
              {command.icon}
            </div>
            <div>
              <h3 className="text font-semibold text-slate-700">
                {command.name}
              </h3>
              <p className="text-xs text-slate-500">{command.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Document;
