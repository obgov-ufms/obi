import { MdClose } from "react-icons/md";
import { useStore } from "@nanostores/react";
import { organizations } from "@/state/OrganizationStore";
import {
  addDocument,
  documents,
  recentlyOpenedDocuments,
} from "@/state/DocumentStore";
import { documentNodes } from "@/state/DocumentNodeStore";
import { useState } from "react";
import { Organization } from "@/domain/Organization";
import { Navbar } from "@/components/Navbar";
import { Link, useNavigate } from "react-router-dom";

export function HomePage() {
  const [createDocumentModalOpen, setCreateDocumentModalOpen] = useState(false);

  const navigate = useNavigate();

  const organizationsStore = useStore(organizations);
  const documentsStore = useStore(documents);
  const recentlyOpenedDocumentsStore = useStore(recentlyOpenedDocuments);

  return (
    <div className="w-screen h-screen flex flex-col">
      {createDocumentModalOpen && (
        <CreateDocumentModal
          onClose={() => setCreateDocumentModalOpen(false)}
          onCreate={(data) => {
            const document = addDocument({
              organizationId: data.organizationId,
              name: data.name,
            });

            navigate(`/document/${document.id}`);
          }}
        />
      )}

      <Navbar />

      <main className="bg-slate-50 h-full flex-1 flex flex-col">
        <section className="w-full h-60 bg-slate-200 p-4 flex flex-col gap-2">
          <h2 className="text-lg text-slate-700/50">Recentes</h2>

          <div className="flex-1 w-full flex items-center gap-4">
            <button
              onClick={() => setCreateDocumentModalOpen(true)}
              className="h-full w-36 bg-slate-100 border border-slate-300/70 rounded-md flex items-center justify-center"
            >
              <span className="p-2 text-sm text-slate-500">Novo documento</span>
            </button>
            {recentlyOpenedDocumentsStore.map((document) => (
              <Link
                to={`/document/${document.id}`}
                key={document.id}
                className="h-full w-36 bg-white border border-slate-300/70 rounded-md flex flex-col"
              >
                <div className="flex-1 bg-slate-100 rounded-t-md border-b border-slate-300/70"></div>
                <span className="p-2 text-left text-sm text-slate-700">
                  {document.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex-1">
          {organizationsStore.map((organization) => (
            <section
              key={organization.id}
              className="w-full h-60 flex flex-col p-4 gap-2"
            >
              <h2 className="text-lg text-slate-700/50">{organization.name}</h2>
              <div className="flex-1 w-full flex items-center gap-4">
                {documentsStore
                  .filter(
                    ({ organizationId }) => organizationId === organization.id
                  )
                  .map((document) => (
                    <Link
                      to={`/document/${document.id}`}
                      key={document.id}
                      className="h-full w-36 bg-white border border-slate-300/70 rounded-md flex flex-col"
                    >
                      <div className="flex-1 bg-slate-100 rounded-t-md border-b border-slate-300/70"></div>
                      <span className="p-2 text-left text-sm text-slate-700">
                        {document.name}
                      </span>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function CreateDocumentModal(props: {
  onClose: () => void;
  onCreate: (data: {
    type: "organizational" | "presentation";
    organizationId: Organization["id"];
    name: string;
  }) => void;
}) {
  const organizationsStore = useStore(organizations);

  const [formData, setFormData] = useState<{
    type: "organizational" | "presentation";
    organizationId: Organization["id"];
    name: string;
  }>({
    name: "",
    organizationId: organizationsStore[0].id,
    type: "organizational",
  });

  return (
    <dialog
      open
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
            type="button"
          >
            <MdClose />
          </button>
        </div>

        <div className="flex gap-4 px-4">
          <select
            className="p-2 rounded-md text-slate-500 bg-white border border-slate-300"
            name="organization_select"
            value={formData.organizationId}
            onChange={(ev) =>
              setFormData((state) => ({
                ...state,
                organizationId: ev.target.value,
              }))
            }
          >
            {organizationsStore.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
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
