var xBorder = 10, yBorder = 10, use3D = true, myCanvas, canvasWidth = 1600, canvasHeight = 850, myContext, barWidth;
//var barColours = ["#cc0000", "#00aa00", "#2626cc"];
var barColours = [];
//var sideColours = ["#aa0000", "#008800", "#2020aa"];
var sideColours = [];
//var topColours = ["#ff0000", "#00cc00", "#3030ff"];
var topColours = [];
var topMargin = 10;
var yGap = 24;
var barHeight = yGap;
var barYGap = 5;
var textXGap = 4;
var _3dDepth = 7;
var _3dAngle = 45.0;
var _3dCos = _3dDepth * Math.cos(Math.PI * _3dAngle / 180.0);
var _3dSin = _3dDepth * Math.sin(Math.PI * _3dAngle / 180.0);
var calltypeHeadingFont = "bold 1.25em arial";
var dataHeadingFont = "bold 1em arial";
var maxBarPercentOfColumn = 90;
var postHeadingGap = 10;

function GetBarColours(p_callTypes) {
    for (var i = 1; i < p_callTypes.length; i++) {
        barColours.push(p_callTypes[i].BarColour);
        sideColours.push(p_callTypes[i].SideColour);
        topColours.push(p_callTypes[i].TopColour);
    }
}

function RemoveElements() {
    document.getElementById("actionTable").style = "display:none";
    document.getElementById("responseTable").style = "display:none";
    document.getElementById("myPanel").style = "display:none";
}

function ShowJSGraph() {
    //var myValue = "none";

    //if (p) myValue = "block";

    //document.getElementById("chartContainer").style.display = myValue;
}

function ExtractValue(p) {
    var result = 0;
    var myValue = p;
    
    if (p.indexOf(":") >= 0) {
        var myIndex = myValue.indexOf(":");
        
        // Get the hours value
        var myHours = parseInt(myValue.substring(0, myIndex));

        myValue = myValue.substring(myIndex + 1);

        var myMinutes = parseInt(myValue.substring(0, 2));
        var mySeconds = parseInt(myValue.substring(3));

        result = (60 * 60 * myHours) + (60 * myMinutes) + mySeconds;
    }
    else {
        result = parseInt(p);
    }

    return result;
}

function GetTextWidth(text, font) {
    myContext.font = font;

    var metrics = myContext.measureText(text);

    return metrics.width;
}

function SetCanvasSize(p_width, p_height) {
    myCanvas.width = p_width;
    myCanvas.height = p_height;
    canvasWidth = p_width;
    canvasHeight = p_height;
}

function ExtensionGraphLoad() {
    var obj = JSON.parse(myJsonData);
    var linearColumnIndex = 0;
    var yOffset = 10;
    var topMargin = 10;
    var textYOffset = 4;
    var columnWidths = [];
    var columnPositions = [];
    var totalWidth = 0;
    var widthFactor;
    var textColour = "black";
    var i, j;
    
    RemoveElements();

    myCanvas = document.getElementById("myCanvas");
    myContext = myCanvas.getContext("2d");
    GetBarColours(obj.ResultsData.CallTypes);

    // Set the canvas size
    var numberOfRows = obj.ResultsData.CallTypes[0].Columns[0].Rows.length;
    SetCanvasSize(GetWidth() - 30, postHeadingGap + yOffset + ((numberOfRows + 2) * yGap));
    SetScreenColour(obj.GlobalData.WebPageBackgroundColour);

    // Loop over each call type
    for (i = 0; i < obj.ResultsData.CallTypes.length; i++) {
        // Loop over each data column within this call type
        for (j = 0; j < obj.ResultsData.CallTypes[i].Columns.length; j++) {
            // Get the width of this data column heading
            var myWidth = GetTextWidth(obj.ResultsData.CallTypes[i].Columns[j].Heading, dataHeadingFont);

            // Loop over over each row of data for this data column
            for (var k = 0; k < obj.ResultsData.CallTypes[i].Columns[j].Rows.length; k++) {
                // Get the width of this data row
                var dataWidth = GetTextWidth(obj.ResultsData.CallTypes[i].Columns[j].Rows[k].Data);

                // If it is wider than myWidth, then set myWidth to this data row width
                if (dataWidth > myWidth) myWidth = dataWidth;
            }

            // Append myWidth to the columnWidths array
            columnWidths.push(myWidth);
        }
    }

    linearColumnIndex = 0;

    for (i = 0; i < obj.ResultsData.CallTypes.length; i++) {
        var myWidth = GetTextWidth(obj.ResultsData.CallTypes[i].Heading, calltypeHeadingFont);
        var sumOfWidths = 0;
        var startingLinearIndex = linearColumnIndex;
        
        // Compare to the sum of the data columns for this call type
        for (j = 0; j < obj.ResultsData.CallTypes[i].Columns.length; j++) {
            sumOfWidths += columnWidths[linearColumnIndex];
            linearColumnIndex++;
        }

        if (myWidth > sumOfWidths) {
            for (var j = startingLinearIndex; j < linearColumnIndex; j++) {
                columnWidths[j] = Math.floor(myWidth / (linearColumnIndex - startingLinearIndex));
            }
        }
    }

    for (i = 0; i < columnWidths.length; i++) totalWidth += columnWidths[i];

    widthFactor = canvasWidth / totalWidth;
    
    // Location of first column
    columnPositions.push(0);

    for (var i = 0; i < columnWidths.length; i++) {
        var totalSoFar = 0;

        for (var j = 0; j <= i; j++) totalSoFar += columnWidths[j];

        columnPositions.push(totalSoFar * widthFactor);
    }

    linearColumnIndex = 0;

    // Draw the data for each calltype
    for (var i = 0; i < obj.ResultsData.CallTypes.length; i++) {
        var myHeading = obj.ResultsData.CallTypes[i].Heading;

        // Draw the call type heading text
        DrawText(myHeading, columnPositions[linearColumnIndex], topMargin + textYOffset, textColour, calltypeHeadingFont, '');

        // Draw the data for each data column
        for (var j = 0; j < obj.ResultsData.CallTypes[i].Columns.length; j++) {
            var maxValue = 0;
            var numberOfRows = obj.ResultsData.CallTypes[i].Columns[j].Rows.length;
            
            myHeading = obj.ResultsData.CallTypes[i].Columns[j].Heading;

            // Draw the data column heading text
            DrawText(myHeading, columnPositions[linearColumnIndex], topMargin + textYOffset + yGap, textColour, dataHeadingFont, '');

            for (var k = 0; k < numberOfRows; k++) {
                var myValue = ExtractValue(obj.ResultsData.CallTypes[i].Columns[j].Rows[k].Data);

                if (myValue > maxValue) maxValue = myValue;
            }

            // Loop over each row
            for (var k = numberOfRows - 1; k >= 0; k--) {
                var myData = obj.ResultsData.CallTypes[i].Columns[j].Rows[k].Data;
                var myValue = ExtractValue(myData);
                var columnWidth = columnWidths[linearColumnIndex] * widthFactor;
                var maxBarWidth = Math.floor(columnWidth * maxBarPercentOfColumn / 100);
                //var maxBarWidth = 100;
                
                if (i > 0) {
                    DrawHorizontalBar(columnPositions[linearColumnIndex], k, myValue, maxValue, maxBarWidth, ((i - 1) % barColours.length));
                    DrawText(myData, columnPositions[linearColumnIndex], postHeadingGap + yOffset + ((k + 2) * yGap), textColour, '1em arial', '');
                }
                else {
                    DrawText(myData, columnPositions[linearColumnIndex], postHeadingGap + topMargin + textYOffset + (yGap * (k + 2)), textColour, '1em arial', '');
                }
            }
            
            linearColumnIndex += 1;
        }
    }
}

function DrawHorizontalBar(p_x, p_rowIndex, p_value, p_maxValue, p_fullSize, p_colourIndex) {
    var myWidth = Math.floor((p_value / p_maxValue) * p_fullSize);
    var x = p_x + myWidth;
    var y = postHeadingGap + topMargin + yGap * (3 + p_rowIndex) - barYGap - barHeight;

    myContext.fillStyle = barColours[p_colourIndex];
    myContext.fillRect(p_x, y, myWidth, barHeight);

    if (use3D) {
        if (p_value > 0) {
            myContext.beginPath();
            myContext.strokeStyle = sideColours[p_colourIndex];
            myContext.moveTo(x, y);
            myContext.lineTo(x + _3dSin, y - _3dCos);
            myContext.lineTo(x + _3dSin, y + barHeight - _3dCos);
            myContext.lineTo(x, y + barHeight);
            myContext.stroke();
            myContext.closePath();
            myContext.fillStyle = sideColours[p_colourIndex];
            myContext.fill();

            myContext.beginPath();
            myContext.strokeStyle = topColours[p_colourIndex];
            myContext.moveTo(x, y);
            myContext.lineTo(x + _3dSin, y - _3dCos);
            myContext.lineTo(p_x + _3dSin, y - _3dCos);
            myContext.lineTo(p_x, y);
            myContext.stroke();
            myContext.closePath();
            myContext.fillStyle = topColours[p_colourIndex];
            myContext.fill();
        }
    }
}

function GraphPageLoad() {
    var samplesPerLine = 24;
    var barsPerSample = 4;
    var barsPerLine = samplesPerLine * barsPerSample;
    var barHeight = 20;
    var yOffset = 200;
    var yGap = 200;
    var obj = JSON.parse(myJsonData);
    var numberOfLines = 4;
    var usableWidth;
    var maxValue = 0;
    var yAxisHeight = 160;
    var linearColumnIndex = 0;
    var myKeys = [];
        
    RemoveElements();
    
    xBorder = 20;
    barWidth = Math.floor(GetAvailableWidth() / barsPerLine);
    usableWidth = barsPerLine * barWidth;
    //myCanvas.style.display = "none";
    myCanvas = document.getElementById("myCanvas");
    myContext = myCanvas.getContext("2d");
    ClearScreen();
    GetBarColours(obj.ResultsData.CallTypes);
    
    // Determine the maximum value
    for (var i = 1; i < obj.ResultsData.CallTypes.length; i++) {
        for (var j = 0; j < obj.ResultsData.CallTypes[i].Columns.length; j++) {
            for (var k = 0; k < obj.ResultsData.CallTypes[i].Columns[j].Rows.length; k++) {
                var myValue = parseInt(obj.ResultsData.CallTypes[i].Columns[j].Rows[k].Data);

                if (myValue > maxValue) {
                    maxValue = myValue;
                }
            }
        }
    }

    barHeight = Math.floor(yAxisHeight / maxValue);
    
    // Draw X axes
    for (var i = 0; i < numberOfLines; i++) {
        var y = yOffset + (yGap * i) + 0.5;

        myContext.beginPath();
        myContext.strokeStyle = 'white';
        myContext.moveTo(xBorder, y);
        myContext.lineTo(xBorder + usableWidth, y);
        myContext.closePath();
        myContext.stroke();
    }

    // Draw Y axes
    for (var i = 0; i < numberOfLines; i++) {
        var x = xBorder - 0.5;
        var y = yOffset + (yGap * i) + 1;

        myContext.beginPath();
        myContext.strokeStyle = 'white';
        myContext.moveTo(x, y);
        myContext.lineTo(x, y - yAxisHeight);
        myContext.closePath();
        myContext.stroke();
    }

    // Add tags for Y axes
    var yStep = CalculateYStep(yAxisHeight, maxValue, 16);
    var numberOfSteps = Math.floor(yAxisHeight / yStep);
    var myStep = Math.floor(yAxisHeight / maxValue);
    var multiplier = Math.floor(yStep / myStep);
    
    for (var i = 0; i < numberOfLines; i++) {
        for (var j = 0; j <= numberOfSteps; j++) {
            var x1 = xBorder - 1;
            var x2 = x1 - 3;
            var y = yOffset - (j * yStep) + 0.5 + (yGap * i);

            myContext.beginPath();
            myContext.strokeStyle = 'white';
            myContext.moveTo(x1, y);
            myContext.lineTo(x2, y);
            myContext.closePath();
            myContext.stroke();

            if (j < 0) {
                myContext.beginPath();
                myContext.strokeStyle = '#444444';
                myContext.moveTo(x1 + 1, y);
                myContext.lineTo(xBorder + usableWidth, y);
                myContext.closePath();
                myContext.stroke();
            }

            var myValue = j * multiplier;

            if (myValue >= 10) x2 -= 7;

            DrawText(myValue, x2 - 8, y, "white", "0.75em arial", "");
        }
    }

    // Add tags for each hour
    for (var i = 0; i < numberOfLines; i++) {
        for (var j = 0; j < barsPerLine; j++) {
            var x = xBorder + (j * barWidth) + 0.5;
            var y0 = yOffset + (yGap * i);
            var y1 = y0 + 5;

            if (j == 0) x--;

            if ((j % barsPerSample) == 0) {
                var myText = "";
                var myHour = Math.floor(j / 16) + (i * 6);
                var myMinute = ((j % 16) / 4) * 15;

               // if ((j % 16) == 0) y1 = y0 + 10;

                myContext.beginPath();
                myContext.strokeStyle = 'white';
                myContext.moveTo(x, y0);
                myContext.lineTo(x, y1);
                myContext.closePath();
                myContext.stroke();

                if (myHour < 10) myText = "0";

                myText += myHour + ":";

                if (myMinute < 10) myText += "0";

                myText += myMinute;

                DrawText(myText, x, y0 + 15, "white", "0.75em arial", "");
            }
        }
    }

    // Loop over each call type of real results data
    for (i = 1; i < obj.ResultsData.CallTypes.length; i++) {
        // Loop over each column
        for (var j = 0; j < obj.ResultsData.CallTypes[i].Columns.length; j++) {
            // Loop over each row of data
            for (var k = 0; k < obj.ResultsData.CallTypes[i].Columns[j].Rows.length; k++) {
                var myValue = parseInt(obj.ResultsData.CallTypes[i].Columns[j].Rows[k].Data);
                var myBar = ((k * 4) + i - 1);
                var barOffset = myBar % barsPerLine;
                var lineOffset = Math.floor(myBar / barsPerLine);
                var myLabel = "";

                if (myValue > 0) myLabel = myValue.toString();
                
                DrawBar(xBorder + (barWidth * barOffset), yOffset + (yGap * lineOffset), myValue * barHeight, myBar % 4, myLabel);
            }

            linearColumnIndex++;
        }
    }

    // Draw key
    for (var i = 0; i < obj.ResultsData.CallTypes.length; i++) {
        var x = xBorder + (i * 200);
        var y = 10 + barWidth;

        myKeys.push(obj.ResultsData.CallTypes[i + 1].Heading);
        
        DrawBar(x, y, barWidth, i, "");
        DrawText(myKeys[i], x + barWidth + 14, y - 10, "white", "arial", "");
    }
}

function DrawBar(p_x, p_y, p_height, p_colourIndex, p_text) {
    var x = p_x;
    var y = p_y - p_height;

    myContext.fillStyle = barColours[p_colourIndex];
    myContext.fillRect(p_x, y, barWidth, p_height);

    if (use3D) {
        if (p_height > 0) {
            myContext.beginPath();
            myContext.strokeStyle = sideColours[p_colourIndex];
            myContext.moveTo(x + barWidth, y);
            myContext.lineTo(x + (barWidth * 1.5), y - (barWidth / 2));
            myContext.lineTo(x + (barWidth * 1.5), y - (barWidth / 2) + p_height);
            myContext.lineTo(x + barWidth, y + p_height);
            myContext.stroke();
            myContext.closePath();
            myContext.fillStyle = sideColours[p_colourIndex];
            myContext.fill();

            myContext.beginPath();
            myContext.strokeStyle = topColours[p_colourIndex];
            myContext.moveTo(x + barWidth, y);
            myContext.lineTo(x + (barWidth * 1.5), y - (barWidth / 2));
            myContext.lineTo(x + (barWidth * 0.5), y - (barWidth / 2));
            myContext.lineTo(x, y);
            myContext.stroke();
            myContext.closePath();
            myContext.fillStyle = topColours[p_colourIndex];
            myContext.fill();
        }
    }

    if (p_text.length > 0) {
        if (p_text == "1") p_x++;
        
        DrawText(p_text, p_x + 7, y + 2, 'white', '0.75em arial', 'center');
    }
}

function CalculateYStep(p_yAxisHeight, p_maxValue, p_minStep) {
    var myStep = Math.floor(p_yAxisHeight / p_maxValue);

    if (myStep < p_minStep) {
        myStep *= 2;
    }
    
    return myStep;
}

function GetAvailableWidth() {
    return canvasWidth - (2 * xBorder);
}

function GetXCentre() {
    return Math.floor(canvasWidth / 2);
}

function ClearScreen() {
    myContext.fillStyle = 'black';
    myContext.fillRect(0, 0, canvasWidth, canvasHeight);
}

function SetScreenColour(p_colour) {
    myContext.fillStyle = p_colour;
    myContext.fillRect(0, 0, canvasWidth, canvasHeight);
}

function HTMLDecode(p) {
    var x = p.replace(/&amp;/g, "&");

    x = x.replace(/&lt;/g, "<");
    x = x.replace(/&gt;/g, ">");
    x = x.replace(/&quot;/g, '"');

    return x;
}

function IsFirefox() {
    var result = false;

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) result = true;

    return result;
}

function DegreesToRadians(p_degrees) {
    return p_degrees * Math.PI / 180;
}

function DrawText(p_text, p_x, p_y, p_colour, p_font, p_xAlign) {
    var myXAlignment = p_xAlign;

    if (myXAlignment == "") myXAlignment = "left";
    
    myContext.fillStyle = p_colour;
    myContext.font = p_font;
    myContext.textAlign = myXAlignment;
    myContext.textBaseline = 'top';

    myContext.fillText(p_text, p_x, p_y);
}

function GetWidth() {
    if (self.innerWidth) {
        return self.innerWidth;
    }

    if (document.documentElement && document.documentElement.clientWidth) {
        return document.documentElement.clientWidth;
    }

    if (document.body) {
        return document.body.clientWidth;
    }
}

function GetHeight() {
    if (self.innerHeight) {
        return self.innerHeight;
    }

    if (document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }

    if (document.body) {
        return document.body.clientHeight;
    }
}

function GraphJSTest() {
	var chart = new CanvasJS.Chart("chartContainer",
	{
		animationEnabled: true,
		theme: "theme2",
		//exportEnabled: true,
		title:{
			text: "Simple Column Chart"
		},
		data: [
		{
			type: "column", //change type to bar, line, area, pie, etc
			dataPoints: [
				{ x: 10, y: 71 },
				{ x: 20, y: 55 },
				{ x: 30, y: 50 },
				{ x: 40, y: 65 },
				{ x: 50, y: 95 },
				{ x: 60, y: 68 },
				{ x: 70, y: 28 },
				{ x: 80, y: 34 },
				{ x: 90, y: 14 }
			]
		}
		]
	});

	chart.render();
}
