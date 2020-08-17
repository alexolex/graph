miro.onReady(() => {
    miro.initialize({
        extensionPoints: {


            getWidgetMenuItems: (widgets) => {

                const supportedWidgetsInSelection = widgets
                    .filter((widget) => widget.type.toLowerCase() === "shape" || widget.type.toLowerCase() === "line");

                // All selected widgets have to be supported in order to show the menu
                if (supportedWidgetsInSelection.length == widgets.length) {
                    return Promise.resolve([{

                        title: 'Export as a graph (JSON)',
                        svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
                        onClick: (widgets) => {

                            alert("JSON: " + widgets.length);
                            // miro.board.selection.get().then((s) => {


                            //     let nodes = s.filter(item => item.type === "SHAPE").map(shape => [shape.id, shape.plainText]);

                            //     let nodesCsv = "data:text/csv;charset=utf-8," + "id,plainText\n" + nodes.map(e => e.join(",")).join("\n");
                            //     download(nodesCsv, "nodes.csv")

                            //     let edges = s.filter(item => item.type === "LINE").map(line => [line.id, line.startWidgetId, line.endWidgetId, line.captions.length > 0 ? line.captions[0].text : ""]);
                            //     let edgesCsv = "data:text/csv;charset=utf-8," + "id,startWidgetId,endWindgetId,caption\n" + edges.map(e => e.join(",")).join("\n");
                            //     download(edgesCsv, "edges.csv")
                            // })
                        }
                    },
                    {
                        title: 'Export as a graph (CSV)',
                        svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
                        onClick: (widgets) => {
                            alert("CSV: " + widgets.length);
                        }
                    }])
                }

                // Not all selected widgets are supported, we won't show the menu
                return Promise.resolve([{}]);
            }
        }
    })
})

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