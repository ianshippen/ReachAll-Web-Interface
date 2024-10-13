// Copyright Ian Shippen 2012
// Version 1.0
    var NUMBER_OF_HEADER_ROWS = 2;
    var NUMBER_OF_FOOTER_ROWS = 1;
    var DOWN_ARROW_TEXT = " &#x25BC;";
    var UP_ARROW_TEXT = " &#x25B2;";
    var DOWN_ARROW_CODE = 9660;
    var UP_ARROW_CODE = 9650;
   
    var lastColumnSorted = -1;

    function IdleCursor() {
    	document.body.style.cursor = "default";
    }
    
    function BusyCursor() {
    	document.body.style.cursor = 'wait';
    }

    function SortByColumn(p_index, p_table) {
        var reverseIt = false;

				// Are we repeating a click on the same column ?
        if (p_index == lastColumnSorted) {
        		// Yes
            var myIndex = -1;

            myText = document.getElementById(p_table).rows[1].cells[p_index].innerHTML;

            if (myText.charCodeAt(myText.length - 5) == DOWN_ARROW_CODE) myIndex = myText.length - 6;

            if (myIndex > 0) {
                myText = myText.substring(0, myIndex) + UP_ARROW_TEXT + "</a>";
                document.getElementById(p_table).rows[1].cells[p_index].innerHTML = myText;
            }

            reverseIt = true;
            lastColumnSorted = (-2) - p_index;
        }
        else {
        	  // No. Either first click, or click on different column, or repeat click on an Up Arrow
            // Do we need to erase an arrow ?
            // If nothing clicked so far, lastColumnSorted = -1
            // 
            if (lastColumnSorted < -1) lastColumnSorted = (-2) - lastColumnSorted;

            if (lastColumnSorted !== -1) RemoveAnyArrows(lastColumnSorted, p_table);
            
            // Down arrow needed
            var myText = document.getElementById(p_table).rows[1].cells[p_index].innerHTML;
            myText = myText.substring(0, myText.toLowerCase().indexOf("</a>")) + DOWN_ARROW_TEXT + "</a>";
            document.getElementById(p_table).rows[1].cells[p_index].innerHTML = myText;

            lastColumnSorted = p_index;
        }
        
    		setTimeout(function() {MySortByColumn(p_index, p_table, reverseIt);}, 500);
    }
    
    function MySortByColumn(p_index, p_table, p_reverseIt) {
        var myArray = new Array();
        var numberOfRows = document.getElementById(p_table).rows.length;
        var numberOfColumns, i, j;
        
        numberOfColumns = document.getElementById(p_table).rows[NUMBER_OF_HEADER_ROWS].cells.length;

        // Get the data to sort by
        for (i = NUMBER_OF_HEADER_ROWS; i < (numberOfRows - NUMBER_OF_FOOTER_ROWS); i++) {
            var myValue = RemoveAnyAnchors(document.getElementById(p_table).rows[i].cells[p_index].innerHTML);

            myArray[i - NUMBER_OF_HEADER_ROWS] = { key: i - NUMBER_OF_HEADER_ROWS, value: myValue };
        }

				// Determine what type of sort to perform
				if (IsColumnDayOfWeek(p_index, p_table)) {
					myArray.sort(function(a, b) {
                var aText = a.value.toLowerCase();
                var bText = b.value.toLowerCase();
                var result = 0;
                var aInt = MapDOWToInt(aText);
                var bInt = MapDOWToInt(bText);

                if (aInt < bInt) result = 1;
                if (aInt > bInt) result = -1;
                
                return result;
				})
			  }
        else if (IsColumnInteger(p_index, p_table)) {
            myArray.sort(function(a, b) {
                return a.value - b.value
            })
        }
        else {
            myArray.sort(function(a, b) {
                var aText = a.value.toLowerCase();
                var bText = b.value.toLowerCase();
                var result = 0;

                if (aText < bText) {
                    result = -1;
                }

                if (aText > bText) {
                    result = 1;
                }

                return result;
            })
        }

				if (p_reverseIt == true) myArray.reverse();
				
        for (i = 0; i < numberOfColumns; i++) {
            // Create copy of this column data
            var columnCopy = new Array;

            for (j = NUMBER_OF_HEADER_ROWS; j < (numberOfRows - NUMBER_OF_FOOTER_ROWS); j++) {
                columnCopy[j - NUMBER_OF_HEADER_ROWS] = document.getElementById(p_table).rows[j].cells[i].innerHTML;
            }

            for (j = NUMBER_OF_HEADER_ROWS; j < (numberOfRows - NUMBER_OF_FOOTER_ROWS); j++) {
                document.getElementById(p_table).rows[j].cells[i].innerHTML = columnCopy[myArray[j - NUMBER_OF_HEADER_ROWS].key];
            }
        }
    }

    function RemoveAnyArrows(p_index, p_table) {
        var myIndex = -1;
        var myText = document.getElementById(p_table).rows[1].cells[p_index].innerHTML;
        var myCode = myText.charCodeAt(myText.length - 5);
        
        if ((myCode == UP_ARROW_CODE) || (myCode == DOWN_ARROW_CODE)) myIndex = myText.length - 6;
        
        if (myIndex > 0) {
            myText = myText.substring(0, myIndex) + "</a>";
            document.getElementById(p_table).rows[1].cells[p_index].innerHTML = myText;
        }
    }

    function RemoveAnyAnchors(p) {
        var result = p;

        if (p.length >= 15) {
            if (p.toLowerCase().substring(0, 2) == "<a") {
                var myIndex = result.indexOf(">");

                if (myIndex >= 2) {
                    result = result.substring(myIndex + 1);
                }

                myIndex = result.toLowerCase().indexOf("</a>");

                if (myIndex >= 0) {
                    result = result.substring(0, myIndex);
                }
            }
        }

        return result;
    }

    function IsColumnInteger(p_index, p_table) {
        var result = true;

        for (i = NUMBER_OF_HEADER_ROWS; i < (document.getElementById(p_table).rows.length - NUMBER_OF_FOOTER_ROWS); i++) {
            if (IsInteger(RemoveAnyAnchors(document.getElementById(p_table).rows[i].cells[p_index].innerHTML)) == false) {
                result = false;
                break;
            }
        }

        return result;
    }
    
    function IsColumnDayOfWeek(p_index, p_table) {
    	var result = true;

        for (i = NUMBER_OF_HEADER_ROWS; i < (document.getElementById(p_table).rows.length - NUMBER_OF_FOOTER_ROWS); i++) {
            if (IsDayOfWeek(RemoveAnyAnchors(document.getElementById(p_table).rows[i].cells[p_index].innerHTML)) == false) {
                result = false;
                break;
            }
        }
        
        return result;
    }

    function Asc(p) {
        return p.charCodeAt(0);
    }

    function IsInteger(p) {
        var result = true;
        var startIndex = 0;
        var i;

        if (p.substring(0, 1) == "-") {
            startIndex = 1;
        }

        if (p.length > startIndex) {
            result = true;

            for (i = startIndex; i < p.length; i++) {
                if ((Asc(p.substring(i, i + 1)) < Asc("0")) || (Asc(p.substring(i, i + 1)) > Asc("9"))) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }
    
    function IsDayOfWeek(p) {
    	var result = false;

			if (MapDOWToInt(p) >= 0) result = true;
			
			return result;
		}
		
		function MapDOWToInt(p) {
			var result = -1;
			
    	switch (p.toLowerCase())
    	{
    		case "monday":
    			result = 0;
    			break;
    		
    		case "tuesday":
    			result = 1;
    			break;
    		
    		case "wednesday":
    			result = 2;
    			break;
    		
    		case "thursday":
    			result = 3;
    			break;
    		
    		case "friday":
    			result = 4;
    			break;
    		
    		case "saturday":
    			result = 5;
    			break;
    		
    		case "sunday":
    			result = 6;
    			break;
    	}
    	
    	return result;
    }