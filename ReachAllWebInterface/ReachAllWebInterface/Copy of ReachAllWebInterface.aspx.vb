Imports System, System.Data, System.Diagnostics, System.IO, System.Xml, System.Drawing
' Legacy version
Partial Public Class _Default
    Inherits System.Web.UI.Page

    Const LINK_TEXT As String = "linkText"
    Const DRILL_DOWN_TARGET_TEXT As String = "drillDownTargetText"
    Const REPORT_SELECTOR_TEXT As String = "reportSelectorText"
    Const CSS_BACKGROUND_COLOUR_STRING As String = "background-color"
    Const TABLE_BACKGROUND_COLOUR As String = "#256BB1"
    Const BACKGROUND_COLOUR_STRING As String = "bgcolor"
    'Const BACKGROUND_COLOUR As String = "#f0f0f0"
    Const APPLICATION_NAME As String = "ReachAll Viewer.exe"
    Const NEW_LOGIN As Boolean = False

    Dim timeSpans() As String = {"This Hour", "Previous Hour", "Today", "Yesterday", "Last 7 Days", "Last Week (Mon - Sun)", "Last 30 Days", "Last Month", "Custom Date/Time"}
    Dim myTables As New List(Of Table)
    Dim usingBootstrap As Boolean = False
    Dim usingNewInterface As Boolean = False
    Dim myBackgroundColour As String = BACKGROUND_COLOUR_STRING

    ' This is only used for the Bootstrap version
    Sub logoutButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        loginPanel.Visible = True
        searchPanel.Visible = False
        f_bs_userName.Value = ""
    End Sub

    ' This is only used for the Bootstrap version
    Sub GroupName_IndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        GroupName_IndexChangedHandler()
    End Sub

    ' This is only used for the Bootstrap version
    Sub GroupName_IndexChangedHandler(Optional ByRef p_groupName As String = Nothing)
        Dim orderByString As String = ""

        If sortExtensionsBy.SelectedIndex = 1 Then orderByString = "&orderBy=Name"
        If p_groupName Is Nothing Then p_groupName = groupName.SelectedItem.ToString

        runReportButton.Enabled = False
        reportType.Items.Clear()
        reportedExtensions.Items.Clear()
        ReadXML1(RunIt("Operation=GetReportsForEntity&entity=" & AmpersandEncode(p_groupName)))
        ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(p_groupName) & "&userName=" & GetUserNameFromForm() & orderByString))

        If reportType.Items.Count > 0 Then
            reportType.Items(0).Selected = True
        End If

        runReportButton.Enabled = True
    End Sub

    ' This is only used for the Bootstrap version
    Sub reportType_IndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        If Not groupName.SelectedItem Is Nothing Then
            Dim orderByString As String = ""

            If sortExtensionsBy.SelectedIndex = 1 Then orderByString = "&orderBy=Name"

            reportedExtensions.Items.Clear()
            ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(groupName.SelectedItem.ToString()) & "&userName=" & GetUserNameFromForm() & orderByString))
        End If
    End Sub

    Protected Sub BS_Calendar1_SelectionChanged(ByVal sender As Object, ByVal e As EventArgs) Handles bs_calendar1.SelectionChanged
        f_startDate.Value = bs_calendar1.SelectedDate
    End Sub

    Protected Sub BS_Calendar2_SelectionChanged(ByVal sender As Object, ByVal e As EventArgs) Handles bs_calendar2.SelectionChanged
        f_endDate.Value = bs_calendar2.SelectedDate
    End Sub

    Private Sub Clear()
        If usingBootstrap Then
            reportedExtensions.ClearSelection()
            bs_calendar1.SelectedDate = Today
            bs_calendar1.VisibleDate = Today
            bs_calendar2.SelectedDate = Today
            bs_calendar2.VisibleDate = Today
            f_startDate.Value = bs_calendar1.SelectedDate
            f_endDate.Value = bs_calendar2.SelectedDate
            startTime.SelectedIndex = 0
            endTime.SelectedIndex = 0
            timeSpan.SelectedIndex = 2
            sortExtensionsBy.SelectedIndex = 0
        Else
            selectedUsersListBox.ClearSelection()
        End If
    End Sub

    Sub xxx(ByVal sender As Object, ByVal e As EventArgs)
        If Not groupNameListBox.SelectedItem Is Nothing Then
            Dim orderByString As String = ""

            If radioList1.SelectedIndex = 1 Then orderByString = "&orderBy=Name"

            selectedUsersListBox.Items.Clear()
            ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(groupNameListBox.SelectedItem.ToString()) & "&userName=" & GetUserNameFromForm() & orderByString))
        End If
    End Sub

    Function RunIt(ByRef p_args As String) As String
        Dim result As String = ""
        Dim runStandAlone As Boolean = reportingWebInterfaceConfigDictionary.GetItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.standAloneMode))

        If runStandAlone Then
            WebInterfaceLoadAppInit()
            result = RunDirect(p_args)
        Else
            Dim myProcess As New Process
            Dim myReader As StreamReader
            Dim startedOK As Boolean = True
            Dim myText As String = ""
            Dim myArgs As String = p_args & "&returnAs=STDOUT"

            LogInfo("RunIt(" & myArgs & ")", "Called")
            ReportingWebInterfaceInitialiseConfig()

            myProcess.StartInfo.FileName = GetReachAllApplicationPath.CreateFullName(APPLICATION_NAME)
            myProcess.StartInfo.UseShellExecute = False
            myProcess.StartInfo.RedirectStandardOutput = True
            myProcess.StartInfo.RedirectStandardInput = True
            myProcess.StartInfo.Arguments = System.Web.HttpUtility.UrlEncode(myArgs)

            Try
                myProcess.Start()
            Catch e As Exception
                startedOK = False
                myText = e.Message
            End Try

            If startedOK Then
                myReader = myProcess.StandardOutput
                result = myReader.ReadToEnd
            Else
                LogError("RunIt().myProcess.Start() failed", myText)
            End If
        End If

        Return result
    End Function

    Sub clearSelectionButton_OnClick(ByVal sender As Object, ByVal e As EventArgs)
        'selectedUsersListBox.ClearSelection() Legacy version only
        Clear() ' Copied from BS version, now a generic version
    End Sub

    Sub GroupNameListBox_IndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        If usingNewInterface Then
            GroupNameListBoxNewInterface_IndexChangedHandler()
        Else
            GroupNameListBox_IndexChangedHandler()
        End If
    End Sub

    Sub GroupNameListBoxNewInterface_IndexChangedHandler(Optional ByRef p_groupName As String = Nothing)
        Dim orderByString As String = ""

        If radioList1.SelectedIndex = 1 Then orderByString = "&orderBy=Name"
        If p_groupName Is Nothing Then p_groupName = groupNameNewInterfaceListBox.SelectedItem.ToString

        runReportButtonNewInterface.Enabled = False
        typeOfReportNewInterfaceListBox.Items.Clear()
        selectedUsersNewInterfaceListBox.Items.Clear()
        ReadXML1(RunIt("Operation=GetReportsForEntity&entity=" & AmpersandEncode(p_groupName)))
        ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(p_groupName) & "&userName=" & GetUserNameFromForm() & orderByString))

        If typeOfReportNewInterfaceListBox.Items.Count > 0 Then
            typeOfReportNewInterfaceListBox.Items(0).Selected = True
        End If

        runReportButtonnewInterface.Enabled = True
    End Sub

    Sub GroupNameListBox_IndexChangedHandler(Optional ByRef p_groupName As String = Nothing)
        Dim orderByString As String = ""
        'Dim myIndex = -1

        If radioList1.SelectedIndex = 1 Then orderByString = "&orderBy=Name"
        If p_groupName Is Nothing Then p_groupName = groupNameListBox.SelectedItem.ToString
        'groupNameListBox.Items(1).Attributes.Add("style", "background-color: #ff0000")
        'For i = 0 To groupNameListBox.Items.Count - 1
        'Dim myColour = "#ffffff"

        'If groupNameListBox.Items(i).Selected Then
        'myIndex = i
        'Exit For
        'End If

        'groupNameListBox.Items(i).Attributes.Add("style", "background-color: " & myColour)
        ' Next

        ' If myIndex >= 0 Then groupNameListBox.Items(myIndex).Attributes.Add("style", "background-color: #00ff00")

        runReportButton.Enabled = False
        typeOfReportListBox.Items.Clear()
        selectedUsersListBox.Items.Clear()
        ReadXML1(RunIt("Operation=GetReportsForEntity&entity=" & AmpersandEncode(p_groupName)))
        ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(p_groupName) & "&userName=" & GetUserNameFromForm() & orderByString))

        If typeOfReportListBox.Items.Count > 0 Then
            typeOfReportListBox.Items(0).Selected = True
        End If

        runReportButton.Enabled = True
    End Sub

    Sub IgnoreTimeCheckBoxChanged(ByVal sender As Object, ByVal e As EventArgs)
        IgnoreTimeCheckBoxChanged_Handler()
    End Sub

    Sub IgnoreTimeCheckBoxChanged_Handler()
        Dim flag As Boolean = True

        If usingNewInterface Then
            If ignoreTimeNewInterfaceCheckBox.Checked Then flag = False

            startTimeNewInterfaceDropDownList.Enabled = flag
            endTimeNewInterfaceDropDownList.Enabled = flag
            startTimeNewInterfaceLabel.Enabled = flag
            endTimeNewInterfaceLabel.Enabled = flag
        Else
            If ignoreTimeCheckBox.Checked Then flag = False

            startTimeDropDownList.Enabled = flag
            endTimeDropDownList.Enabled = flag
            label1.Enabled = flag
            label2.Enabled = flag
        End If
    End Sub

    Sub calMonthChange(ByVal sender As Object, ByVal e As MonthChangedEventArgs)
        Dim myCalender As Calendar = sender
        Dim a As Integer = e.PreviousDate.Month
        Dim b As Integer = e.NewDate.Month

        If e.PreviousDate.Month < e.NewDate.Month Then
            myCalender.SelectedDate = e.PreviousDate.AddMonths(1)
        Else
            myCalender.SelectedDate = e.PreviousDate.AddMonths(-1)
        End If
    End Sub

    Sub timeSpanIndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        Select Case timeSpanDropDownList.SelectedIndex
            Case 0
                ' This hour
                ignoreTimeCheckBox.Checked = False
                startTimeDropDownList.SelectedIndex = Now.Hour
                endTimeDropDownList.SelectedIndex = startTimeDropDownList.SelectedIndex
                calendar1.SelectedDate = Today
                calendar2.SelectedDate = calendar1.SelectedDate

            Case 1
                ' Previous hour
                ignoreTimeCheckBox.Checked = False
                endTimeDropDownList.SelectedIndex = (Now.Hour - 1) Mod 24
                startTimeDropDownList.SelectedIndex = (startTimeDropDownList.SelectedIndex - 1) Mod 24
                calendar1.SelectedDate = Today
                calendar2.SelectedDate = calendar1.SelectedDate

            Case 2
                ' Today
                ignoreTimeCheckBox.Checked = True
                calendar1.SelectedDate = Today
                calendar2.SelectedDate = calendar1.SelectedDate

            Case 3
                ' Yesterday
                ignoreTimeCheckBox.Checked = True
                calendar1.SelectedDate = Today.AddDays(-1)
                calendar2.SelectedDate = calendar1.SelectedDate

            Case 4
                ' Last 7 days
                ignoreTimeCheckBox.Checked = True
                calendar1.SelectedDate = Today.AddDays(-7)
                calendar2.SelectedDate = calendar1.SelectedDate.AddDays(6)

            Case 5
                ' Last week (Mon - Sun)
                ignoreTimeCheckBox.Checked = True
                calendar1.SelectedDate = Today.AddDays(-(6 + CInt(Today.DayOfWeek)))
                calendar2.SelectedDate = calendar1.SelectedDate.AddDays(6)

            Case 6
                ' Last 30 days
                ignoreTimeCheckBox.Checked = True
                calendar1.SelectedDate = Today.AddDays(-30)
                calendar2.SelectedDate = calendar1.SelectedDate.AddDays(29)

            Case 7
                ' Last month
                ignoreTimeCheckBox.Checked = True
                calendar2.SelectedDate = Today.AddDays(-Today.Day)
                calendar1.SelectedDate = calendar2.SelectedDate.AddDays(1 - Date.DaysInMonth(calendar2.SelectedDate.Year, calendar2.SelectedDate.Month))

            Case 8
                ignoreTimeCheckBox.Checked = False
                startTimeDropDownList.SelectedIndex = Now.Hour
                endTimeDropDownList.SelectedIndex = (startTimeDropDownList.SelectedIndex + 1) Mod 24
                calendar1.SelectedDate = Today
                calendar2.SelectedDate = calendar1.SelectedDate
        End Select

        IgnoreTimeCheckBoxChanged_Handler()
    End Sub

    Sub bs_timeSpanIndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        Select Case timeSpan.SelectedIndex
            Case 0
                ' This hour
                'ignoreTimeCheckBox.Checked = False
                startTime.SelectedIndex = Now.Hour
                endTime.SelectedIndex = (startTime.SelectedIndex + 1) Mod 24
                bs_calendar1.SelectedDate = Today
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate

            Case 1
                ' Previous hour
                'ignoreTimeCheckBox.Checked = False
                endTime.SelectedIndex = Now.Hour
                startTime.SelectedIndex = (endTime.SelectedIndex - 1) Mod 24
                bs_calendar1.SelectedDate = Today
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate

            Case 2
                ' Today
                'ignoreTimeCheckBox.Checked = True
                startTime.SelectedIndex = 0
                endTime.SelectedIndex = 0
                bs_calendar1.SelectedDate = Today
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate

            Case 3
                ' Yesterday
                'ignoreTimeCheckBox.Checked = True
                startTime.SelectedIndex = 0
                endTime.SelectedIndex = 0
                bs_calendar1.SelectedDate = Today.AddDays(-1)
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate

            Case 4
                ' Last 7 days
                'ignoreTimeCheckBox.Checked = True
                startTime.SelectedIndex = 0
                endTime.SelectedIndex = 0
                bs_calendar1.SelectedDate = Today.AddDays(-7)
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate.AddDays(6)

            Case 5
                ' Last week (Mon - Sun)
                'ignoreTimeCheckBox.Checked = True
                startTime.SelectedIndex = 0
                endTime.SelectedIndex = 0
                bs_calendar1.SelectedDate = Today.AddDays(-(6 + CInt(Today.DayOfWeek)))
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate.AddDays(6)

            Case 6
                ' Last 30 days
                'ignoreTimeCheckBox.Checked = True
                startTime.SelectedIndex = 0
                endTime.SelectedIndex = 0
                bs_calendar1.SelectedDate = Today.AddDays(-30)
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate.AddDays(29)

            Case 7
                ' Last month
                'ignoreTimeCheckBox.Checked = True
                startTime.SelectedIndex = 0
                endTime.SelectedIndex = 0
                bs_calendar2.SelectedDate = Today.AddDays(-Today.Day)
                bs_calendar1.SelectedDate = bs_calendar2.SelectedDate.AddDays(1 - Date.DaysInMonth(bs_calendar2.SelectedDate.Year, bs_calendar2.SelectedDate.Month))

            Case 8
                'ignoreTimeCheckBox.Checked = False
                startTimeDropDownList.SelectedIndex = Now.Hour
                endTimeDropDownList.SelectedIndex = (startTimeDropDownList.SelectedIndex + 1) Mod 24
                bs_calendar1.SelectedDate = Today
                bs_calendar2.SelectedDate = bs_calendar1.SelectedDate
        End Select

        IgnoreTimeCheckBoxChanged_Handler()
    End Sub

    Private Sub DoSessionTimeoutStuff()
        searchPanel.Visible = False
        actionTable.Visible = False
        timePeriodTable.Visible = False
        reportContentsTable.Visible = False
        ReportingWebInterfaceInitialiseConfig()

        If usingBootstrap Then
            Literal2.Text = "Your session has timed out. You can either navigate to the start of your session using the navigator Back Button, or click <a href=" & WrapInQuotes(reportingWebInterfaceConfigDictionary.GetItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.ourHomePage))) & ">here</a> to start a new session."
        Else
            myLiteral.Text = "Your session has timed out. You can either navigate to the start of your session using the navigator Back Button, or click <a href=" & WrapInQuotes(reportingWebInterfaceConfigDictionary.GetItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.ourHomePage))) & ">here</a> to start a new session."
        End If
    End Sub

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As EventArgs) Handles Me.Load
        Dim doCommonFirstPageLoadStuff As Boolean = False
        Dim optionsXMLFilename As String = ""
        Dim multiUser As Boolean = False

        If LAB_MODE Then
            optionsXMLFilename = "c:\inetpub\wwwroot\ReachAllWebInterface\" & GetOptionsFilename(True)
        End If

        Logutil.MyLiteralRef = logLiteral
        target.SetTarget(TargetType.REPORTING_WEB_INTERFACE)
        Options.LoadOptionsAsXML(optionsXMLFilename)
        ReportingWebInterfaceInitialiseConfig()

        multiUser = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.multiUser))

        If multiUser Then
            registerButton.Visible = True
            registerPanel.Visible = True
            uploadButton.Visible = True
            'uploadLabel.Visible = True
        End If

        usingBootstrap = optionSettingsConfigDictionary.GetBooleanItem("useBootstrap")
        usingNewInterface = optionSettingsConfigDictionary.GetBooleanItem("useNewInterface")

        If usingBootstrap Then
            styleLiteral.Text = vbCrLf & "<link href=" & WrapInQuotes("bootstrap.min.css") & " rel=" & WrapInQuotes("Stylesheet") & " />"
            styleLiteral.Text &= vbCrLf & "<link href=" & WrapInQuotes("bootstrapStyleSheet.css") & " rel=" & WrapInQuotes("Stylesheet") & " />" & vbCrLf
            Literal1.Text = vbCrLf & "<h2><span class=" & WrapInQuotes(myTextClasses(0)) & ">ReachAll</span> <span class=" & WrapInQuotes(myTextClasses(1)) & ">Reporting</span> <span class=" & WrapInQuotes(myTextClasses(2)) & ">Interface</span></h2>"
            form1.Attributes("class") = "form-horizontal"
            styleLiteral1.Text = "<style>select option:checked, select option:hover {box-shadow: 0 0 10px 100px #d62c1a inset;}</style>"
        Else
            styleLiteral.Text = vbCrLf & "<link href=" & WrapInQuotes("defaultStyleSheet.css") & " rel=" & WrapInQuotes("Stylesheet") & " />" & vbCrLf
            'styleLiteral1.Text = "<style>select option:checked, option:active, option:focus, option:selected {box-shadow: 0 0 10px 100px #26A0DA inset;} select option:hover {box-shadow: 0 0 10px 100px #DEDEDE inset;}</style>"
        End If

        If UsingNewSecurity(False) Then
            changePasswordButton.Visible = True
        End If

        Dim hotelBillingMode As Boolean = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.hotelBillingMode))

        If hotelBillingMode Then
            timeSpanLabel.Visible = False
            timeSpanDropDownList.Visible = False
            ignoreTimeCheckBox.Visible = False
            ignoreTimeCheckBox.Checked = False
            startTimeDropDownList.Enabled = True
            endTimeDropDownList.Enabled = True
            timePeriodLabel.Text = "Hotel Room Occupancy Time"
            groupNameLabel.Visible = False
            groupNameListBox.Visible = False
            typeOfReportListBox.Visible = False
            extensionsToReportLabel.Text = "Room to bill"
            typeOfReportLabel.Visible = False
            reportContentsLabel.Visible = False
            clearSelectionButton.Visible = False
            selectedUsersListBox.SelectionMode = ListSelectionMode.Single
            runReportButton.Text = "Generate Bill"
        End If

        If NEW_LOGIN Then
            changePasswordButton.Visible = True
        End If

        If Page.IsPostBack Then LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "Postback (non first time load)")

        myTables.Add(actionTable)
        myTables.Add(timePeriodTable)
        myTables.Add(reportContentsTable)

        If Request.QueryString.Count > 0 Then
            ' User wants to drill down into a particular user or service

            If Not Page.IsPostBack Then
                LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "First time load with Request.QueryString = " & WrapInQuotes(Request.QueryString.ToString))

                If Session(LINK_TEXT) Is Nothing Then
                    DoSessionTimeoutStuff()
                Else
                    Dim myString As String = ""

                    doCommonFirstPageLoadStuff = True
                    timePeriodTable.Visible = False
                    reportContentsTable.Visible = False
                    'doneButtonPlaceHolder.Visible = True
                    runReportButton.Visible = False
                    runReportButtonnewInterface.Visible = False
                    downloadButton.Visible = False
                    csvDownLoadButton.Visible = False
                    actionTable.Visible = True
                    searchPanel.Visible = False

                    myString = Request.QueryString.ToString
                    Session(DRILL_DOWN_TARGET_TEXT) = myString

                    If usingBootstrap Then
                        loginTable.Visible = False  ' This is enabled by the page default value itself
                        loginPanel.Visible = False
                        reportPanel.Visible = True
                        ddActionPanel.Visible = True
                        actionTable.Visible = False
                    Else
                        If usingNewInterface Then
                            loginPanelNewInterface.Visible = False
                        Else
                            loginTable.Visible = False

                            ddDownLoadButton.Visible = True
                            ddCSVDownLoadButton.Visible = True
                        End If
                    End If

                    myBody.Attributes(BACKGROUND_COLOUR_STRING) = "#" & webColourArray(WebColours.WebColours.PageBackGround).value

                    Dim myText As String = RunIt(System.Web.HttpUtility.UrlDecode(myString))

                    If usingBootstrap Then
                        Literal2.Text = myText
                    Else
                        myLiteral.Text = myText
                    End If
                End If  ' If Session(LINK_TEXT) Is Nothing
            End If ' If Not Page.IsPostBack
        Else ' If Request.QueryString.Count > 0
            ' IsPostBack() returns False on first page load
            If Not Page.IsPostBack Then
                ' This is the first page load, set everything up
                LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "First time load. Version " & OUR_VERSION)
                doCommonFirstPageLoadStuff = True

                If usingBootstrap Then
                    loginPanel.Visible = True
                    loginTable.Visible = False
                    bs_calendar1.SelectedDate = Today
                    bs_calendar2.SelectedDate = Today
                    f_startDate.Value = Today
                    f_endDate.Value = Today
                Else
                    If usingNewInterface Then
                        loginPanelNewInterface.Visible = True
                        loginTable.Visible = False
                    Else
                        calendar1.SelectedDate = Today
                        calendar2.SelectedDate = Today
                    End If
                End If

                groupNameListBox.Items.Clear()
                groupNameNewInterfaceListBox.Items.Clear()

                ' Populate the time control drop downs
                For i = 0 To 23
                    Dim myString As String = ""

                    If i < 10 Then myString = "0"

                    myString &= i & ":"
                    startTimeDropDownList.Items.Add(myString & "00")
                    starttimeNewInterfaceDropDownList.items.add(myString & "00")

                    If hotelBillingMode Then
                        If myString = "00:" Then myString = "24:"

                        endTimeDropDownList.Items.Add(myString & "00")
                    Else
                        endTimeDropDownList.Items.Add(myString & "59")
                        endTimeNewInterfaceDropDownList.Items.Add(myString & "59")
                    End If
                Next

                If usingBootstrap Then
                    For i = 0 To timeSpans.Length - 1
                        timeSpan.Items.Add(timeSpans(i))
                    Next

                    timeSpan.SelectedIndex = 2
                Else
                    If usingNewInterface Then
                        For i = 0 To timeSpans.Length - 1
                            timeSpanNewInterfacDropDownList.Items.Add(timeSpans(i))
                        Next
                    Else
                        For i = 0 To timeSpans.Length - 1
                            timeSpanDropDownList.Items.Add(timeSpans(i))
                        Next

                        timeSpanDropDownList.SelectedIndex = 2
                    End If
                End If

                Session(LINK_TEXT) = ""
                Session(DRILL_DOWN_TARGET_TEXT) = ""

                ' For New Directions
                '              f_userName.Text = "Admin"
                '  myTextBox.Visible = True
                ' myLabel.Visible = True
                'DoLoginOK()
            End If
        End If

        If doCommonFirstPageLoadStuff Then
            Dim myVisible As Boolean = False

            If usingBootstrap Then
                myVisible = loginPanel.Visible
            Else
                myVisible = loginTable.Visible
            End If

            If myVisible Then myBody.Attributes(BACKGROUND_COLOUR_STRING) = TABLE_BACKGROUND_COLOUR
            'If myVisible Then myBody.Attributes(BACKGROUND_COLOUR_STRING) = "#EEEEEE"

            For i = 0 To myTables.Count - 1
                myTables(i).Style.Item(CSS_BACKGROUND_COLOUR_STRING) = TABLE_BACKGROUND_COLOUR
                myTables(i).Attributes.Add("width", "900")
            Next
        End If

        LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "Exited")
    End Sub

    Sub ChangePasswordPressed(ByVal Source As Object, ByVal e As EventArgs)
        If GetUserNameFromForm() = "Admin" Then
            changePasswordResponse.Text = "Cannot change Admin password"
        Else
            changePasswordResponse.Text = ""

            If CheckLogin() Then ShowChangePasswordRows(True)
        End If
    End Sub

    Sub ShowChangePasswordRows(ByVal p As Boolean)
        cpRow_1.Visible = p
        cpRow_2.Visible = p
        cpRow_3.Visible = p
    End Sub

    Sub ConfirmChangePasswordPressed(ByVal Source As Object, ByVal e As EventArgs)
        Dim myIndex As Integer = securityList.GetIndexOfUser(GetUserNameFromForm())
        Dim allOk As Boolean = False
        Dim myResponse As String = ""

        If myIndex >= 0 Then
            Dim currentPassword As String = securityList.GetPasswordFromIndex(myIndex)

            If IsNewPasswordOK(currentPassword, newPasswordTextBox.Text, newPasswordAgainTextBox.Text, myResponse) Then
                If UpdatePassword(GetUserNameFromForm(), newPasswordTextBox.Text) Then
                    myResponse = "Password updated successfully"
                    allOk = True
                Else
                    myResponse = "Password could not be updated"
                End If
            End If
        Else
            myresponse = "Error in locating user"
        End If

        If allOk Then ShowChangePasswordRows(False)

        changePasswordResponse.Text = myResponse
    End Sub

    Protected Sub UploadButton_Click(ByVal sender As Object, ByVal e As EventArgs)
        'If fileUpload.HasFile Then
        'Dim myFilename As String = Path.GetFileName(FileUploadControl.FileName)

        'FileUploadControl.SaveAs(Server.MapPath("~/") & myFilename)
        'fileUploadLabel.Text = "donw"
        'End If

        If fileUpload.PostedFile IsNot Nothing Then
            Dim uploadPath As String = "files"
            Dim filename As String = ""

            Try
                If fileUpload.PostedFile.ContentLength > 0 Then
                    Dim pos As Integer = fileUpload.PostedFile.FileName.LastIndexOf("\")

                    If pos > 0 Then
                        filename = fileUpload.PostedFile.FileName.Substring(pos + 1)
                    Else
                        filename = fileUpload.PostedFile.FileName
                    End If

                    fileUpload.PostedFile.SaveAs(Server.MapPath(uploadPath) & "\" & filename)
                Else
                    Response.Write("Empty file may not be uploaded")
                End If
            Catch ex As Exception
                Response.Write("Error: " & ex.Message.ToString)
            End Try
        End If
    End Sub

    Sub LoginPressed(ByVal Source As Object, ByVal e As EventArgs)
        changePasswordResponse.Text = ""

        If CheckLogin() Then DoLoginOK()
    End Sub

    Function GetUserNameFromForm() As String
        Dim myUserName As String = ""

        If usingBootstrap Then
            myUserName = f_bs_userName.Value
        Else
            If usingNewInterface Then
                myUserName = userNameNewInterface.Text
            Else
                myUserName = f_userName.Text
            End If
        End If

        Return myUserName
    End Function

    Function GetPasswordFromForm() As String
        Dim myPassword As String = ""

        If usingBootstrap Then
            myPassword = f_bs_password.Value
        Else
            If usingNewInterface Then
                myPassword = passwordNewInterface.Text
            Else
                myPassword = f_password.Text
            End If
        End If

        Return myPassword
    End Function

    Function CheckLogin() As Boolean
        Dim myUserName As String = GetUserNameFromForm()
        Dim myPassword As String = GetPasswordFromForm()

        Dim p As String = RunIt("Operation=CheckLogin&userName=" & myUserName & "&password=" & Encrypt(myPassword) & "&attributes=" & Security.WEB_ACCESS_MASK)
        Dim myDoc As New XmlDocument
        Dim myRecord As XmlNode = Nothing
        Dim loginResult As Boolean = False

        If p = "" Then
            LogError("ReachAllWebInterface::LoginPressed()", "Empty result from Operation=CheckLogin")
        Else
            myDoc.Load(New StringReader(p))

            For Each myRecord In myDoc("LoginResult")
                If myRecord.Name = "Value" Then
                    If myRecord.HasChildNodes Then
                        Dim myStringResult As String = myRecord.FirstChild.Value

                        Select Case myStringResult.ToLower
                            Case "true"
                                loginResult = True

                            Case "requestpasswordchange"
                                ShowChangePasswordRows(True)
                        End Select
                    End If
                End If
            Next
        End If

        Return loginResult
    End Function

    Private Sub DoLoginOK()
        Dim hotelBillingMode As Boolean = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.hotelBillingMode))
        Dim myUserName As String = ""

        myBody.Attributes(BACKGROUND_COLOUR_STRING) = "#" & webColourArray(WebColours.WebColours.PageBackGround).value

        If usingBootstrap Then
            loginPanel.Visible = False
            searchPanel.Visible = True
            myUserName = f_bs_userName.Value
        Else
            If usingNewInterface Then
                loginPanelNewInterface.Visible = False
                newInterfacePanel.Visible = True
            Else
                myUserName = f_userName.Text
                loginTable.Visible = False

                ' These 3 are the equivalent of the single searchPanel in the BS version
                actionTable.Visible = True
                timePeriodTable.Visible = True
                reportContentsTable.Visible = True
            End If
        End If

        ' Get the entities that this user can report on
        ReadXML(RunIt("Operation=GetAgentEntities&userName=" & myUserName))

        Dim myCount As Integer = 0

        If usingBootstrap Then
            myCount = groupName.Items.Count
        Else
            myCount = groupNameListBox.Items.Count
        End If

        If myCount > 0 Then
            If hotelBillingMode Then
                If usingBootstrap Then
                    GroupName_IndexChangedHandler("Hotel Rooms")
                Else
                    GroupNameListBox_IndexChangedHandler("Hotel Rooms")
                End If
            Else
                If usingBootstrap Then
                    groupName.Items(0).Selected = True
                    GroupName_IndexChangedHandler()
                Else
                    groupNameListBox.Items(0).Selected = True
                    GroupNameListBox_IndexChangedHandler()
                End If
            End If
        End If
    End Sub

    Sub doneButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        Response.Redirect(Request.UrlReferrer.ToString)
    End Sub

    Private Function FormatDateISO(ByRef p As Date) As String
        Dim x As New DateAndTimeClass

        x.SetFromDateClass(p)

        Return x.AsISODate
    End Function

    Sub upButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        If usingBootstrap Then
            Literal2.Text = ""
        Else
            myLiteral.Text = ""
        End If

        timePeriodTable.Visible = True
        reportContentsTable.Visible = True
        runReportButton.Visible = True
        runReportButtonnewInterface.Visible = True

        If Session(REPORT_SELECTOR_TEXT) IsNot Nothing Then
            Dim x As New DateTime
            Dim y As New Date

            x = DateTime.FromBinary(Session(REPORT_SELECTOR_TEXT))
            y = Now.AddDays(-130)

            calendar1.SelectedDate = y
        End If
    End Sub

    Sub runReportButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        '       Response.Write("The .NET version is " & System.Environment.Version.ToString())
        Dim browserWidth As String = myWidth.Value
        Dim i As Integer
        Dim myKeyArray(selectedUsersListBox.Items.Count - 1)
        Dim myCount As Integer = 0
        Dim startDateAndTimeString, endDateAndTimeString As String
        Dim myNameValuePairList As New NameValuePairList
        Dim hotelBillingMode As Boolean = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.hotelBillingMode))
        Dim myUserName As String = ""
        Dim selectedUsersObject = Nothing

        If usingBootstrap Then
            myUserName = f_bs_userName.Value
            selectedUsersObject = reportedExtensions
        Else
            If usingNewInterface Then
                myUserName = userNameNewInterface.Text
                selectedUsersObject = selectedUsersNewInterfaceListBox
            Else
                myUserName = f_userName.Text
                selectedUsersObject = selectedUsersListBox
            End If
        End If

        myNameValuePairList.SetValueForName("Operation", "RunReport")
        myNameValuePairList.SetValueForName("Embed", "True")
        myNameValuePairList.SetValueForName("UserName", myUserName)

        If browserWidth <> "" Then myNameValuePairList.SetValueForName("BrowserWidth", browserWidth)

        If hotelBillingMode Then
            myNameValuePairList.SetValueForName("DrillDownReport", "True")
        Else
            myNameValuePairList.SetValueForName("ProduceDrillDownRef", "True")
            myNameValuePairList.SetValueForName("TopLevelReport", "True")
        End If

        If usingBootstrap Then
            actionPanel.Visible = True
            searchPanel.Visible = False
            Button4.Visible = False

            startDateAndTimeString = FormatDateISO(bs_calendar1.SelectedDate) & " "
            endDateAndTimeString = FormatDateISO(bs_calendar2.SelectedDate) & " "

            Dim x As String = endTime.SelectedItem.ToString

            startDateAndTimeString &= startTime.SelectedItem.ToString & ":00"

            If hotelBillingMode Then
                If x = "24:00" Then
                    endDateAndTimeString &= "23:59:59"
                Else
                    endDateAndTimeString &= x & ":00"
                End If
            Else
                If x = "24:00" Then
                    endDateAndTimeString &= "23:59:59"
                Else
                    endDateAndTimeString &= x & ":59"
                End If
            End If
        Else
            If usingNewInterface Then
                newInterfacePanel.Visible = False
                startDateAndTimeString = FormatDateISO(calendar3.SelectedDate) & " "
                endDateAndTimeString = FormatDateISO(calendar4.SelectedDate) & " "

                If ignoreTimeNewInterfaceCheckBox.Checked Then
                    startDateAndTimeString &= "00:00:00"
                    endDateAndTimeString &= "23:59:59"
                Else
                    Dim x As String = endTimeNewInterfaceDropDownList.SelectedItem.ToString

                    startDateAndTimeString &= startTimeNewInterfaceDropDownList.SelectedItem.ToString & ":00"

                    If hotelBillingMode Then
                        If x = "24:00" Then
                            endDateAndTimeString &= "23:59:59"
                        Else
                            endDateAndTimeString &= x & ":00"
                        End If
                    Else
                        endDateAndTimeString &= x & ":59"
                    End If
                End If
            Else
                'responseTable.Visible = True
                timePeriodTable.Visible = False
                reportContentsTable.Visible = False
                runReportButton.Visible = False
                startDateAndTimeString = FormatDateISO(calendar1.SelectedDate) & " "
                endDateAndTimeString = FormatDateISO(calendar2.SelectedDate) & " "

                If ignoreTimeCheckBox.Checked Then
                    startDateAndTimeString &= "00:00:00"
                    endDateAndTimeString &= "23:59:59"
                Else
                    Dim x As String = endTimeDropDownList.SelectedItem.ToString

                    startDateAndTimeString &= startTimeDropDownList.SelectedItem.ToString & ":00"

                    If hotelBillingMode Then
                        If x = "24:00" Then
                            endDateAndTimeString &= "23:59:59"
                        Else
                            endDateAndTimeString &= x & ":00"
                        End If
                    Else
                        endDateAndTimeString &= x & ":59"
                    End If
                End If
            End If
        End If

        ' Has a subset of members of the selected entity been selected ?
        For i = 0 To selectedUsersObject.Items.Count - 1
            If selectedUsersObject.Items(i).Selected Then
                myCount += 1
            End If
        Next

        myNameValuePairList.SetValueForName("StartDateAndTime", startDateAndTimeString)
        myNameValuePairList.SetValueForName("EndDateAndTime", endDateAndTimeString)

        If hotelBillingMode Then
            If myCount = 1 Then
                myNameValuePairList.SetValueForName("Key.Number", GetFirstField(selectedUsersListBox.SelectedItem.ToString))
                myNameValuePairList.SetValueForName("Key.Name", GetSecondField(selectedUsersListBox.SelectedItem.ToString))
            End If
        Else
            If myCount = 0 Then
                ' No. Add all of them, or no key list at all ?
                Dim addAllKeysIfNoneSelected As Boolean = False

                If addAllKeysIfNoneSelected Then
                    Dim myKeyList As String = ""

                    For i = 0 To selectedUsersObject.Items.Count - 1
                        If i > 0 Then myKeyList &= ","

                        myKeyList &= GetFirstField(selectedUsersObject.Items(i).ToString)
                    Next

                    myNameValuePairList.SetValueForName("KeyList", myKeyList)
                End If
            Else
                Dim firstOne As Boolean = True
                Dim myKeyList As String = ""

                For i = 0 To selectedUsersObject.Items.Count - 1
                    If selectedUsersObject.Items(i).Selected Then
                        If myKeyList.Length > 0 Then myKeyList &= ","

                        myKeyList &= GetFirstField(selectedUsersObject.Items(i).ToString)
                    End If
                Next

                myNameValuePairList.SetValueForName("KeyList", myKeyList)
            End If
        End If

        If hotelBillingMode Then
            myNameValuePairList.SetValueForName("Entity", "Hotel Rooms")
            myNameValuePairList.SetValueForName("ReportType", "Hotel Rooms Billing Report")
            myNameValuePairList.SetValueForName("CallTypeName", "outgoingConnectedExternalCalls")
        Else
            If usingBootstrap Then
                myNameValuePairList.SetValueForName("Entity", groupName.SelectedItem.ToString)
                myNameValuePairList.SetValueForName("ReportType", reportType.SelectedItem.ToString)
            Else
                If usingNewInterface Then
                    myNameValuePairList.SetValueForName("Entity", groupNameNewInterfaceListBox.SelectedItem.ToString)
                    myNameValuePairList.SetValueForName("ReportType", typeOfReportNewInterfaceListBox.SelectedItem.ToString)
                Else
                    myNameValuePairList.SetValueForName("Entity", groupNameListBox.SelectedItem.ToString)
                    myNameValuePairList.SetValueForName("ReportType", typeOfReportListBox.SelectedItem.ToString)
                End If
            End If
        End If

        If myTextBox.Text.Length > 0 Then myNameValuePairList.SetValueForName("ddiFilter", myTextBox.Text)

        Session(LINK_TEXT) = myNameValuePairList.AsString
        Session(DRILL_DOWN_TARGET_TEXT) = ""

        Dim myCustomerId As Integer = GetMultiUserCustomerId(myUserName)

        If myCustomerId >= 0 Then
            myNameValuePairList.SetValueForName("multiUserCustomerId", myCustomerId)
        End If

        Dim myText As String = RunIt(myNameValuePairList.AsString)

        If usingBootstrap Then
            myLiteral.Visible = False
            reportPanel.Visible = True
            Literal2.Text = myText
            Session(REPORT_SELECTOR_TEXT) = bs_calendar1.SelectedDate.ToBinary
        Else
            myLiteral.Text = myText
            Session(REPORT_SELECTOR_TEXT) = calendar1.SelectedDate.ToBinary
        End If
        ' Test stuff ...
        'Response.ContentType = "img/jpeg"
        'globalBitmap.GetSystemBitmap.Save(Response.OutputStream, Imaging.ImageFormat.Jpeg)

        'loginTable.Visible = False ???
    End Sub

    Sub ddDownLoadButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        If Session(LINK_TEXT) Is Nothing Or Session(DRILL_DOWN_TARGET_TEXT) Is Nothing Then
            DoSessionTimeoutStuff()
        Else
            '  Dim commandString As String = Session(LINK_TEXT).ToString & Session(DRILL_DOWN_TARGET_TEXT).ToString & "NoDrillDown;"
            Dim commandString As String = Session(DRILL_DOWN_TARGET_TEXT)

            ' Look for "embed=true" and remove it
            Dim x() As String = (System.Web.HttpUtility.UrlDecode(commandString)).Split("&")

            commandString = ""

            For i = 0 To x.Length - 1
                If Not x(i).ToLower.StartsWith("embed") Then
                    If commandString.Length > 0 Then commandString &= "&"

                    commandString &= x(i)
                End If
            Next

            Response.ContentType = "text/html"
            Response.AppendHeader("Content-Disposition", "attachment; filename=report.htm")
            Response.Write(RunIt(commandString))
            Response.End()
        End If
    End Sub

    Sub downloadButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        TopLevelDownloadHandler(False)
    End Sub

    Sub TopLevelDownloadHandler(ByRef p_asCSV As Boolean)
        Dim i As Integer
        Dim commandString As String = "Operation=RunReport&UserName="
        Dim myKeyArray(selectedUsersListBox.Items.Count - 1)
        Dim myCount As Integer = 0
        Dim myExtension As String = "htm"
        Dim myMimeType = "text/html"
        Dim hotelBillingMode As Boolean = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.hotelBillingMode))
        Dim startDateAndTimeString, endDateAndTimeString As String
        Dim myUserName As String = GetUserNameFromForm()

        commandString &= myUserName

        If usingBootstrap Then
            startDateAndTimeString = FormatDateISO(bs_calendar1.SelectedDate) & " "
            endDateAndTimeString = FormatDateISO(bs_calendar2.SelectedDate) & " "
        Else
            startDateAndTimeString = FormatDateISO(calendar1.SelectedDate) & " "
            endDateAndTimeString = FormatDateISO(calendar2.SelectedDate) & " "
        End If

        timePeriodTable.Visible = False
        reportContentsTable.Visible = False
        ' doneButtonPlaceHolder.Visible = True
        'actionTable.Visible = False

        If ignoreTimeCheckBox.Checked Then
            startDateAndTimeString &= "00:00:00"
            endDateAndTimeString &= "23:59:59"
        Else
            Dim x As String = endTimeDropDownList.SelectedItem.ToString

            startDateAndTimeString &= startTimeDropDownList.SelectedItem.ToString & ":00"

            If hotelBillingMode Then
                If x = "24:00" Then
                    endDateAndTimeString &= "23:59:59"
                Else
                    endDateAndTimeString &= x & ":00"
                End If
            Else
                endDateAndTimeString &= x & ":59"
            End If
        End If

        commandString &= "&StartDateAndTime=" & startDateAndTimeString
        commandString &= "&EndDateAndTime=" & endDateAndTimeString

        For i = 0 To selectedUsersListBox.Items.Count - 1
            If selectedUsersListBox.Items(i).Selected Then
                myCount += 1
            End If
        Next

        If hotelBillingMode Then
            commandString &= "&ReportType=Hotel Rooms Billing Report"
            commandString &= "&Entity=Hotel Rooms"
            commandString &= "&DrillDownReport=True"
            commandString &= "&CallTypeName=outgoingConnectedExternalCalls"

            If myCount = 1 Then
                commandString &= "&Key.Number=" & GetFirstField(selectedUsersListBox.SelectedItem.ToString)
                commandString &= "&Key.Name=" & GetSecondField(selectedUsersListBox.SelectedItem.ToString)
            End If
        Else
            Dim myEntity As String = ""
            Dim myReportType As String = ""
            Dim selectedUsersObject As Object = Nothing

            If usingBootstrap Then
                myEntity = groupName.SelectedItem.ToString
                myReportType = reportType.SelectedItem.ToString
                selectedUsersObject = reportedExtensions
            Else
                myEntity = groupNameListBox.SelectedItem.ToString
                myReportType = typeOfReportListBox.SelectedItem.ToString
                selectedUsersObject = selectedUsersListBox
            End If

            commandString &= "&ReportType=" & myReportType & "&Entity=" & myEntity
            commandString &= "&TopLevelReport=True"

            If myCount = 0 Then
                commandString &= "&KeyList="

                For i = 0 To selectedUsersObject.Items.Count - 1
                    If i > 0 Then commandString &= ","

                    commandString &= GetFirstField(selectedUsersObject.Items(i).ToString)
                Next
            Else
                Dim firstOne As Boolean = True

                commandString &= "&KeyList="

                For i = 0 To selectedUsersListBox.Items.Count - 1
                    If selectedUsersListBox.Items(i).Selected Then
                        If firstOne Then
                            firstOne = False
                        Else
                            commandString &= ","
                        End If

                        commandString &= GetFirstField(selectedUsersListBox.Items(i).ToString)
                    End If
                Next
            End If
        End If

        Dim myCustomerId As Integer = GetMultiUserCustomerId(myUserName)

        If myCustomerId >= 0 Then
            commandString &= "&multiUserCustomerId=" & myCustomerId
        End If

        If p_asCSV Then
            commandString &= "&CSV=True"
            myExtension = "csv"
            myMimeType = "text/csv"
        End If

        Response.ContentType = myMimeType
        Response.AppendHeader("Content-Disposition", "attachment; filename=report." & myExtension)
        Response.Write(RunIt(commandString))
        Response.End()
    End Sub

    Sub csvDownloadButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        TopLevelDownloadHandler(True)
    End Sub

    Sub ddCSVDownLoadButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        If Session(LINK_TEXT) Is Nothing Or Session(DRILL_DOWN_TARGET_TEXT) Is Nothing Then
            DoSessionTimeoutStuff()
        Else
            '  Dim commandString As String = Session(LINK_TEXT).ToString & Session(DRILL_DOWN_TARGET_TEXT).ToString & "NoDrillDown;"
            Dim commandString As String = Session(DRILL_DOWN_TARGET_TEXT)

            ' Look for "embed=true" and remove it
            Dim x() As String = (System.Web.HttpUtility.UrlDecode(commandString)).Split("&")

            commandString = "CSV=True"

            For i = 0 To x.Length - 1
                If Not x(i).ToLower.StartsWith("embed") Then
                    If commandString.Length > 0 Then commandString &= "&"

                    commandString &= x(i)
                End If
            Next

            Response.ContentType = "text/csv"
            Response.AppendHeader("Content-Disposition", "attachment; filename=report.csv")
            Response.Write(RunIt(commandString))
            Response.End()
        End If
    End Sub

    Function GetFirstField(ByRef p As String) As String
        Dim result As String = p
        Dim index As Integer = p.IndexOf(" ")

        If index > 0 Then result = p.Substring(0, index)

        Return result
    End Function

    Function GetSecondField(ByRef p As String) As String
        Dim result As String = ""
        Dim index As Integer = p.IndexOf(" ")

        If index >= 0 And p.Length > (index + 1) Then result = p.Substring(index + 1)

        Return result
    End Function

    Sub ReadXML(ByRef p As String)
        Dim MyList As List(Of String) = BasicXMLToList(p)

        For Each item As String In MyList
            If usingBootstrap Then
                groupName.Items.Add(item)
            Else
                If usingNewInterface Then
                    groupNameNewInterfaceListBox.Items.Add(item)
                Else
                    groupNameListBox.Items.Add(item)
                End If
            End If
        Next
    End Sub

    Sub ReadXML1(ByRef p As String)
        Dim MyList As List(Of String) = BasicXMLToList(p)

        For Each item As String In MyList
            If usingBootstrap Then
                reportType.Items.Add(item)
            Else
                If usingNewInterface Then
                    typeOfReportNewInterfaceListBox.Items.Add(item)
                Else
                    typeOfReportListBox.Items.Add(item)
                End If
            End If
        Next
    End Sub

    Sub ReadXML2(ByRef p As String)
        Dim MyList As List(Of String) = BasicXMLToList(p)

        For Each item As String In MyList
            If usingBootstrap Then
                reportedExtensions.Items.Add(item)
            Else
                If usingNewInterface Then
                    selectedUsersNewInterfaceListBox.Items.Add(item)
                Else
                    selectedUsersListBox.Items.Add(item)
                End If
            End If
        Next

        ' ???
        If selectedUsersListBox.SelectionMode = ListSelectionMode.Single Then
            If selectedUsersListBox.Items.Count > 0 Then selectedUsersListBox.SelectedIndex = 0
        End If
    End Sub

    Public Sub WriteLiteral(ByRef p As String)
        If usingBootstrap Then
            Literal2.Text = p
        Else
            myLiteral.Text = p
        End If
    End Sub

    Public Sub SendImage(ByRef p_bitmapImage As Bitmap)
        Response.ContentType = "img/bmp"
        p_bitmapImage.Save(Response.OutputStream, Imaging.ImageFormat.Bmp)
    End Sub

    Sub RegisterPressed(ByVal Source As Object, ByVal e As EventArgs)
        ' Do we have a username and password ?
        Dim myUserName As String = GetUserNameFromForm()
        Dim myPassword As String = GetPasswordFromForm()

        changePasswordResponse.Text = ""
        WebInterfaceLoadAppInit()

        If myUserName <> "" Then
            If myPassword <> "" Then
                ' Check that the username is not already registered
                Dim mySql As String = "select * from ReachallMultiUserTable"
                Dim myTable As New DataTable
                Dim alreadyInUse As Boolean = False
                Dim myConnectionString As String = CreateConnectionString(CDRSettings.cdrMultiSiteSettingsList(0).settingsConfigDictionary)

                If FillTableFromCommand(myConnectionString, mySql, myTable) Then
                    For i = 0 To myTable.Rows.Count - 1
                        With myTable.Rows(i)
                            If .Item("userName") IsNot DBNull.Value Then
                                If .Item("userName") = myUserName Then
                                    alreadyInUse = True
                                    Exit For
                                End If
                            End If
                        End With
                    Next
                End If

                If alreadyInUse Then
                    changePasswordResponse.Text = "This user name is already taken"
                Else
                    mySql = "insert into ReachallMultiUserTable values (" & WrapInSingleQuotes(SingleQuoteCheck(myUserName)) & ", " & WrapInSingleQuotes(SingleQuoteCheck(myPassword)) & ")"
                    ExecuteNonQuery(CreateConnectionString(CDRSettings.cdrMultiSiteSettingsList(0).settingsConfigDictionary), mySql)
                End If
            End If
        End If
    End Sub

    Sub UploadButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        If Not (fileUpload.PostedFile Is Nothing) Then

            Dim uploadPath As String = "files"
            Dim filename As String

            Try
                If (fileUpload.PostedFile.ContentLength > 0) Then
                    Dim pos As Integer
                    Dim myFilename As String = ""

                    pos = fileUpload.PostedFile.FileName.LastIndexOf("\")

                    If (pos >= 0) Then
                        filename = fileUpload.PostedFile.FileName.Substring(pos + 1)
                    Else
                        filename = fileUpload.PostedFile.FileName
                    End If

                    'myFilename = Server.MapPath(uploadPath + "\" + filename)
                    myFilename = "c:\inetpub\wwwroot\ReachAllWebInterface\files\" & filename
                    fileUpload.PostedFile.SaveAs(myFilename)
                    ImportCDRCSV(myFilename)
                Else
                    Response.Write("Empty file may not be uploaded.")
                End If

            Catch ex As Exception
                Response.Write("Error: " + ex.Message.ToString())
            End Try
        End If
    End Sub

    Private Sub ImportCDRCSV(ByRef p_filename As String)
        Dim y As New IO.StreamReader(p_filename)
        Dim reading As Boolean = True
        Dim firstLine As Boolean = True
        Dim hadError As Boolean = False
        Dim recordsProcessed As Integer = 0
        Dim recordsAdded As Integer = 0
        Dim recordsAlreadyThere As Integer = 0
        Dim numberOfLines As Integer = 0
        Dim cdrTableName As String = "Composite_IpPbxCDR"
        Dim myConnectionString As String = CreateConnectionString(CDRSettings.cdrMultiSiteSettingsList(0).settingsConfigDictionary)
        Dim myCustomerId As Integer = GetMultiUserCustomerId(GetUserNameFromForm())

        'ExecuteNonQuery(CreateConnectionString(configDictionary), "delete from " & CDR_TABLE_NAME)

        While reading
            Dim myLine As String = y.ReadLine

            If myLine Is Nothing Then
                reading = False
            Else
                If firstLine Then
                    Dim headings() As String = GetFields(myLine)

                    If headings.Count > 0 Then
                        If headings(0) = "CallId" Then firstLine = False
                    End If
                Else
                    Dim myFields() As String = GetFields(myLine)
                    Dim mySql As New SQLStatementClass
                    Dim myTable As New DataTable

                    mySql.SetInsertIntoTable(cdrTableName)
                    mySql.AddValue(myCustomerId)
                    mySql.AddValue(myFields(0)) ' Call Id
                    mySql.AddValue(WrapInSingleQuotes(myFields(1))) ' Orig number
                    mySql.AddValue(WrapInSingleQuotes(myFields(2))) ' Orig name
                    mySql.AddValue(WrapInSingleQuotes(LimitLength(myFields(3), 50))) ' Called number
                    mySql.AddValue(WrapInSingleQuotes(myFields(4))) ' Called name
                    mySql.AddValue(WrapInSingleQuotes(myFields(5))) ' Dest number
                    mySql.AddValue(WrapInSingleQuotes(myFields(6))) ' Dest name
                    mySql.AddValue(CombineDateAndTime(myFields(7), myFields(8))) ' Start time
                    mySql.AddValue(CombineDateAndTime(myFields(9), myFields(10))) ' Script connect time
                    mySql.AddValue(CombineDateAndTime(myFields(11), myFields(12))) ' Delivered time
                    mySql.AddValue(CombineDateAndTime(myFields(13), myFields(14))) ' Connect time
                    mySql.AddValue(CombineDateAndTime(myFields(15), myFields(16))) ' End time
                    mySql.AddValue(WrapInSingleQuotes(myFields(17))) ' Currency
                    mySql.AddValue(WrapInSingleQuotes(myFields(18))) ' Costs
                    mySql.AddValue(WrapInSingleQuotes(myFields(19))) ' State
                    mySql.AddValue(WrapInSingleQuotes(myFields(20))) ' Public access prefix
                    mySql.AddValue(WrapInSingleQuotes(myFields(21))) ' LCR provider
                    mySql.AddValue(WrapInSingleQuotes(myFields(22))) ' Project number
                    mySql.AddValue(WrapInSingleQuotes(myFields(23))) ' AOC
                    mySql.AddValue(WrapInSingleQuotes(myFields(24))) ' Origination device
                    mySql.AddValue(WrapInSingleQuotes(myFields(25))) ' Destination device
                    mySql.AddValue(WrapInSingleQuotes(myFields(26))) ' Transferred by number
                    mySql.AddValue(WrapInSingleQuotes(myFields(27))) ' Transferred by name
                    mySql.AddValue(myFields(28)) ' Transferred Call Id 1
                    mySql.AddValue(myFields(29)) ' Transferred Call Id 2
                    mySql.AddValue(myFields(30)) ' Transferred To Call Id
                    mySql.AddValue(CombineDateAndTime(myFields(31), myFields(32))) ' Transfer Time
                    mySql.AddValue(WrapInSingleQuotes(myFields(33))) ' Disconnect reason

                    ' Does this call already exist in the database for this customer ?
                    Dim z As String = "select * from " & cdrTableName & " where callId = " & myFields(0) & " and customerId = " & myCustomerId

                    recordsProcessed += 1

                    If FillTableFromCommand(myConnectionString, z, myTable) Then
                        If myTable.Rows.Count = 0 Then
                            If ExecuteNonQuery(myConnectionString, mySql.GetSQLStatement) Then
                                recordsAdded += 1
                            Else
                                'MsgBox("Error adding record from CSV for record: " & myLine)
                                hadError = True
                            End If
                        Else
                            recordsAlreadyThere += 1
                        End If
                    End If
                End If

                numberOfLines += 1
            End If
        End While

        y.Close()

        If hadError Then
            'MsgBox("CSV import complete but with errors: " & recordsProcessed & " calls processed, " & recordsAdded & " calls added, " & recordsAlreadyThere & " calls already in the database", MsgBoxStyle.Critical)
        Else
            'MsgBox("CSV import completed: " & recordsProcessed & " calls processed, " & recordsAdded & " calls added, " & recordsAlreadyThere & " calls already in the database")
        End If
    End Sub

    Private Function GetFields(ByRef p As String) As String()
        Dim myFields() As String = p.Split(",")

        For i = 0 To myFields.Count - 1
            myFields(i) = myFields(i).Trim(Chr(34))
        Next

        Return myFields
    End Function

    Private Function CombineDateAndTime(ByRef p_date As String, ByRef p_time As String) As String
        Dim x As String = "NULL"

        If p_date.Length = 10 And p_time.Length = 8 Then
            With p_date
                x = .Substring(6, 4) & "-" & .Substring(3, 2) & "-" & .Substring(0, 2) & " " & p_time
                x = WrapInSingleQuotes(x)
            End With
        End If

        Return x
    End Function

    Private Function LimitLength(ByRef p As String, ByVal p_maxLength As Integer) As String
        Dim x As String = p

        If p.Length > p_maxLength Then x = p.Substring(0, 50)

        Return x
    End Function
End Class