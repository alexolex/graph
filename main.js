miro.onReady(() => {
    miro.initialize({
        extensionPoints: {

            getWidgetMenuItems: (widgets) => {
                return Promise.resolve([{
                    tooltip: 'Export as a graph (JSON)',
                    svgIcon: icon24,
                    onClick: (widgets) => {
                        console.log('onClick', widgets)
                    }
                }, {
                    tooltip: 'Export as a graph (CSV)',
                    svgIcon: icon24,
                    onClick: (widgets) => {
                        console.log('onClick', widgets)
                    }
                }])
            }
        }
    })
})

// miro.board.selection.get().then((s) => {


//     let nodes = s.filter(item => item.type === "SHAPE").map(shape => [shape.id, shape.plainText]);

//     let nodesCsv = "data:text/csv;charset=utf-8," + "id,plainText\n" + nodes.map(e => e.join(",")).join("\n");
//     download(nodesCsv, "nodes.csv")

//     let edges = s.filter(item => item.type === "LINE").map(line => [line.id, line.startWidgetId, line.endWidgetId, line.captions.length > 0 ? line.captions[0].text : ""]);
//     let edgesCsv = "data:text/csv;charset=utf-8," + "id,startWidgetId,endWindgetId,caption\n" + edges.map(e => e.join(",")).join("\n");
//     download(edgesCsv, "edges.csv")
// })

function download(content, fileName) {
    var encodedUri = encodeURI(content);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for FF

    link.click();
}
  /*


nodes columns:
id : string
plainText : string

edges columns
id : string

*/