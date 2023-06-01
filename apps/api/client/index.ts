export const buildClient = (
  config: { hostname: string; port: number } = {
    hostname: "0.0.0.0",
    port: 3000,
  }
) => {
  const API_PATH = `http://${config.hostname}:${config.port}/v1`;

  return {
    organization: {
      getAll: () =>
        fetch(`${API_PATH}/organizations`).then((response) => response.json()),
      getOne: (query: { id: string }) =>
        fetch(`${API_PATH}/organizations/${query.id}`).then((response) =>
          response.json()
        ),
      createOne: (data: {}) =>
        fetch(`${API_PATH}/organizations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => response.json()),
      deleteOne: (query: { id: string }) =>
        fetch(`${API_PATH}/organizations/${query.id}`, {
          method: "DELETE",
        }).then((response) => response.json()),
      updateOne: (query: { id: string }, data: {}) =>
        fetch(`${API_PATH}/organizations/${query.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => response.json()),
    },
    document: {
      getAll: () =>
        fetch(`${API_PATH}/documents`).then((response) => response.json()),
      getOne: (query: { id: string }) =>
        fetch(`${API_PATH}/documents/${query.id}`).then((response) =>
          response.json()
        ),
      createOne: (data: {}) =>
        fetch(`${API_PATH}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => response.json()),
      deleteOne: (query: { id: string }) =>
        fetch(`${API_PATH}/documents/${query.id}`, {
          method: "DELETE",
        }).then((response) => response.json()),
      updateOne: (query: { id: string }, data: {}) =>
        fetch(`${API_PATH}/documents/${query.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => response.json()),
    },
    documentNode: {
      getAll: (query: { documentId: string }) =>
        fetch(`${API_PATH}/documents/${query.documentId}/nodes`).then(
          (response) => response.json()
        ),
      getOne: (query: { documentId: string; id: number }) =>
        fetch(
          `${API_PATH}/documents/${query.documentId}/nodes/${query.id}`
        ).then((response) => response.json()),
      createOne: (data: { documentId: string }) =>
        fetch(`${API_PATH}/documents/${data.documentId}/nodes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => response.json()),
      deleteOne: (query: { documentId: string; id: number }) =>
        fetch(`${API_PATH}/documents/${query.documentId}/nodes/${query.id}`, {
          method: "DELETE",
        }).then((response) => response.json()),
      updateOne: (query: { documentId: string; id: number }, data: {}) =>
        fetch(`${API_PATH}/documents/${query.documentId}/nodes/${query.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => response.json()),
    },
    dataDefinitionEntry: {
      getAll: (query: { documentId: string; documentNodeId: number }) =>
        fetch(
          `${API_PATH}/documents/${query.documentId}/nodes/${query.documentNodeId}/entries`
        ).then((response) => response.json()),
      getOne: (query: {
        documentId: string;
        documentNodeId: number;
        id: number;
      }) =>
        fetch(
          `${API_PATH}/documents/${query.documentId}/nodes/${query.documentNodeId}/entries/${query.id}`
        ).then((response) => response.json()),
      createOne: (data: { documentId: string; documentNodeId: number }) =>
        fetch(
          `${API_PATH}/documents/${data.documentId}/nodes/${data.documentNodeId}/entries`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        ).then((response) => response.json()),
      deleteOne: (query: {
        documentId: string;
        documentNodeId: number;
        id: number;
      }) =>
        fetch(
          `${API_PATH}/documents/${query.documentId}/nodes/${query.documentNodeId}/entries/${query.id}`,
          {
            method: "DELETE",
          }
        ).then((response) => response.json()),
      updateOne: (
        query: {
          documentId: string;
          documentNodeId: number;
          id: number;
        },
        data: {}
      ) =>
        fetch(
          `${API_PATH}/documents/${query.documentId}/nodes/${query.documentNodeId}/entries/${query.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        ).then((response) => response.json()),
    },
  };
};
