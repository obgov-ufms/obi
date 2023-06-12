import Navbar from "@/components/Navbar";
import { deleteDocument, documents } from "@/state/DocumentStore";
import { organizations } from "@/state/OrganizationStore";
import { addRecentlyOpenedDocument } from "@/state/RecentlyOpenedDocuments";
import { domain, useDocument, Document } from "@vega/documents";
import { useEffect, useState } from "react";
import {
  MdClose,
  MdUndo,
  MdRedo,
  MdMoreHoriz,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from "react-icons/md";
import { useStore } from "@nanostores/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { documentNodes } from "@/state/DocumentNodeStore";

export function DocumentPage() {
  const [confirmDeletionModalOpen, setConfirmDeletionModalOpen] =
    useState(false);

  const navigate = useNavigate();
  const { documentId } = useParams();

  const organizationsStore = useStore(organizations);
  const documentNodesStore = useStore(documentNodes).filter(
    ({ documentId: id }) => id === documentId
  );

  const { openDocument, setOpenDocument } = useDocument();

  useEffect(() => {
    const document = documents.get().find(({ id }) => id === documentId);

    if (!document) {
      throw new Error("Cannot find document");
    }

    setOpenDocument({ ...document, nodes: documentNodesStore });
    addRecentlyOpenedDocument(document.id);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col">
      {confirmDeletionModalOpen && (
        <ConfirmDeletionModal
          onClose={() => setConfirmDeletionModalOpen(false)}
          onConfirm={() => {
            if (openDocument) {
              deleteDocument(openDocument.id);
              setOpenDocument(undefined);
              navigate("/");
            }
          }}
          openDocument={openDocument}
        />
      )}

      <Navbar />

      {openDocument && (
        <div className="bg-slate-50 h-full flex-1 flex flex-col p-10">
          <header className="w-full flex items-center justify-between px-4 py-1 bg-slate-100 rounded-t-lg border border-slate-200">
            <div className="flex items-center text-slate-300">
              <button className="text-sm hover:bg-slate-300 hover:text-slate-500 px-2 py-1 rounded-md select-none">
                {
                  organizationsStore.find(
                    ({ id }) => id === openDocument.organizationId
                  )?.name
                }
              </button>
              <span>/</span>
              <h1 className="text-slate-500/70 px-2 py-1 rounded-md">
                {openDocument.name}
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmDeletionModalOpen(true)}
                className="hover:bg-slate-300 text-slate-700 rounded-md p-[0.3rem]"
              >
                <MdMoreHoriz />
              </button>

              <Link
                to="/"
                onClick={() => setOpenDocument(undefined)}
                className="text-sm text-slate-700 bg-slate-200 rounded-md p-[0.3rem]"
              >
                <MdClose />
              </Link>
            </div>
          </header>
          <div className="flex gap-1 w-full px-4 py-1 bg-white border-x border-b border-slate-200">
            <button className="text-slate-600 rounded-md p-[0.3rem]">
              <MdUndo />
            </button>

            <button className="text-slate-600 rounded-md p-[0.3rem]">
              <MdRedo />
            </button>

            <button className="text-slate-600 rounded-md p-[0.3rem]">
              <MdFormatBold />
            </button>

            <button className="text-slate-600 rounded-md p-[0.3rem]">
              <MdFormatItalic />
            </button>

            <button className="text-slate-600 rounded-md p-[0.3rem]">
              <MdFormatUnderlined />
            </button>
          </div>
          <main className="flex-1 border-b border-x border-slate-200/70 bg-white shadow-md shadow-slate-100 rounded-x-lg rounded-b-lg">
            <Document />
          </main>
        </div>
      )}
    </div>
  );
}

function ConfirmDeletionModal(props: {
  onClose: () => void;
  onConfirm: () => void;
  openDocument?: domain.Document;
}) {
  return (
    <dialog
      open
      className="absolute top-0 left-0 bg-transparent w-full h-full z-[2] flex items-center justify-center"
    >
      <form
        className="p-4 w-1/2 bg-white rounded-xl flex flex-col gap-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          props.onConfirm();
          props.onClose();
        }}
      >
        <div className="w-full flex justify-between">
          <div className="pl-4 pt-4">
            <h1 className="text-2xl font-semibold">Deletar documento</h1>
            <p className="text-slate-400">
              Você realmente deseja deletar o documento "
              {props.openDocument?.name}"?
            </p>
          </div>

          <button
            className="h-fit bg-slate-100 text-slate-600 p-2 rounded-full"
            onClick={() => props.onClose()}
            type="button"
          >
            <MdClose />
          </button>
        </div>

        <div className="w-full flex justify-center gap-2">
          <button
            className="bg-slate-300 px-4 py-2 font-semibold text-slate-500 rounded-xl"
            type="button"
            onClick={() => props.onClose()}
          >
            Cancelar
          </button>
          <button
            className="bg-red-400 px-4 py-2 font-semibold text-red-800 rounded-xl"
            type="submit"
          >
            Deletar
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

export default DocumentPage;
