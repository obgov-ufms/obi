import { labelstudio } from "./config.ts"
import { CsvStringifyStream } from "@std/csv";
import { JsonStringifyStream } from "@std/json";

export function getResultStream(type: "application/json" | 'text/csv') {
    const readable = ReadableStream.from(fetchResults());

    const stringifyStream = type === "application/json" ? new JsonStringifyStream() : new CsvStringifyStream({
        columns: ["coletado_por", "coletado_em", "orgao", "ano",
            "eixo", "questao", "qualificador", "categoria", "pagina", "valor", "x", "y", "largura", "altura", "rotacao"
        ]
    })

    return readable
        .pipeThrough(stringifyStream)
        .pipeThrough(new TextEncoderStream())

}

async function* fetchResults() {
    const tasksRequest = await fetch(`${labelstudio.API_PATH}/tasks?project=${labelstudio.PROJECT_ID}&fields=all&query=${encodeURIComponent(JSON.stringify({ filters: { "conjunction": "and", "items": [{ "filter": "filter:tasks:completed_at", "operator": "empty", "value": false, "type": "Datetime" }] } }))}`, {
        headers: {
            Authorization: `Token ${labelstudio.AUTH_TOKEN}`
        }
    })

    const tasks = await tasksRequest.json()

    for (const task of tasks.tasks) {
        const orgao = task.data.orgao
        const ano = Number(task.data.ano)

        const lastAnnotation = task.annotations.at(-1)

        const coletado_por = lastAnnotation.created_username
        const coletado_em = lastAnnotation.created_at

        const labelInfoMap = new Map<string, any[]>()

        for (const annotationResult of lastAnnotation.result) {
            if (annotationResult.type === "retanglelabels") {
                labelInfoMap.set(annotationResult.id, annotationResult)
                continue;
            }

            if (!labelInfoMap.has(annotationResult.id)) {
                labelInfoMap.set(annotationResult.id, [annotationResult])
            } else {
                labelInfoMap.set(annotationResult.id, [...labelInfoMap.get(annotationResult.id)!, annotationResult])
            }
        }

        for (const annotations of labelInfoMap.values()) {
            const rectanglelabels = annotations.find(({ type }) => type === "rectanglelabels")
            const textarea = annotations.find(({ type }) => type === "textarea")

            const { value: { x, y, width: largura, height: altura, rotation: rotacao }, to_name } = rectanglelabels
            const { value: { text: [valor] } } = textarea ?? { value: { text: [] } }

            const pagina = Number(to_name.split("_")[1])

            for (const label of rectanglelabels.value.rectanglelabels) {
                const [eixo, questao, qualificador, categoria] = label.split(" > ")

                yield {
                    orgao, ano,
                    coletado_por,
                    coletado_em,
                    eixo, questao, qualificador, categoria, pagina, valor, x, y, largura, altura, rotacao
                }
            }
        }
    }
}




