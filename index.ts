/// <reference path="./SarapanGrid.ts" />
'use strict';
var grid: Sarapan.Grid<any>;
var columns: Sarapan.Column[] = [
    {
        id: "f0",
        field: "f0",
        name: "f0",
        editor: Slick.Editors.Text,
        sortable: true
    },
    {
        id: "f1",
        field: "f1",
        name: "f1",
        key: true,
        sortable: true
    }
];
var options = {
};

window.onload = function(evt) {
    grid = new Sarapan.Grid(
        document.getElementById('myGrid'),
        columns,
        options);

    var btn_load = document.getElementById('btn_load');
    if(btn_load) {
        btn_load.addEventListener('click', function(evt) {
            let input_file: any = document.getElementById("input_file");
            if(0<input_file.files.length) {
                grid.importFromFile(input_file.files[0], false);
            }
        });
    }

    var btn_loadurl = document.getElementById('btn_loadurl');
    if(btn_loadurl) {
        btn_loadurl.addEventListener('click', function(evt) {
            let url = "test.json";
            grid.importFromUrl(url, false);
        });
    }

    var btn_new = document.getElementById('btn_new');
    if(btn_new) {
        btn_new.addEventListener('click', function(evt) {
            grid.addNewRow();
        });
    }

    var btn_delete = document.getElementById('btn_delete');
    if(btn_delete) {
        btn_delete.addEventListener('click', function(evt) {
            grid.deleteRows(grid.getSelectedRows());
        });
    }

    var btn_revert = document.getElementById('btn_revert');
    if(btn_revert) {
        btn_revert.addEventListener('click', function(evt) {
            grid.revertRows(grid.getSelectedRows());
        });
    }

    var btn_export = document.getElementById('btn_export');
    if(btn_export) {
        btn_export.addEventListener('click', function(evt) {
            var objectUrl = grid.exportToObjectUrl();
            var dlElm = document.createElement('a');
            var fileName = "Export_" + Sarapan.Utils.formatDate() + ".csv"
            dlElm.href = objectUrl;
            dlElm.download = fileName;
            dlElm.appendChild(document.createTextNode(fileName));
            window.document.body.appendChild(dlElm);
            dlElm.click();
        });
    }

    var btn_commit = document.getElementById('btn_commit');
    if(btn_commit) {
        btn_commit.addEventListener('click', function(evt) {
            grid.commitChanges();
        });
    }
    
    var data = [
        {
            "f0": "Hello",
            "f1": 123
        },
        {
            "f0": "こんにちは",
            "f1": 789
        }
    ]
    grid.initData(data);
}