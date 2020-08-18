const export_icon24 = '<path fill-rule="evenodd" clip-rule="evenodd" d="M5.70711 6.70714L8 4.41424V13C8 13.5523 8.44771 14 9 14C9.55229 14 10 13.5523 10 13V4.41424L12.2929 6.70714C12.6834 7.09766 13.3166 7.09766 13.7071 6.70714C14.0976 6.31661 14.0976 5.68345 13.7071 5.29292L9 0.585815L4.29289 5.29292C3.90237 5.68345 3.90237 6.31661 4.29289 6.70714C4.68342 7.09766 5.31658 7.09766 5.70711 6.70714ZM16 14V17H2V14C2 13.4477 1.55228 13 1 13C0.447715 13 0 13.4477 0 14V19H18V14C18 13.4477 17.5523 13 17 13C16.4477 13 16 13.4477 16 14Z" fill="#050038"/>'

miro.onReady(() => {
    miro.initialize({
        extensionPoints: {

            getWidgetMenuItems: (widgets) => {
                return Promise.resolve([{
                    tooltip: 'Export graph to JSON',
                    svgIcon: export_icon24,
                    onClick: async () => {

                        const authorized = await miro.isAuthorized()
                        if (authorized) {
                            exportToJson();
                        } else {
                            console.log("App needs auth by the user...");

                            miro.board.ui.openModal('not-authorized.html')
                                .then(res => {
                                    if (res === 'success') {
                                        exportToJson()
                                    }
                                })
                        }
                    }
                },
                {
                    tooltip: 'Export graph to CSV',
                    svgIcon: export_icon24,
                    onClick: () => {

                        miro.board.selection.get().then((selection) => {

                            let nodes = selection.filter(w => w.type === "SHAPE").map(shape => [shape.id, shape.plainText]);
                            let nodesCsv = "data:text/csv;charset=utf-8," + "id,plainText\n" + nodes.map(e => e.join(",")).join("\n");
                            download(nodesCsv, "nodes.csv")

                            let edges = selection.filter(w => w.type === "LINE").map(line => [line.id, line.startWidgetId, line.endWidgetId, line.captions && line.captions.length > 0 ? line.captions[0].text : ""]);
                            let edgesCsv = "data:text/csv;charset=utf-8," + "id,startWidgetId,endWindgetId,caption\n" + edges.map(e => e.join(",")).join("\n");
                            download(edgesCsv, "edges.csv")
                        });
                    }
                }])
            }
        }
    })
})

function exportToJson() {
    miro.board.selection.get().then((selection) => {

        let graph = {
            "nodes": selection.filter(w => w.type === "SHAPE").map(shape => {
                return {
                    "id": shape.id,
                    "plainText": shape.plainText
                }
            }),
            "edges": selection.filter(w => w.type === "LINE").map(line => {
                return {
                    "id": line.id,
                    "startWidgetId": line.startWidgetId,
                    "endWidgetId": line.endWidgetId,
                    "caption": line.captions && line.captions.length > 0 ? line.captions[0].text : ""
                }
            })
        };

        var graphJson = "data:text/json;charset=utf-8," + JSON.stringify(graph);
        download(graphJson, "graph.json");

        console.log("Successfully exported a graph to JSON.")
    })
}

function download(content, fileName) {
    var encodedUri = encodeURI(content);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for FF

    link.click();
}