Module FormatHTMLModule
    Public Function FormatHTML(ByRef p_nameValuePairList As NameValuePairList) As String
        Dim s As String = ""
        Dim reportType As String = p_nameValuePairList.GetValueForName("ReportType")
        Dim reportIndex As Integer = GetReportIndexFromName(reportType)

        If reportIndex >= 0 Then
            Dim myTitle As String = p_nameValuePairList.GetValueForName("ReportTitle")
            Dim myStartDateAndTime, myEndDateAndTime As New DateAndTimeClass
            Dim myKeyList As New List(Of String)
            Dim embedded As Boolean = p_nameValuePairList.NameValueMatch("Embed", "True")
            Dim formatIndex As Integer = 0

            formatIndex = 2
            PopulateStartAndEndTimes(p_nameValuePairList, myStartDateAndTime, myEndDateAndTime)
            PopulateKeyList(p_nameValuePairList, myKeyList)

            ' Add HTML header if not embedded i.e. standalone file
            If Not embedded Then s = GenerateReportHTMLHeader(myTitle)

            ' Add report header info
            AddLine(s, GenerateReportHeader(myTitle, myStartDateAndTime, myEndDateAndTime, myKeyList, reportType))

            With reportList.reports(reportIndex)
                Dim myHeadingStyles() As String = {GenerateStyleString(webColourArray(WebColours.WebColours.HeadingBackGround).value, webColourArray(WebColours.WebColours.HeadingForeGround).value), GenerateStyleString(webColourArray(WebColours.WebColours.altHeadingBackGround).value, webColourArray(WebColours.WebColours.HeadingForeGround).value)}
                Dim backgroundStyles() As String = {GenerateStyleString(webColourArray(WebColours.WebColours.EvenLine).value), GenerateStyleString(webColourArray(WebColours.WebColours.OddLine).value), GenerateStyleString(webColourArray(WebColours.WebColours.altEvenLine).value), GenerateStyleString(webColourArray(WebColours.WebColours.altOddLine).value)}
                Dim myFilename As String = p_nameValuePairList.GetValueForName("Filename")
                Dim myDrilldownFilename As String = GetDDFilename(myFilename)
                Dim refAction As RefType = RefType.NONE
                Dim rowIndex As Integer = 0

                If p_nameValuePairList.NameValueMatch("ProduceDrillDownRef", "True") Then
                    If myFilename.Length > 0 Then
                        refAction = RefType.FILE
                    Else
                        refAction = RefType.WEB
                    End If
                End If

                If myDrilldownFilename.Contains("\") Then myDrilldownFilename = myDrilldownFilename.Substring(myDrilldownFilename.LastIndexOf("\") + 1)

                ' Render each data row, may change this later
                If resultsArray.GetRows = -1 Then
                    AddLine(s, "<tr><td>No data to display - check permissions and error logs</td></tr>")
                Else
                    Dim extractingResults As Boolean = True

                    ' Loop over each row including the summary row, hence missing -1 on count
                    'For i = 0 To resultsArray.GetRows
                    While extractingResults
                        Dim myTable As New HTMLTableClass
                        Dim linearColumnIndex As Integer = 0

                        If formatIndex > 0 Then
                            Dim localHeading As String = "<H2>"

                            For i = 0 To formatIndex - 1
                                If i > 0 Then localHeading &= "."

                                localHeading &= "[" & resultsArray.GetValue(rowIndex, i) & "]"
                            Next

                            localHeading &= "</H2>"
                            AddLine(s, localHeading)
                        End If

                        ' Setup table
                        myTable.SetTableId("myTable")
                        myTable.SetRowHeadingStyle(myHeadingStyles(0))

                        ' Start table
                        AddLine(s, myTable.RenderTableHeader)

                        ' Render first header row (Call Types)
                        AddLine(s, myTable.RenderRowHeader(HTMLTableClass.AlignType.CENTRE_ALIGN))

                        For i = 0 To .callTypes.Count - 1
                            Dim hSpan As Integer = .callTypes(i).CountVisibleColumns()
                            Dim myHeading As String = .callTypes(i).heading
                            Dim myAlignment As HTMLTableClass.AlignType = HTMLTableClass.AlignType.DEFAULT_ALIGN

                            If myHeading = "" Then myHeading = .verticalHeading

                            ' Is this Call Type for a Key ?
                            If i < .FirstNonKeyCallTypeIndex Then
                                hSpan = .callTypes(i).CountVisibleColumns(formatIndex)

                                ' If there is just one key column visible within the Key Call Type then align it to the left
                                If .callTypes(i).CountVisibleColumns(formatIndex) < 2 Then myAlignment = HTMLTableClass.AlignType.LEFT_ALIGN
                            End If

                            AddLine(s, myTable.RenderHeading(myHeading, myAlignment, hSpan))
                        Next

                        AddLine(s, myTable.RenderRowFooter)

                        ' Render second header row (Data Columns)
                        AddLine(s, myTable.RenderRowHeader(HTMLTableClass.AlignType.CENTRE_ALIGN))

                        For i = 0 To .callTypes.Count - 1
                            For j = 0 To .callTypes(i).columns.Count - 1
                                If linearColumnIndex >= formatIndex Then
                                    If .callTypes(i).columns(j).visible Then
                                        Dim myHeading As String = .callTypes(i).columns(j).heading
                                        Dim myAlignment As HTMLTableClass.AlignType = HTMLTableClass.AlignType.DEFAULT_ALIGN

                                        If Not .aggregateOnly Then myHeading = JSBuildSortLink(myHeading, linearColumnIndex, "myTable")
                                        If i < .FirstNonKeyCallTypeIndex Then myAlignment = HTMLTableClass.AlignType.LEFT_ALIGN

                                        AddLine(s, myTable.RenderHeading(myHeading, myAlignment))
                                    End If
                                End If

                                linearColumnIndex += 1
                            Next
                        Next

                        AddLine(s, myTable.RenderRowFooter)

                        Dim myTableIndex As Integer = 0
                        Dim writingToTable As Boolean = True

                        While writingToTable
                            Dim summaryRow As Boolean = False
                            Dim myRow As String = "<tr align=center "

                            If rowIndex = resultsArray.GetRows Then summaryRow = True

                            If summaryRow Then
                                myRow &= GenerateStyleString(webColourArray(WebColours.WebColours.SummaryBackGround).value, webColourArray(WebColours.WebColours.HeadingForeGround).value, "bold")
                            Else
                                myRow &= backgroundStyles(myTableIndex Mod 2)
                            End If

                            myRow &= ">"

                            ' Loop over each call type on this row
                            For j = 0 To .callTypes.Count - 1
                                Dim callTypeRefAction As RefType = refAction

                                If Not callTypeRefAction = RefType.NONE Then
                                    ' Globally we are supplying references, does this call type have any drill down columns defined ?
                                    If .callTypes(j).drillDownColumns.Count = 0 Then callTypeRefAction = RefType.NONE

                                    ' If this is Call Type 0 and we have no drill down columns specified then link to the entire name if any other drill down data in the row. Only do this for FILE Ref Type
                                    If j = 0 And callTypeRefAction = RefType.NONE And summaryRow = False And refAction = RefType.FILE Then
                                        For k = 1 To .callTypes.Count - 1
                                            If .callTypes(k).drillDownColumns.Count > 0 Then
                                                For m = 0 To .callTypes(k).columns.Count - 1
                                                    Dim displayedData As String = resultsArray.GetValue(rowIndex, .GetLinearIndex(k, m))

                                                    If displayedData <> "0" And displayedData <> "" Then callTypeRefAction = refAction
                                                Next
                                            End If
                                        Next
                                    End If
                                End If

                                ' Loop over each data column for this Call Type
                                For k = 0 To .callTypes(j).columns.Count - 1
                                    If .GetLinearIndex(j, k) >= formatIndex Then
                                        If .callTypes(j).columns(k).visible Then
                                            Dim displayedData As String = resultsArray.GetValue(rowIndex, .GetLinearIndex(j, k))
                                            Dim columnRefAction As RefType = callTypeRefAction

                                            If Not columnRefAction = RefType.NONE Then
                                                If displayedData = "0" Or displayedData = "" Then columnRefAction = RefType.NONE

                                                If summaryRow And columnRefAction = RefType.FILE Then columnRefAction = RefType.NONE
                                            End If

                                            If displayedData = "" Then displayedData = "--"

                                            Select Case columnRefAction
                                                Case RefType.FILE
                                                    Dim x As New HTMLTableClass
                                                    Dim myRef As String = resultsArray.GetReference(rowIndex, .GetLinearIndex(j, k))

                                                    displayedData = x.BuildRef(myDrilldownFilename & "#" & System.Web.HttpUtility.UrlEncode(myRef), displayedData)

                                                Case RefType.WEB
                                                    Dim x As New HTMLTableClass
                                                    Dim y As String = ""
                                                    Dim myNameValuePairList As New NameValuePairList

                                                    myNameValuePairList.CopyFrom(p_nameValuePairList)
                                                    myNameValuePairList.RemoveElements("ProduceDrillDownRef", "TopLevelReport")
                                                    myNameValuePairList.SetValueForName("DrillDownReport", "True")
                                                    myNameValuePairList.SetValueForName("CallTypeName", .callTypes(j).name)

                                                    If Not summaryRow Then
                                                        Dim localReportKeyAspects As New ReportKeysClass("")
                                                        Dim foundIt As Boolean = False

                                                        ' Loop over the call type 0 columns, if call type 0 is actually a Key
                                                        If .ContainsKey Then
                                                            For m = 0 To .callTypes(0).columns.Count - 1
                                                                Dim myValue As String = resultsArray.GetValue(rowIndex, m)
                                                                Dim myKeyType As ReportKeyAspectClass.ReportingKeyType = localReportKeyAspects.GetTypeFromTextType(.callTypes(0).columns(m).data.GetKeyData)

                                                                If Not myValue = "" Then
                                                                    myNameValuePairList.SetValueForName("Key." & .callTypes(0).columns(m).name, resultsArray.GetValue(rowIndex, m))

                                                                    If myKeyType = ReportKeyAspectClass.ReportingKeyType.NAME Then foundIt = True
                                                                End If
                                                            Next
                                                        End If

                                                        If foundIt Then
                                                            ' Replace key list with actual key for this row
                                                            myNameValuePairList.RemoveElement("KeyList")
                                                        End If
                                                    End If

                                                    displayedData = x.BuildRef(ReportGeneratorCommon.DEFAULT_DD_LOCALFILENAME & System.Web.HttpUtility.UrlEncode(myNameValuePairList.AsString), displayedData)
                                            End Select

                                            myRow &= "<td"

                                            ' Keep all the Key columns aligned to the left
                                            If j < .FirstNonKeyCallTypeIndex Then
                                                myRow &= " align=left"

                                                If summaryRow And .aggregateOnly Then displayedData = "&Sigma;"
                                            End If

                                            If Not summaryRow Then
                                                If j Mod 2 = 1 Then myRow &= " " & backgroundStyles(2 + (myTableIndex Mod 2))
                                            End If

                                            myRow &= ">" & displayedData & "</td>"
                                        End If ' If visible
                                    End If
                                Next ' k
                            Next ' j

                            AddLine(myRow, "</tr>")
                            s &= myRow

                            ' Check for delta with next row
                            If rowIndex < resultsArray.GetRows Then
                                Dim foundDelta As Boolean = False

                                For i = 0 To formatIndex - 1
                                    If Not resultsArray.GetValue(rowIndex, i) = resultsArray.GetValue(rowIndex + 1, i) Then
                                        foundDelta = True
                                        Exit For
                                    End If
                                Next

                                If foundDelta Then
                                    writingToTable = False
                                Else
                                    myTableIndex += 1
                                End If

                                rowIndex += 1
                            Else
                                ' All rows extracted
                                writingToTable = False
                                extractingResults = False
                            End If
                        End While

                        AddLine(s, myTable.RenderTableFooter())
                    End While
                End If

                If Not embedded Then s &= GenerateReportHTMLFooter()
            End With
        End If

        Return s
    End Function

    Private Function JSBuildSortLink(ByRef p_heading As String, ByVal p_columnIndex As Integer, ByRef p_tableName As String) As String
        Return "<a href=" & WrapInQuotes("javascript:void(0)") & " onclick=" & WrapInQuotes("SortByColumn(" & p_columnIndex & ", '" & p_tableName & "');") & ">" & p_heading & "</a>"
    End Function

    Private Function BuildSortLink(ByRef p_heading As String, ByRef p_nameValuePairList As NameValuePairList, ByRef p_callTypeName As String, ByRef p_columnName As String, ByVal p_buildSortLink As Boolean, ByRef p_orderByCallType As String, ByRef p_orderByColumn As String, ByRef p_descending As Boolean) As String
        Dim result As String = p_heading

        If p_buildSortLink Then
            Dim commandString As String = p_nameValuePairList.AsString
            Dim myDescString As String = ""

            If p_callTypeName = p_orderByCallType Then
                If p_columnName.Length > 0 Then
                    If p_columnName = p_orderByColumn Then
                        If Not p_descending Then myDescString = " DESC"
                    End If
                End If
            End If

            commandString &= "&SortBy=" & p_callTypeName & "." & p_columnName & myDescString
            result = "<a href=" & WrapInQuotes(ReportGeneratorCommon.DEFAULT_DD_LOCALFILENAME & System.Web.HttpUtility.UrlEncode(commandString)) & ">" & p_heading & "</a>"
        End If

        Return result
    End Function

    Public Sub FormatHTMLDrillDown(ByRef p_nameValuePairList As NameValuePairList, ByRef p_stringBuilder As StringBuilder)
        Dim reportType As String = p_nameValuePairList.GetValueForName("ReportType")
        Dim reportIndex As Integer = GetReportIndexFromName(reportType)

        If reportIndex >= 0 Then
            With reportList.reports(reportIndex)
                ' Look for the call type by name and get its index
                Dim myCallType As String = p_nameValuePairList.GetValueForName("CallTypeName")
                Dim callTypeIndex As Integer = .GetCallTypeIndexFromName(myCallType)

                If callTypeIndex >= 0 Then
                    If .callTypes(callTypeIndex).drillDownColumns.Count > 0 Then
                        Dim dataHeight As Integer
                        Dim myTableHeading As String = .callTypes(callTypeIndex).heading
                        Dim embedded As Boolean = p_nameValuePairList.NameValueMatch("Embed", "True")
                        Dim displayedKey As String = GenerateDisplayedKey(p_nameValuePairList.GetValueForName("Key.Number"))
                        Dim sortable As Boolean = p_nameValuePairList.NameValueMatch("Sortable", "True")
                        Dim passedTableId As String = p_nameValuePairList.GetValueForName("TableId")
                        Dim myTableId As String = "drillDownTable"
                        Dim drillDownTableIndexAsString As String = p_nameValuePairList.GetValueForName("DrillDownTableIndex")
                        Dim drillDownTableRef As ResultsArrayClass = Nothing
                        Dim drillDownTableIndex As Integer = -1
                        Dim myHeadingStyles() As String = {GenerateStyleString(webColourArray(WebColours.WebColours.HeadingBackGround).value, webColourArray(WebColours.WebColours.HeadingForeGround).value), GenerateStyleString(webColourArray(WebColours.WebColours.altHeadingBackGround).value, webColourArray(WebColours.WebColours.HeadingForeGround).value)}
                        Dim backgroundStyles() As String = {GenerateStyleString(webColourArray(WebColours.WebColours.EvenLine).value), GenerateStyleString(webColourArray(WebColours.WebColours.OddLine).value), GenerateStyleString(webColourArray(WebColours.WebColours.altEvenLine).value), GenerateStyleString(webColourArray(WebColours.WebColours.altOddLine).value)}

                        If IsInteger(drillDownTableIndexAsString) Then drillDownTableIndex = CInt(drillDownTableIndexAsString)

                        If drillDownTableIndex >= 0 Then
                            drillDownTableRef = arrayOfDrillDownResultsArray(CInt(drillDownTableIndex))
                        Else
                            drillDownTableRef = drillDownResultsArray
                        End If

                        dataHeight = drillDownTableRef.GetRows + 1

                        If Not passedTableId = "" Then myTableId = passedTableId

                        If displayedKey.Length > 0 Then myTableHeading &= " for " & displayedKey

                        If Not embedded Then p_stringBuilder.AppendLine(GenerateReportHTMLHeader())

                        p_stringBuilder.AppendLine("<table width=100% border=0 cellspacing=0 id=" & WrapInQuotes(myTableId) & ">")

                        ' Start first header row
                        p_stringBuilder.AppendLine("<tr align=center " & myHeadingStyles(0) & "><th colspan=" & .callTypes(callTypeIndex).drillDownColumns.Count & ">" & myTableHeading & "</th></tr>")

                        ' Start second header row
                        p_stringBuilder.AppendLine("<tr align=center " & myHeadingStyles(0) & ">")

                        For i = 0 To .callTypes(callTypeIndex).drillDownColumns.Count - 1
                            Dim myHeading As String = .callTypes(callTypeIndex).drillDownColumns(i).heading
                            Dim x As String = "<th"

                            If i = 0 Then x &= " align=left"

                            p_stringBuilder.AppendLine(x & ">" & JSBuildSortLink(myHeading, i, myTableId) & "</th>")
                        Next

                        p_stringBuilder.AppendLine("</tr>")

                        ' Do each data row
                        For i = 0 To dataHeight - 1
                            Dim summaryRow As Boolean = False
                            Dim myRow As String = "<tr align=center "

                            If i = (dataHeight - 1) Then summaryRow = True

                            If summaryRow Then
                                myRow &= GenerateStyleString(webColourArray(WebColours.WebColours.SummaryBackGround).value, webColourArray(WebColours.WebColours.HeadingForeGround).value, "bold")
                            Else
                                myRow &= backgroundStyles(i Mod 2)
                            End If

                            myRow &= ">"

                            For j = 0 To .callTypes(callTypeIndex).drillDownColumns.Count - 1
                                Dim displayedData As String = drillDownTableRef.GetValue(i, j)
                                Dim myCell As String = ""

                                If displayedData = "" Then displayedData = "--"

                                myCell = "<td"

                                If j = 0 Then myCell &= " align=left"

                                If j Mod 2 = 1 And Not summaryRow Then myCell &= " " & backgroundStyles(2 + (i Mod 2))

                                myCell &= ">"

                                If (Not summaryRow) And (StrComp(.callTypes(callTypeIndex).drillDownColumns(j).data.GetSQLData, "callid", CompareMethod.Text) = 0) And (GetCallRecordingGuiUrl().Length > 0) Then
                                    myCell &= "<a href=" & WrapInQuotes(GetCallRecordingGuiUrl() & "?" & displayedData) & ">" & displayedData & "</a>"
                                Else
                                    myCell &= displayedData
                                End If

                                myCell &= "</td>"
                                myRow &= myCell
                            Next

                            AddLine(myRow, "</tr>")
                            p_stringBuilder.Append(myRow)
                        Next

                        p_stringBuilder.AppendLine("</table>")

                        If Not embedded Then p_stringBuilder.AppendLine(GenerateReportHTMLFooter)
                    End If
                End If
            End With
        End If
    End Sub
End Module
