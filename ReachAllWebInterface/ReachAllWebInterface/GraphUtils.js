function ConvertFromRawDataToCanvasChart(p_dataPoints, p_chartStructure) {
    p_chartStructure.data = [];
    
    if (p_dataPoints.length > 0) {
        if (p_dataPoints[0].yAxisBreakdownValue !== undefined) {
            var myBreakdownValues = [];

            for (var i = 0; i < p_dataPoints.length; i++) {
                var y = p_dataPoints[i].yAxisBreakdownValue;

                if (!myBreakdownValues.includes(y)) myBreakdownValues.push(y);
            }

            for (var i = 0; i < myBreakdownValues.length; i++) {
                var myLocalDataPoints = [];

                for (var j = 0; j < p_dataPoints.length; j++) {
                    if (p_dataPoints[j].yAxisBreakdownValue == myBreakdownValues[i]) myLocalDataPoints.push({ label: p_dataPoints[j].label, y: p_dataPoints[j].y });
                }

                p_chartStructure.data.push({ type: myCanvasJSChartType, bevelEnabled: false, fillOpacity: 1, showInLegend: true, name: myBreakdownValues[i], color: GetHSLColour(i, myBreakdownValues.length), dataPoints: myLocalDataPoints });
            }
        }
        else {
            var myLocalDataPoints = [];

            for (var j = 0; j < p_dataPoints.length; j++) myLocalDataPoints.push({label: p_dataPoints[j].label, y: p_dataPoints[j].y });

            p_chartStructure.data.push({ type: myCanvasJSChartType, bevelEnabled: false, fillOpacity: 1, dataPoints: myLocalDataPoints });
        }
    }
}

function ConvertFromRawDataToChartJS(p_dataPoints, p_chartJSStructure) {
    var numberOfColoursToUse = hslNumberOfColours;

    if (p_chartJSStructure.data === undefined) p_chartJSStructure.data = {};
    if (p_chartJSStructure.data.datasets === undefined) p_chartJSStructure.data.datasets = [];
    if (p_chartJSStructure.data.labels === undefined) p_chartJSStructure.data.labels = [];

    if (hslNumberOfColours == 0) {
        numberOfColoursToUse = p_dataPoints.length;

        switch (myXAxisType) {
            case "BY_DAY":
                numberOfColoursToUse = 7;
                break;

            case "BY_MONTH":
                numberOfColoursToUse = 12;
                break;

            case "BY_WEEK":
                numberOfColoursToUse = 52;
                break;
        }
    }

    if (p_dataPoints.length > 0) {
        if (p_dataPoints[0].yAxisBreakdownValue === undefined) {
            if (p_chartJSStructure.data.datasets.length == 0) p_chartJSStructure.data.datasets.push({ label: "Dataset 0", data: [], backgroundColor: [], hoverBackgroundColor: [] });

            if (p_chartJSStructure.data.labels.length == 0) {
                for (var i = 0; i < p_dataPoints.length; i++) {
                    p_chartJSStructure.data.datasets[0].data.push(p_dataPoints[i].y);
                    p_chartJSStructure.data.labels.push(p_dataPoints[i].label);

                    p_chartJSStructure.data.datasets[0].backgroundColor.push(GetHSLColour(p_chartJSStructure.data.datasets[0].backgroundColor.length, numberOfColoursToUse));
                    p_chartJSStructure.data.datasets[0].hoverBackgroundColor.push(GetHSLColour(p_chartJSStructure.data.datasets[0].hoverBackgroundColor.length, numberOfColoursToUse, true));
                }
            }
            else {
                for (var i = 0; i < p_dataPoints.length; i++) p_chartJSStructure.data.datasets[0].data[i] = p_dataPoints[i].y;
            }
        }
        else {
            if (p_dataPoints[0].callType === undefined) {
                var myBreakdownValues = [];

                // Create a list of unique y axis breakdown values present in the data
                for (var i = 0; i < p_dataPoints.length; i++) {
                    var y = p_dataPoints[i].yAxisBreakdownValue;

                    if (!myBreakdownValues.includes(y)) myBreakdownValues.push(y);
                }

                // Create a list of unique labels present in the data
                for (var i = 0; i < p_dataPoints.length; i++) {
                    var myLabel = p_dataPoints[i].label;

                    if (!p_chartJSStructure.data.labels.includes(myLabel)) p_chartJSStructure.data.labels.push(myLabel);
                }

                // Loop over each y axis breakdown value
                for (var i = 0; i < myBreakdownValues.length; i++) {
                    // Add a new dataset for each y axis breakdown value
                    if (p_chartJSStructure.data.datasets.length <= i) p_chartJSStructure.data.datasets.push({ label: myBreakdownValues[i], data: [], backgroundColor: GetHSLColour(i, myBreakdownValues.length) });

                    if (p_chartJSStructure.data.datasets[i].data.length == 0) {
                        // Loop over each item of data
                        for (var j = 0; j < p_dataPoints.length; j++) {
                            // Add y value if y axis breakdown value matches
                            if (p_dataPoints[j].yAxisBreakdownValue == myBreakdownValues[i]) p_chartJSStructure.data.datasets[i].data.push(p_dataPoints[j].y);
                        }
                    }
                    else {
                        // Loop over each item of data
                        for (var j = 0; j < p_dataPoints.length; j++) {
                            // Replace y value using label value as the index if y axis breakdown value matches
                            if (p_dataPoints[j].yAxisBreakdownValue == myBreakdownValues[i]) p_chartJSStructure.data.datasets[i].data[parseInt(p_dataPoints[j].label)] = p_dataPoints[j].y;
                        }
                    }
                }
            }
            else {
                // New section to support callType and variable number of y axis breakdowns per label
                var myCallTypeValues = [];
                var myBreakdownValues = [];
                var myTotalCount = 0;
                var singleDataset = false;
                
                // Create a list of unique callType and y axis breakdown values present in the data
                for (var i = 0; i < p_dataPoints.length; i++) {
                    var myCallType = p_dataPoints[i].callType;
                    var myBreakdownValue = p_dataPoints[i].yAxisBreakdownValue;

                    if (!myCallTypeValues.includes(myCallType)) {
                        myCallTypeValues.push(myCallType);
                        myBreakdownValues.push([]);
                    }

                    if (!(myBreakdownValue == null)) {
                        var myIndex = myBreakdownValues.length - 1;
                        
                        if (!myBreakdownValues[myIndex].includes(myBreakdownValue)) myBreakdownValues[myIndex].push(myBreakdownValue);
                    }
                }

                for (var i = 0; i < myCallTypeValues.length; i++) {
                    var numberOfDatasets = myBreakdownValues[i].length;

                    if (numberOfDatasets == 0) numberOfDatasets = 1;

                    myTotalCount += numberOfDatasets;
                }

                if (myCallTypeValues.length == 1) {
                    if (myBreakdownValues[0].length == 0) singleDataset = true;
                }
                
                // Create a list of unique labels present in the data
                for (var i = 0; i < p_dataPoints.length; i++) {
                    var myLabel = p_dataPoints[i].label;

                    if (!p_chartJSStructure.data.labels.includes(myLabel)) p_chartJSStructure.data.labels.push(myLabel);
                }

                // Loop over each callType and y axis breakdown value
                var startingIndex = 0;
                
                for (var i = 0; i < myCallTypeValues.length; i++) {
                    // Add a new dataset for each callType and y axis breakdown value
                    var myBreakdownIndex = 0;
                    var datasetsToAdd = myBreakdownValues[i].length;
                    //var startingIndex = p_chartJSStructure.data.datasets.length;
                    
                    if (datasetsToAdd == 0) datasetsToAdd = 1;

                    for (var j = 0; j < datasetsToAdd; j++) {
                        var myLabel = myCallTypeValues[i];
                        var myDatasetIndex = startingIndex + j;

                        if (myCallTypeValues.length == 1) myLabel = myBreakdownValues[i][myBreakdownIndex];
                        else {
                            if (myBreakdownValues[i].length > myBreakdownIndex) myLabel += " " + myBreakdownValues[i][myBreakdownIndex];
                        }

                        if (p_chartJSStructure.data.datasets.length < (startingIndex + datasetsToAdd)) {
                            if (singleDataset)
                                p_chartJSStructure.data.datasets.push({ label: myLabel, data: [], backgroundColor: [], hoverBackgroundColor: [], stack: "Stack " + myRowData[i] });
                            else
                                p_chartJSStructure.data.datasets.push({ label: myLabel, data: [], backgroundColor: GetHSLColour(p_chartJSStructure.data.datasets.length, myTotalCount), stack: "Stack " + myRowData[i] });
                        }
                                                
                        if (p_chartJSStructure.data.datasets[myDatasetIndex].data.length == 0) {
                            // Loop over each item of data
                            for (var k = 0; k < p_dataPoints.length; k++) {
                                var myCallType = p_dataPoints[k].callType;

                                if (myCallType == myCallTypeValues[i]) {
                                    if (myBreakdownValues[i].length == 0) p_chartJSStructure.data.datasets[myDatasetIndex].data.push(p_dataPoints[k].y);
                                    else {
                                        var myCallTypeAndBreakdownValue = p_dataPoints[k].yAxisBreakdownValue;

                                        // N.B. This has to match myLabel pushed with the dataset creation above
                                        if (myCallTypeValues.length > 1) myCallTypeAndBreakdownValue = myCallType + " " + myCallTypeAndBreakdownValue;

                                        if (myCallTypeAndBreakdownValue == p_chartJSStructure.data.datasets[myDatasetIndex].label) p_chartJSStructure.data.datasets[myDatasetIndex].data.push(p_dataPoints[k].y);
                                    }
                                    
                                    if (singleDataset) {
                                        var myDatasetRef = p_chartJSStructure.data.datasets[myDatasetIndex];
                                        
                                        myDatasetRef.backgroundColor.push(GetHSLColour(myDatasetRef.backgroundColor.length, numberOfColoursToUse));
                                        myDatasetRef.hoverBackgroundColor.push(GetHSLColour(myDatasetRef.hoverBackgroundColor.length, numberOfColoursToUse, true));
                                    }
                                }
                            }

                            if (p_chartJSStructure.data.datasets[myDatasetIndex].data.length < p_chartJSStructure.data.labels.length) p_chartJSStructure.data.datasets[myDatasetIndex].data.push(0);
                        }
                        else {
                            // Loop over each item of data and llok for match in labels in case the x label is not an integer e.g. graphing by name
                            for (var j = 0; j < p_dataPoints.length; j++) {
                                // Replace y value using label value as the index if the callType value matches
                                //if (p_dataPoints[j].callType == myCallTypeValues[i]) p_chartJSStructure.data.datasets[i].data[parseInt(p_dataPoints[j].label)] = p_dataPoints[j].y;
                                if (p_dataPoints[j].callType == myCallTypeValues[i]) {
                                    var myIndex = -1;
                                    
                                    for (var k = 0; k < p_chartJSStructure.data.labels.length; k++) {
                                        if (p_dataPoints[j].label == p_chartJSStructure.data.labels[k]) {
                                            myIndex = k;
                                            break;
                                        }
                                    }

                                    if (myIndex >= 0) p_chartJSStructure.data.datasets[i].data[myIndex] = p_dataPoints[j].y;
                                }
                            }
                        }

                        myBreakdownIndex++;
                    }

                    //startingIndex = p_chartJSStructure.data.datasets.length;
                    startingIndex += datasetsToAdd;
                }

                //alert(JSON.stringify(p_chartJSStructure));
            }
        }
    }
    
    //alert(JSON.stringify(p_dataPoints));
    //alert(JSON.stringify(p_chartJSStructure.data));
}

function ConvertFromRawDataToChart3D(p_dataPoints, p_chartStructure) {
    p_chartStructure.data = [];

    if (p_dataPoints.length > 0) {
        if (p_dataPoints[0].yAxisBreakdownValue !== undefined) {
            var myBreakdownValues = [];

            for (var i = 0; i < p_dataPoints.length; i++) {
                var y = p_dataPoints[i].yAxisBreakdownValue;

                if (!myBreakdownValues.includes(y)) myBreakdownValues.push(y);
            }

            for (var i = 0; i < myBreakdownValues.length; i++) {
                var myLocalDataPoints = [];

                for (var j = 0; j < p_dataPoints.length; j++) {
                    if (p_dataPoints[j].yAxisBreakdownValue == myBreakdownValues[i]) myLocalDataPoints.push({ x: p_dataPoints[j].label, y: p_dataPoints[j].y });
                }

                p_chartStructure.data.push({ type: "", bevelEnabled: false, fillOpacity: 1, showInLegend: true, name: myBreakdownValues[i], color: GetHSLColour(i, myBreakdownValues.length), dataPoints: myLocalDataPoints });
            }
        }
        else {
            var myLocalDataPoints = [];

            for (var j = 0; j < p_dataPoints.length; j++) myLocalDataPoints.push({ x: p_dataPoints[j].label, y: p_dataPoints[j].y });

            p_chartStructure.data.push({ type: "", bevelEnabled: false, fillOpacity: 1, dataPoints: myLocalDataPoints });
        }
    }
}

function GetMaxGraphValue(p_dataPoints) {
    var result = 0;
    
    if (p_dataPoints.length > 0) {
        if (p_dataPoints[0].yAxisBreakdownValue === undefined) {
            for (var i = 0; i < p_dataPoints.length; i++) {
                if (p_dataPoints[i].y > result) result = p_dataPoints[i].y;
            }
        }
        else {
            // Create a list of unique labels present in the data
            var myLabels = [];

            for (var i = 0; i < p_dataPoints.length; i++) {
                var myLabel = p_dataPoints[i].label;

                if (!myLabels.includes(myLabel)) myLabels.push(myLabel);
            }

            if (p_dataPoints[0].callType === undefined) {
                for (var i = 0; i < myLabels.length; i++) {
                    var sumForThisLabel = 0;

                    for (var j = 0; j < p_dataPoints.length; j++) {
                        if (p_dataPoints[j].label == myLabels[i]) sumForThisLabel += p_dataPoints[j].y;
                    }

                    if (sumForThisLabel > result) result = sumForThisLabel;
                }
            }
            else {
                var myCallTypes = [];
                var myColumns = [];

                for (var i = 0; i < myRowData.length; i++) {
                    if (!myColumns.includes(myRowData[i])) myColumns.push(myRowData[i]);
                }
                
                for (var i = 0; i < p_dataPoints.length; i++) {
                    var myCallType = p_dataPoints[0].callType;

                    if (!myCallTypes.includes(myCallType)) myCallTypes.push(myCallType);
                }

                for (var i = 0; i < myLabels.length; i++) {
                    for (var j = 0; j < myColumns.length; j++) {
                        var sumForThisColumn = 0;
                        
                        for (var k = 0; k < p_dataPoints.length; k++) {
                            if (p_dataPoints[k].label == myLabels[i]) {
                                var myCallTypeIndex = -1;

                                for (var m = 0; m < myCallTypes.length; m++) {
                                    if (p_dataPoints[k].callType == myCallTypes[m]) {
                                        myCallTypeIndex = m;
                                        break;
                                    }
                                }

                                if (myCallTypeIndex >= 0) {
                                    if (myRowData[myCallTypeIndex] == myColumns[j]) sumForThisColumn += p_dataPoints[k].y;
                                }
                            }
                        }

                        if (sumForThisColumn > result) result = sumForThisColumn;
                    }
                }
            }
        }
    }

    return result;
}

function GetNumberOfPoints(p_dataPoints) {
    var result = p_dataPoints.length;

    if (p_dataPoints.length > 0) {
        if (p_dataPoints[0].yAxisBreakdownValue !== undefined) {
            // This works for the Designer with multiple stacked call types as well
            // Create a list of unique labels present in the data
            var myLabels = [];

            for (var i = 0; i < p_dataPoints.length; i++) {
                var myLabel = p_dataPoints[i].label;

                if (!myLabels.includes(myLabel)) myLabels.push(myLabel);
            }

            result = myLabels.length;
        }
    }
    
    return result;
}

function FormatDate(p) {
    var myDay = p.getDate().toString();
    var myMonth = (p.getMonth() + 1).toString();
    var myYear = p.getFullYear().toString();

    if (myDay.length == 1) myDay = "0" + myDay;
    if (myMonth.length == 1) myMonth = "0" + myMonth;

    return myDay + "/" + myMonth + "/" + myYear;
}

function GenerateDate(p_startDate, p_daysOffset) {
    return new Date(p_startDate.getTime() + (p_daysOffset * 86400000));
}

function GetDayOfWeekFromDate(p) {
    var myDate = new Date(p);
    var myIndex = myDate.getDay();
    var javascriptDaysOfWeekLookup = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return javascriptDaysOfWeekLookup[myIndex];
}

function ChartJS_GetDrillDownMonthAndYear(p_index) {
    var myYear = Math.floor((p_index + myStartDate.getMonth()) / 12) + myStartDate.getFullYear();
    
    return monthsLookup[(myStartDate.getMonth() + p_index) % 12] + " " + myYear;
}

function GetTotalForColumn(p_datasets, p_columnIndex) {
    var result = 0;

    for (var i = 0; i < p_datasets.length; i++) {
        result += p_datasets[i].data[p_columnIndex];
    }
    
    return result;
}

function TestFunction(a, b) {
    return "Test";
}
