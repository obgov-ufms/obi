/* eslint-disable @typescript-eslint/no-empty-function */
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DataDefinitionDocumentNode,
  FormulaDocumentNode,
  DocumentNode,
  TextDocumentNode,
  ValueDocumentNode,
  TypedDocumentNode,
  TextDocumentNodeMetadata,
} from "@/domain/DocumentNode";
import * as markdown from "@/util/markdown";
import { Document } from "@/domain/Document";
import { MdTitle } from "react-icons/md";

type Context = {
  nodes: DocumentNode[];
  textNodeOnBlur: (
    node: TypedDocumentNode<TextDocumentNodeMetadata>,
    setContent: (reactNode: React.ReactNode) => void
  ) => React.FocusEventHandler<HTMLDivElement>;
  textNodeOnFocus: (
    node: TypedDocumentNode<TextDocumentNodeMetadata>,
    setContent: (reactNode: React.ReactNode) => void
  ) => React.FocusEventHandler<HTMLDivElement>;
  textNodeOnKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  inputNodeOnKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  inputNodeOnInput: React.KeyboardEventHandler<HTMLDivElement>;
  addNode: (newNode: Omit<DocumentNode, "index">) => void;
  deleteNode: (node: DocumentNode) => void;
  updateNode: (updatedNode: DocumentNode) => void;
  inputNodeRef: React.RefObject<HTMLDivElement>;
  inputNodeValue: string;
  inputNodeCommandSuggestion: Command[];
  openDocument: Document | undefined;
  setOpenDocument: (
    document: (Document & { nodes: DocumentNode[] }) | undefined
  ) => void;
};

export const DocumentContext = createContext<Context>({
  nodes: [],
  textNodeOnBlur: () => () => {},
  textNodeOnFocus: () => () => {},
  textNodeOnKeyDown: () => {},
  inputNodeOnKeyDown: () => {},
  inputNodeOnInput: () => {},
  addNode: () => {},
  deleteNode: () => {},
  updateNode: () => {},
  inputNodeRef: { current: null },
  inputNodeValue: "",
  inputNodeCommandSuggestion: [],
  openDocument: undefined,
  setOpenDocument: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useDocument = () => useContext(DocumentContext);

type Command = {
  name: string;
  description: string;
  icon: React.ReactNode;
  usage: string[];
  execute: (...args: string[]) => void;
};

type DocumentProviderProps = PropsWithChildren<{
  addNode: (newNode: Omit<DocumentNode, "index">) => void;
  deleteNode: (node: DocumentNode) => void;
  updateNode: (updatedNode: DocumentNode) => void;
}>;

export function DocumentProvider(props: DocumentProviderProps) {
  const [openDocument, setOpenDocument] = useState<
    Document & { nodes: DocumentNode[] }
  >();
  const [inputNodeValue, setInputNodeValue] = useState("");
  const [inputNodeCommandSuggestion, setInputNodeCommandSuggestion] = useState<
    Command[]
  >([]);

  const {
    addNode: _addNode,
    deleteNode: _deleteNode,
    updateNode: _updateNode,
  } = props;

  const addNode = (newNode: Omit<DocumentNode, "index">) => {
    setOpenDocument((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        nodes: [...state.nodes, { ...newNode, index: state.nodes.length }],
      };
    });

    _addNode(newNode);
  };

  const deleteNode = (node: DocumentNode) => {
    setOpenDocument((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        nodes: state.nodes.filter(({ id }) => id !== node.id),
      };
    });

    _deleteNode(node);
  };

  const updateNode = (node: DocumentNode) => {
    setOpenDocument((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        nodes: state.nodes.map((n) => (n.id === node.id ? node : n)),
      };
    });

    _updateNode(node);
  };

  const inputNodeRef = useRef<HTMLDivElement>(null);

  const commandsMap: Record<string, Command> = {
    "/dado": {
      name: "Dado",
      icon: <MdTitle />,
      description: "Modela um tipo de dado",
      usage: ["/dado", "[nome]", "[atributo:tipo]"],
      execute: (...args: string[]) => {
        const [dataTypeName, ...attributes] = args;

        if (!openDocument) {
          return;
        }

        addNode(
          DataDefinitionDocumentNode(
            dataTypeName ?? "tipo",
            attributes.reduce((map, attribute) => {
              const [name, type] = attribute.split(":");
              return { ...map, [name]: type };
            }, {}),
            openDocument.id
          )
        );
      },
    },
    "/formula": {
      name: "Fórmula",
      icon: <MdTitle />,
      description: "Cria uma fórmula",
      usage: ["/formula", "[nome]", "[valor]"],
      execute: (...args: string[]) => {
        const [name, ...value] = args;

        if (!openDocument) {
          return;
        }

        addNode(
          FormulaDocumentNode(name ?? "formula", value ?? [], openDocument.id)
        );
      },
    },
    "/valor": {
      name: "Valor",
      icon: <MdTitle />,
      description: "Define um valor ou constante",
      usage: ["/valor", "[nome]", "[tipo]"],
      execute: (...args: string[]) => {
        const [name, type, value] = args;

        if (!openDocument) {
          return;
        }

        addNode(
          ValueDocumentNode(
            name ?? "valor",
            (type ?? "number") as any,
            value ?? 0,
            openDocument.id
          )
        );
      },
    },
    "#": {
      icon: <MdTitle />,
      name: "Título 1",
      description: "Título de seção grande",
      usage: ["#", "Título"],
      execute: () => {},
    },
    "##": {
      icon: <MdTitle />,
      name: "Título 2",
      description: "Título de seção grande",
      usage: ["##", "Título"],
      execute: () => {},
    },
    "###": {
      icon: <MdTitle />,
      name: "Título 3",
      description: "Título de seção grande",
      usage: ["###", "Título"],
      execute: () => {},
    },
    "####": {
      icon: <MdTitle />,
      name: "Título 4",
      description: "Título de seção grande",
      usage: ["####", "Título"],
      execute: () => {},
    },
    "#####": {
      icon: <MdTitle />,
      name: "Título 5",
      description: "Título de seção grande",
      usage: ["#####", "Título"],
      execute: () => {},
    },
    "#######": {
      icon: <MdTitle />,
      name: "Título 6",
      description: "Título de seção grande",
      usage: ["######", "Título"],
      execute: () => {},
    },
  };

  const textNodeOnFocus: Context["textNodeOnFocus"] =
    (node, setContent) => () => {
      setContent(node.metadata.value);
    };

  const textNodeOnBlur: Context["textNodeOnBlur"] =
    (node, setContent) => (ev) => {
      if (!openDocument) {
        return;
      }

      const markdownContent = ev.target.innerText;

      if (markdownContent.replaceAll(/\s/g, "") === "") {
        deleteNode(node);
        return;
      }

      updateNode(
        TextDocumentNode(markdownContent, openDocument.id, node.index)
      );

      setContent(markdown.processor.processSync(markdownContent).result);
    };

  const textNodeOnKeyDown: Context["textNodeOnKeyDown"] = (ev) => {
    if (!ev.shiftKey && ev.key === "Enter") {
      ev.preventDefault();

      if (ev.currentTarget.parentNode?.nextSibling?.childNodes?.[0]) {
        (
          ev.currentTarget.parentNode?.nextSibling.childNodes[0] as HTMLElement
        ).focus();
      } else {
        inputNodeRef.current?.focus();
      }
    }
  };

  const inputNodeOnKeyDown: Context["inputNodeOnKeyDown"] = (ev) => {
    if (!ev.shiftKey && ev.key === "Enter") {
      ev.preventDefault();

      if (!openDocument) {
        return;
      }

      setInputNodeCommandSuggestion([]);

      const content = ev.currentTarget.innerText;

      if (content.startsWith("/")) {
        const [command, ...args] = content.split(" ");

        commandsMap[command]?.execute(...args);
      } else {
        addNode(TextDocumentNode(content, openDocument.id));
      }

      ev.currentTarget.innerHTML = "";
    }
  };

  const inputNodeOnInput: Context["inputNodeOnInput"] = (ev) => {
    setInputNodeValue(ev.currentTarget.innerText);
  };

  useEffect(() => {
    const trimmedValue = inputNodeValue.trim();

    if (trimmedValue === "/") {
      setInputNodeCommandSuggestion(Object.values(commandsMap));
      return;
    }

    const matchCommand = Object.entries(commandsMap).filter(
      ([commandName]) =>
        commandName.startsWith(trimmedValue) ||
        trimmedValue.startsWith(commandName)
    );

    if (trimmedValue !== "" && matchCommand.length > 0) {
      setInputNodeCommandSuggestion(matchCommand.map(([, command]) => command));
      return;
    }

    setInputNodeCommandSuggestion([]);
  }, [inputNodeValue]);

  return (
    <DocumentContext.Provider
      value={{
        nodes: openDocument?.nodes ?? [],
        textNodeOnBlur,
        textNodeOnFocus,
        textNodeOnKeyDown,
        inputNodeOnKeyDown,
        inputNodeOnInput,
        addNode,
        updateNode,
        deleteNode,
        inputNodeRef,
        inputNodeValue,
        openDocument,
        inputNodeCommandSuggestion,
        setOpenDocument,
      }}
    >
      {props.children}
    </DocumentContext.Provider>
  );
}
