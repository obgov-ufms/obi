import { Document, useDocument } from "@vega/documents";
import Accordion from "@/components/Accordion";
import { MdApartment, MdSearch, MdClose, MdDelete } from "react-icons/md";
import { useStore } from "@nanostores/react";
import { organizations } from "@/state/OrganizationStore";
import classnames from "classnames";
import { addDocument, deleteDocument, documents } from "@/state/DocumentStore";
import { documentNodes } from "@/state/DocumentNodeStore";
import { Organization } from "@/domain/Organization";
import { useState } from "react";

export function HomePage() {
  const [createDocumentModalOpen, setCreateDocumentModalOpen] = useState(false);
  const { openDocument, setOpenDocument } = useDocument();

  return (
    <div className="w-screen h-screen flex">
      {createDocumentModalOpen && (
        <CreateDocumentModal
          onClose={() => setCreateDocumentModalOpen(false)}
          onCreate={(data) => {
            const document = addDocument({
              organizationId: "0gqOOauBdnWZtVMFaGdcq",
              name: data.name,
            });

            setOpenDocument({ ...document, nodes: [] });
          }}
        />
      )}

      <aside className="bg-white border-r border-slate-200 h-full w-64 flex flex-col gap-2 py-4">
        <h1 className="text-3xl font-semibold py-3 px-6 text-slate-800">
          Vega
        </h1>
        <div className="flex flex-col gap-2 pr-4">
          <Accordion
            items={[
              {
                id: "organizacoes",
                title: (
                  <div className="flex items-center gap-2 p-4">
                    <MdApartment className="text-slate-500 text-lg" />
                    <h3 className="text-slate-700">Organizações</h3>
                  </div>
                ),
                open: true,
                content: (
                  <OrganizationsAccordion
                    onCreateDocument={() => setCreateDocumentModalOpen(true)}
                  />
                ),
              },
            ]}
          />
        </div>
      </aside>
      <main className="bg-slate-50 h-full flex-1 flex flex-col">
        {openDocument && (
          <header className="w-full h-1/12 bg-white border-b border-slate-200 flex items-center px-8">
            <div className="flex-1 flex items-center">
              <MdSearch className="text-xl text-gray-600" />
              <input
                type="search"
                placeholder="Buscar por informações no documento"
                className="w-full h-1/2 p-4"
              />

              <button
                onClick={() => {
                  if (openDocument) {
                    deleteDocument(openDocument.id);
                    setOpenDocument(undefined);
                  }
                }}
                className="bg-red-100 text-sm text-red-700 rounded-xl p-2"
              >
                <MdDelete />
              </button>
            </div>
          </header>
        )}

        <div className="p-10 h-full">
          <Document />
        </div>
      </main>
    </div>
  );
}

function OrganizationsAccordion(props: {
  onCreateDocument: (params: { organizationId: Organization["id"] }) => void;
}) {
  const organizationsStore = useStore(organizations);
  const documentsStore = useStore(documents);
  const documentNodesStore = useStore(documentNodes);

  const { openDocument, setOpenDocument } = useDocument();

  return (
    <div className="pl-8">
      <Accordion
        items={organizationsStore.map((organization) => ({
          id: organization.id,
          title: (
            <h4 className="p-3 text-slate-700 text-sm">{organization.name}</h4>
          ),
          open: true,
          content: (
            <div className="pl-2 flex flex-col gap-2">
              <button
                onClick={() =>
                  props.onCreateDocument({ organizationId: organization.id })
                }
                className="text-left text-sm border border-slate-100 hover:bg-slate-50 p-2 rounded-lg text-slate-500"
              >
                Novo documento
              </button>
              {documentsStore
                .filter(
                  ({ organizationId }) => organizationId === organization.id
                )
                .map((document) => (
                  <button
                    onClick={() =>
                      setOpenDocument({
                        ...document,
                        nodes: documentNodesStore.filter(
                          ({ documentId }) => documentId === document.id
                        ),
                      })
                    }
                    key={document.id}
                    className={classnames(
                      "text-left text-sm bg-slate-100 p-2 rounded-lg text-slate-500",
                      openDocument?.id === document.id
                        ? "bg-slate-200"
                        : "hover:bg-slate-200"
                    )}
                  >
                    {document.name}
                  </button>
                ))}
            </div>
          ),
        }))}
      />
    </div>
  );
}

function CreateDocumentModal(props: {
  onClose: () => void;
  onCreate: (data: {
    type: "organizational" | "presentation";
    name: string;
  }) => void;
}) {
  const [formData, setFormData] = useState<{
    type: "organizational" | "presentation";
    name: string;
  }>({
    name: "",
    type: "organizational",
  });

  return (
    <dialog
      open
      autoFocus
      onBlur={() => props.onClose()}
      className="absolute top-0 left-0 bg-transparent w-full h-full z-[2] flex items-center justify-center"
    >
      <form
        className="p-4 w-1/2 bg-white rounded-xl flex flex-col gap-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          props.onCreate(formData);
          props.onClose();
        }}
      >
        <div className="w-full flex justify-between">
          <div className="pl-4 pt-4">
            <h1 className="text-2xl font-semibold">Criar novo documento</h1>
            <p className="text-slate-400">Criar um novo documento</p>
          </div>

          <button
            className="h-fit bg-slate-100 text-slate-600 p-2 rounded-full"
            onClick={() => props.onClose()}
          >
            <MdClose />
          </button>
        </div>

        <div className="flex gap-4 px-4">
          <div>
            <input
              type="radio"
              id="document_type_organizational"
              name="document_type"
              value="organizational"
              checked={formData.type === "organizational"}
              className="peer hidden"
              onChange={() =>
                setFormData((state) => ({ ...state, type: "organizational" }))
              }
            />
            <label
              htmlFor="document_type_organizational"
              className="text-slate-400 peer-checked:text-blue-600 p-2 rounded-md border border-slate-300 peer-checked:border-blue-500/40 peer-checked:bg-blue-50"
            >
              Organizacional
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="document_type_presentation"
              name="document_type"
              value="presentation"
              checked={formData.type === "presentation"}
              className="peer hidden"
              onChange={() =>
                setFormData((state) => ({ ...state, type: "presentation" }))
              }
            />
            <label
              htmlFor="document_type_presentation"
              className="text-slate-400 peer-checked:text-blue-600 p-2 rounded-md border border-slate-300 peer-checked:border-blue-500/40 peer-checked:bg-blue-50"
            >
              Apresentação
            </label>
          </div>
        </div>

        <div className="px-4">
          <input
            type="text"
            name="document_name"
            placeholder="Nome do documento"
            value={formData.name}
            onChange={(ev) =>
              setFormData((state) => ({ ...state, name: ev.target.value }))
            }
            className="border border-slate-200 p-2 rounded-md w-72"
          />
        </div>

        <div className="flex justify-end">
          <button
            className="bg-green-400 px-4 py-2 font-semibold  text-green-800 rounded-xl"
            type="submit"
          >
            Criar
          </button>
        </div>
      </form>
      <div
        className="absolute z-[-1] bg-slate-900/20 w-full h-full"
        onClick={() => props.onClose()}
      ></div>
    </dialog>
  );
}

export default HomePage;
