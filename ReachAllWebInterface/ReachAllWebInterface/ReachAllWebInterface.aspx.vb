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
    Dim myAspect As New InterfaceAspectClass

    ' This is only used for the Bootstrap version
    Sub logoutButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        loginPanelBS.Visible = True
        searchPanel.Visible = False
        f_bs_userName.Value = ""
    End Sub

    ' This is only used for the Bootstrap version
    Sub reportType_IndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        If Not groupName.SelectedItem Is Nothing Then
            Dim orderByString As String = ""

            If sortExtensionsBy.SelectedIndex = 1 Then orderByString = "&orderBy=Name"

            reportedExtensions.Items.Clear()
            ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(groupName.SelectedItem.ToString()) & "&userName=" & myAspect.userNameTextBox.Text & orderByString))
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
            myAspect.selectedUsersListBox.ClearSelection()
        End If
    End Sub

    Sub xxx(ByVal sender As Object, ByVal e As EventArgs)
        With myAspect
            If Not .groupNameListBox.SelectedItem Is Nothing Then
                Dim orderByString As String = ""

                If .orderByRadioList.SelectedIndex = 1 Then orderByString = "&orderBy=Name"

                .selectedUsersListBox.Items.Clear()
                ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(.groupNameListBox.SelectedItem.ToString()) & "&userName=" & myAspect.userNameTextBox.Text & orderByString))
            End If
        End With
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
        GroupNameListBox_IndexChangedHandler()
    End Sub

    Sub GroupNameListBox_IndexChangedHandler(Optional ByRef p_groupName As String = Nothing)
        With myAspect
            Dim orderByString As String = ""

            If .orderByRadioList.SelectedIndex = 1 Then orderByString = "&orderBy=Name"
            If p_groupName Is Nothing Then p_groupName = .groupNameListBox.SelectedItem.ToString

            .runReportButton.Enabled = False
            .typeOfReportListBox.Items.Clear()
            .selectedUsersListBox.Items.Clear()
            ReadXML1(RunIt("Operation=GetReportsForEntity&entity=" & AmpersandEncode(p_groupName)))
            ReadXML2(RunIt("Operation=GetUsersForEntity&entity=" & AmpersandEncode(p_groupName) & "&userName=" & myAspect.userNameTextBox.Text & orderByString))

            If .typeOfReportListBox.Items.Count > 0 Then
                .typeOfReportListBox.Items(0).Selected = True
            End If

            .runReportButton.Enabled = True
        End With
    End Sub

    Sub IgnoreTimeCheckBoxChanged(ByVal sender As Object, ByVal e As EventArgs)
        IgnoreTimeCheckBoxChanged_Handler()
    End Sub

    Sub IgnoreTimeCheckBoxChanged_Handler()
        Dim flag As Boolean = True

        With myAspect
            If .ignoreTimeCheckbox.Checked Then flag = False

            .startTimeDropDownList.Enabled = flag
            .endTimeDropDownList.Enabled = flag
            .startTimeLabel.Enabled = flag
            .endTimeLabel.Enabled = flag
        End With
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
        With myAspect
            Select Case .timeSpanDropDownList.SelectedIndex
                Case 0
                    ' This hour
                    .ignoreTimeCheckbox.Checked = False
                    .startTimeDropDownList.SelectedIndex = Now.Hour
                    .endTimeDropDownList.SelectedIndex = .startTimeDropDownList.SelectedIndex
                    .startDateCalendar.SelectedDate = Today
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate

                Case 1
                    ' Previous hour
                    .ignoreTimeCheckbox.Checked = False
                    .endTimeDropDownList.SelectedIndex = (Now.Hour - 1) Mod 24
                    .startTimeDropDownList.SelectedIndex = (.startTimeDropDownList.SelectedIndex - 1) Mod 24
                    .startDateCalendar.SelectedDate = Today
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate

                Case 2
                    ' Today
                    .ignoreTimeCheckbox.Checked = True
                    .startDateCalendar.SelectedDate = Today
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate

                Case 3
                    ' Yesterday
                    .ignoreTimeCheckbox.Checked = True
                    .startDateCalendar.SelectedDate = Today.AddDays(-1)
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate

                Case 4
                    ' Last 7 days
                    .ignoreTimeCheckbox.Checked = True
                    .startDateCalendar.SelectedDate = Today.AddDays(-7)
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate.AddDays(6)

                Case 5
                    ' Last week (Mon - Sun)
                    .ignoreTimeCheckbox.Checked = True
                    .startDateCalendar.SelectedDate = Today.AddDays(-(6 + CInt(Today.DayOfWeek)))
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate.AddDays(6)

                Case 6
                    ' Last 30 days
                    .ignoreTimeCheckbox.Checked = True
                    .startDateCalendar.SelectedDate = Today.AddDays(-30)
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate.AddDays(29)

                Case 7
                    ' Last month
                    .ignoreTimeCheckbox.Checked = True
                    .startDateCalendar.SelectedDate = Today.AddDays(-Today.Day)
                    .endDateCalendar.SelectedDate = .endDateCalendar.SelectedDate.AddDays(1 - Date.DaysInMonth(.endDateCalendar.SelectedDate.Year, .endDateCalendar.SelectedDate.Month))

                Case 8
                    .ignoreTimeCheckbox.Checked = False
                    .startTimeDropDownList.SelectedIndex = Now.Hour
                    .endTimeDropDownList.SelectedIndex = (.startTimeDropDownList.SelectedIndex + 1) Mod 24
                    .startDateCalendar.SelectedDate = Today
                    .endDateCalendar.SelectedDate = .startDateCalendar.SelectedDate
            End Select
        End With

        IgnoreTimeCheckBoxChanged_Handler()
    End Sub

    Private Sub DoSessionTimeoutStuff()
        searchPanel.Visible = False
        'actionTable.Visible = False
        'timePeriodTable.Visible = False
        'reportContentsTable.Visible = False
        loginPanel.Visible = False
        loginPanelNewInterface.Visible = False
        loginPanelBS.Visible = False

        legacyActionPanel.Visible = False
        newInterfaceActionPanel.Visible = False
        actionPanelBS.Visible = False
        ddActionPanel.Visible = False

        legacyReportSelectionPanel.Visible = False
        newInterfaceReportSelectionPanel.Visible = False
        searchPanel.Visible = False

        ReportingWebInterfaceInitialiseConfig()

        If usingBootstrap Then
            Literal2.Text = "Your session has timed out. You can either navigate to the start of your session using the navigator Back Button, or click <a href=" & WrapInQuotes(reportingWebInterfaceConfigDictionary.GetItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.ourHomePage))) & ">here</a> to start a new session"
        Else
            myLiteral.Text = ""

            If usingNewInterface Then myLiteral.Text &= "<br /><br /><br /><br /><br /><br />"

            myLiteral.Text &= "Your session has timed out. You can either navigate to the start of your session using the navigator Back Button, or click <a href=" & WrapInQuotes(reportingWebInterfaceConfigDictionary.GetItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.ourHomePage))) & ">here</a> to start a new session"
        End If
    End Sub

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As EventArgs) Handles Me.Load
        Dim doCommonFirstPageLoadStuff As Boolean = False
        Dim optionsXMLFilename As String = ""
        Dim multiUser As Boolean = False

        With myAspect
            If LAB_MODE Then
                optionsXMLFilename = "c:\inetpub\wwwroot\ReachAllWebInterface\" & GetOptionsFilename(True)
            End If

            Logutil.MyLiteralRef = logLiteral
            Target.SetTarget(TargetType.REPORTING_WEB_INTERFACE)
            Options.LoadOptionsAsXML(optionsXMLFilename)
            ReportingWebInterfaceInitialiseConfig()

            multiUser = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.multiUser))

            If multiUser Then
                registerButton.Visible = True
                registerPanel.Visible = True
                uploadButton.Visible = True
                'uploadLabel.Visible = True
            End If

            ' Bootstrap option is no longer supported ..
            usingBootstrap = optionSettingsConfigDictionary.GetBooleanItem("useBootstrap")
            usingNewInterface = optionSettingsConfigDictionary.GetBooleanItem("useNewInterface")

            If usingBootstrap Then
                .startDateCalendar = bs_calendar1
                .endDateCalendar = bs_calendar2
                .startTimeDropDownList = startTime
                .endTimeDropDownList = endTime
                .timeSpanDropDownList = timeSpan
                .myLiteral = Literal2
                .groupNameListBox = groupName
                .typeOfReportListBox = reportType
                .selectedUsersListBox = reportedExtensions
                .runReportButton = Button4
                .userNameTextBox = userNameBS
                .passwordTextBox = passwordBS
                .loginPanel = loginPanelBS
                .actionPanel = actionPanelBS
                .reportSelectionPanel = searchPanel
                .styleSheet = "bootstrapStyleSheet.css"
            Else
                If usingNewInterface Then
                    .startDateCalendar = calendar3
                    .endDateCalendar = calendar4
                    .ignoreTimeCheckbox = ignoreTimeNewInterfaceCheckBox
                    .startTimeDropDownList = startTimeNewInterfaceDropDownList
                    .endTimeDropDownList = endTimeNewInterfaceDropDownList
                    .startTimeLabel = startTimeNewInterfaceLabel
                    .endTimeLabel = endTimeNewInterfaceLabel
                    .timeSpanDropDownList = timeSpanNewInterfaceDropDownList
                    .myLiteral = myLiteral
                    .groupNameListBox = groupNameNewInterfaceListBox
                    .typeOfReportListBox = typeOfReportNewInterfaceListBox
                    .selectedUsersListBox = selectedUsersNewInterfaceListBox
                    .orderByRadioList = RadioButtonList1
                    .runReportButton = runReportButtonnewInterface
                    .downloadButton = newInterfaceDownloadButton
                    .csvDownloadButton = newInterfaceCSVDownloadButton
                    .ddDownloadButton = newInterfaceDDDownloadButton
                    .ddCSVDownloadButton = newInterfaceDDCSVDownloadButton
                    .userNameTextBox = userNameNewInterface
                    .passwordTextBox = passwordNewInterface
                    .loginPanel = loginPanelNewInterface
                    .actionPanel = newInterfaceActionPanel
                    .reportSelectionPanel = newInterfaceReportSelectionPanel
                    .styleSheet = "ReachAllReportStyleSheetNewInterface.css"
                    .changePasswordButton = changePasswordButtonNewInterface
                    .newPasswordTextBox = newPasswordTextBoxNewInterface
                    .newPasswordAgainTextBox = newPasswordAgainTextBoxNewInterface
                    .changePasswordResponseLabel = changePasswordResponseNewInterface
                    .backgroundColour = "#EEEEEE"
                Else
                    .startDateCalendar = calendar1
                    .endDateCalendar = calendar2
                    .ignoreTimeCheckbox = ignoreTimeCheckBox
                    .startTimeDropDownList = startTimeDropDownList
                    .endTimeDropDownList = endTimeDropDownList
                    .startTimeLabel = label1
                    .endTimeLabel = label2
                    .timeSpanDropDownList = timeSpanDropDownList
                    .myLiteral = myLiteral
                    .groupNameListBox = groupNameListBox
                    .typeOfReportListBox = typeOfReportListBox
                    .selectedUsersListBox = selectedUsersListBox
                    .orderByRadioList = radioList1
                    .runReportButton = runReportButton
                    .downloadButton = downloadButton
                    .csvDownloadButton = csvDownLoadButton
                    .ddDownloadButton = ddDownLoadButton
                    .ddCSVDownloadButton = ddCSVDownLoadButton
                    .userNameTextBox = f_userName
                    .passwordTextBox = f_password
                    .loginPanel = loginPanel
                    .actionPanel = legacyActionPanel
                    .reportSelectionPanel = legacyReportSelectionPanel
                    .styleSheet = "ReachAllReportStyleSheet.css"
                    .changePasswordButton = changePasswordButton
                    .newPasswordTextBox = newPasswordTextBox
                    .newPasswordAgainTextBox = newPasswordAgainTextBox
                    .changePasswordResponseLabel = changePasswordResponseLegacy
                    .backgroundColour = TABLE_BACKGROUND_COLOUR
                End If
            End If

            If usingBootstrap Then
                styleLiteral.Text &= CreateStyleSheetLink("bootstrap.min.css")
                styleLiteral.Text &= CreateStyleSheetLink("bootstrapStyleSheet.css")
                Literal1.Text = vbCrLf & "<h2><span class=" & WrapInQuotes(myTextClasses(0)) & ">ReachAll</span> <span class=" & WrapInQuotes(myTextClasses(1)) & ">Reporting</span> <span class=" & WrapInQuotes(myTextClasses(2)) & ">Interface</span></h2>"
                form1.Attributes("class") = "form-horizontal"
                styleLiteral1.Text = "<style>select option:checked, select option:hover {box-shadow: 0 0 10px 100px #d62c1a inset;}</style>"
            Else
                styleLiteral.Text = CreateStyleSheetLink(.styleSheet)
                'styleLiteral1.Text = "<style>select option:checked, option:active, option:focus, option:selected {box-shadow: 0 0 10px 100px #26A0DA inset;} select option:hover {box-shadow: 0 0 10px 100px #DEDEDE inset;}</style>"
            End If

            If UsingNewSecurity(False) Then
                .changePasswordButton.Visible = True
            End If

            Dim hotelBillingMode As Boolean = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.hotelBillingMode))

            If hotelBillingMode Then
                'timeSpanLabel.Visible = False
                timeSpanDropDownList.Visible = False
                ignoreTimeCheckBox.Visible = False
                ignoreTimeCheckBox.Checked = False
                startTimeDropDownList.Enabled = True
                endTimeDropDownList.Enabled = True
                'timePeriodLabel.Text = "Hotel Room Occupancy Time"
                'groupNameLabel.Visible = False
                groupNameListBox.Visible = False
                typeOfReportListBox.Visible = False
                'extensionsToReportLabel.Text = "Room to bill"
                typeOfReportLabel.Visible = False
                'reportContentsLabel.Visible = False
                clearSelectionButton.Visible = False
                selectedUsersListBox.SelectionMode = ListSelectionMode.Single
                runReportButton.Text = "Generate Bill"
            End If

            If NEW_LOGIN Then
                .changePasswordButton.Visible = True
            End If

            If Page.IsPostBack Then LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "Postback (non first time load)")

            'myTables.Add(actionTable)
            'myTables.Add(timePeriodTable)
            'myTables.Add(reportContentsTable)

            If Request.QueryString.Count > 0 Then
                ' User wants to drill down into a particular user or service

                If Not Page.IsPostBack Then
                    LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "First time load with Request.QueryString = " & WrapInQuotes(Request.QueryString.ToString))

                    If Session(LINK_TEXT) Is Nothing Then
                        DoSessionTimeoutStuff()
                    Else
                        Dim myString As String = ""

                        doCommonFirstPageLoadStuff = True
                        legacyActionPanel.Visible = False
                        legacyReportSelectionPanel.Visible = False
                        newInterfaceActionPanel.Visible = False
                        newInterfaceReportSelectionPanel.Visible = False

                        myAspect.reportSelectionPanel.Visible = False
                        'doneButtonPlaceHolder.Visible = True
                        myAspect.runReportButton.Visible = False
                        myAspect.downloadButton.Visible = False
                        myAspect.csvDownloadButton.Visible = False
                        myAspect.actionPanel.Visible = True
                        myAspect.reportSelectionPanel.Visible = False

                        myString = Request.QueryString.ToString
                        Session(DRILL_DOWN_TARGET_TEXT) = myString

                        myAspect.ddDownloadButton.Visible = True
                        myAspect.ddCSVDownloadButton.Visible = True

                        myAspect.loginPanel.Visible = False

                        If Not usingNewInterface Then myBody.Attributes(BACKGROUND_COLOUR_STRING) = "#" & webColourArray(WebColours.WebColours.PageBackGround).value

                        Dim myText As String = RunIt(System.Web.HttpUtility.UrlDecode(myString))

                        myAspect.myLiteral.Text = myText
                    End If  ' If Session(LINK_TEXT) Is Nothing
                End If ' If Not Page.IsPostBack
            Else ' If Request.QueryString.Count > 0
                ' IsPostBack() returns False on first page load
                If Not Page.IsPostBack Then
                    ' This is the first page load, set everything up
                    LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "First time load. Version " & OUR_VERSION)
                    doCommonFirstPageLoadStuff = True

                    loginPanel.Visible = False
                    loginPanelNewInterface.Visible = False
                    legacyActionPanel.Visible = False
                    legacyReportSelectionPanel.Visible = False
                    newInterfaceActionPanel.Visible = False
                    newInterfaceReportSelectionPanel.Visible = False

                    .loginPanel.Visible = True
                    .actionPanel.Visible = False
                    .reportSelectionPanel.Visible = False
                    .startDateCalendar.SelectedDate = Today
                    .endDateCalendar.SelectedDate = Today
                    .groupNameListBox.Items.Clear()

                    ' Populate the time control drop downs
                    For i = 0 To 23
                        Dim myString As String = ""

                        If i < 10 Then myString = "0"

                        myString &= i & ":"
                        .startTimeDropDownList.Items.Add(myString & "00")

                        If hotelBillingMode Then
                            If myString = "00:" Then myString = "24:"

                            .endTimeDropDownList.Items.Add(myString & "00")
                        Else
                            .endTimeDropDownList.Items.Add(myString & "59")
                        End If
                    Next

                    For i = 0 To timeSpans.Length - 1
                        .timeSpanDropDownList.Items.Add(timeSpans(i))
                    Next

                    .timeSpanDropDownList.SelectedIndex = 2

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
                If myAspect.loginPanel.Visible Then
                    If Not usingNewInterface Then myBody.Attributes(BACKGROUND_COLOUR_STRING) = myAspect.backgroundColour
                End If

                'If myVisible Then myBody.Attributes(BACKGROUND_COLOUR_STRING) = "#EEEEEE"

                For i = 0 To myTables.Count - 1
                    myTables(i).Style.Item(CSS_BACKGROUND_COLOUR_STRING) = TABLE_BACKGROUND_COLOUR
                    myTables(i).Attributes.Add("width", "900")
                Next
            End If
        End With

        LogInfo("ReachAllWebInterface.aspx.vb::Page_Load()", "Exited")
    End Sub

    Sub ChangePasswordPressed(ByVal Source As Object, ByVal e As EventArgs)
        If myAspect.userNameTextBox.Text = "Admin" Then
            myAspect.changePasswordResponseLabel.Text = "Cannot change Admin password"
        Else
            myAspect.changePasswordResponseLabel.Text = ""

            If CheckLogin() Then
                If usingNewInterface Then myAspect.changePasswordButton.Visible = False

                ShowChangePasswordRows(True)
            End If
        End If
    End Sub

    Sub ShowChangePasswordRows(ByVal p As Boolean)
        If usingNewInterface Then
            changePasswordPanelNewInterface.Visible = p
        Else
            cpRow_1.Visible = p
            cpRow_2.Visible = p
            cpRow_3.Visible = p
        End If
    End Sub

    Sub ConfirmChangePasswordPressed(ByVal Source As Object, ByVal e As EventArgs)
        Dim myIndex As Integer = securityList.GetIndexOfUser(myAspect.userNameTextBox.Text)
        Dim allOk As Boolean = False
        Dim myResponse As String = ""

        If myIndex >= 0 Then
            Dim currentPassword As String = securityList.GetPasswordFromIndex(myIndex)

            If IsNewPasswordOK(currentPassword, myAspect.newPasswordTextBox.Text, myAspect.newPasswordAgainTextBox.Text, myResponse) Then
                If UpdatePassword(myAspect.userNameTextBox.Text, myAspect.newPasswordTextBox.Text) Then
                    myResponse = "Password updated successfully - please login with new password"
                    allOk = True
                Else
                    myResponse = "Password could not be updated"
                End If
            End If
        Else
            myresponse = "Error in locating user"
        End If

        ShowChangePasswordRows(False)
        myAspect.changePasswordResponseLabel.Text = myResponse

        If allOk Then myAspect.changePasswordButton.Visible = False
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
        myAspect.changePasswordResponseLabel.Text = ""

        If CheckLogin() Then DoLoginOK()
    End Sub

    Function CheckLogin() As Boolean
        Dim myUserName As String = myAspect.userNameTextBox.Text
        Dim myPassword As String = myAspect.passwordTextBox.Text

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

        With myAspect
            If Not usingNewInterface Then myBody.Attributes(BACKGROUND_COLOUR_STRING) = "#" & webColourArray(WebColours.WebColours.PageBackGround).value

            .loginPanel.Visible = False
            .actionPanel.Visible = True
            .reportSelectionPanel.Visible = True

            ' Get the entities that this user can report on
            ReadXML(RunIt("Operation=GetAgentEntities&userName=" & .userNameTextBox.Text))

            If .groupNameListBox.Items.Count > 0 Then
                If hotelBillingMode Then
                    GroupNameListBox_IndexChangedHandler("Hotel Rooms")
                Else
                    .groupNameListBox.Items(0).Selected = True
                    GroupNameListBox_IndexChangedHandler()
                End If
            End If
        End With
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

        'timePeriodTable.Visible = True
        'reportContentsTable.Visible = True
        runReportButton.Visible = True
        runReportButtonNewInterface.Visible = True

        If Session(REPORT_SELECTOR_TEXT) IsNot Nothing Then
            Dim x As New DateTime
            Dim y As New Date

            x = DateTime.FromBinary(Session(REPORT_SELECTOR_TEXT))
            y = Now.AddDays(-130)

            myAspect.startDateCalendar.SelectedDate = y
        End If
    End Sub

    Sub runReportButtonPressed(ByVal Source As Object, ByVal e As EventArgs)
        With myAspect
            '       Response.Write("The .NET version is " & System.Environment.Version.ToString())
            Dim browserWidth As String = myWidth.Value
            Dim i As Integer
            Dim myKeyArray(.selectedUsersListBox.Items.Count - 1)
            Dim myCount As Integer = 0
            Dim startDateAndTimeString, endDateAndTimeString As String
            Dim myNameValuePairList As New NameValuePairList
            Dim hotelBillingMode As Boolean = reportingWebInterfaceConfigDictionary.GetBooleanItem([Enum].GetName(GetType(ReportingWebInterfaceConfigItems), ReportingWebInterfaceConfigItems.hotelBillingMode))
            Dim myUserName As String = .userNameTextBox.Text

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

            startDateAndTimeString = FormatDateISO(.startDateCalendar.SelectedDate) & " "
            endDateAndTimeString = FormatDateISO(.endDateCalendar.SelectedDate) & " "

            If myAspect.ignoreTimeCheckbox.Checked Then
                startDateAndTimeString &= "00:00:00"
                endDateAndTimeString &= "23:59:59"
            Else
                Dim x As String = .endTimeDropDownList.SelectedItem.ToString

                startDateAndTimeString &= .startTimeDropDownList.SelectedItem.ToString & ":00"

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

            ' Has a subset of members of the selected entity been selected ?
            For i = 0 To .selectedUsersListBox.Items.Count - 1
                If .selectedUsersListBox.Items(i).Selected Then
                    myCount += 1
                End If
            Next

            myNameValuePairList.SetValueForName("StartDateAndTime", startDateAndTimeString)
            myNameValuePairList.SetValueForName("EndDateAndTime", endDateAndTimeString)

            If hotelBillingMode Then
                If myCount = 1 Then
                    myNameValuePairList.SetValueForName("Key.Number", GetFirstField(.selectedUsersListBox.SelectedItem.ToString))
                    myNameValuePairList.SetValueForName(KEY_NAME_STRING, GetSecondField(.selectedUsersListBox.SelectedItem.ToString))
                End If
            Else
                If myCount = 0 Then
                    ' No. Add all of them, or no key list at all ?
                    Dim addAllKeysIfNoneSelected As Boolean = False

                    If addAllKeysIfNoneSelected Then
                        Dim myKeyList As String = ""

                        For i = 0 To .selectedUsersListBox.Items.Count - 1
                            If i > 0 Then myKeyList &= ","

                            myKeyList &= GetFirstField(.selectedUsersListBox.Items(i).ToString)
                        Next

                        myNameValuePairList.SetValueForName("KeyList", myKeyList)
                    End If
                Else
                    Dim firstOne As Boolean = True
                    Dim myKeyList As String = ""

                    For i = 0 To .selectedUsersListBox.Items.Count - 1
                        If .selectedUsersListBox.Items(i).Selected Then
                            If myKeyList.Length > 0 Then myKeyList &= ","

                            myKeyList &= GetFirstField(.selectedUsersListBox.Items(i).ToString)
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
                myNameValuePairList.SetValueForName("Entity", .groupNameListBox.SelectedItem.ToString)
                myNameValuePairList.SetValueForName("ReportType", .typeOfReportListBox.SelectedItem.ToString)
            End If

            If myTextBox.Text.Length > 0 Then myNameValuePairList.SetValueForName("ddiFilter", myTextBox.Text)

            Session(LINK_TEXT) = myNameValuePairList.AsString
            Session(DRILL_DOWN_TARGET_TEXT) = ""

            Dim myCustomerId As Integer = GetMultiUserCustomerId(myUserName)

            If myCustomerId >= 0 Then
                myNameValuePairList.SetValueForName("multiUserCustomerId", myCustomerId)
            End If

            Dim myText As String = RunIt(myNameValuePairList.AsString)

            .myLiteral.Text = myText
            Session(REPORT_SELECTOR_TEXT) = .startDateCalendar.SelectedDate.ToBinary
            .reportSelectionPanel.Visible = False
            .runReportButton.Visible = False
            ' Test stuff ...
            'Response.ContentType = "img/jpeg"
            'globalBitmap.GetSystemBitmap.Save(Response.OutputStream, Imaging.ImageFormat.Jpeg)

            'loginTable.Visible = False ???
        End With
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

            Dim myText As String = RunIt(commandString)

            'myText = InsertCSSFileContents(myText, myAspect.styleSheet)

            Response.Write(myText)
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
        Dim myUserName As String = myAspect.userNameTextBox.Text

        commandString &= myUserName

        startDateAndTimeString = FormatDateISO(myAspect.startDateCalendar.SelectedDate) & " "
        endDateAndTimeString = FormatDateISO(myAspect.endDateCalendar.SelectedDate) & " "

        'timePeriodTable.Visible = False
        'reportContentsTable.Visible = False
        ' doneButtonPlaceHolder.Visible = True
        'actionTable.Visible = False

        If ignoreTimeCheckBox.Checked Then
            startDateAndTimeString &= "00:00:00"
            endDateAndTimeString &= "23:59:59"
        Else
            Dim x As String = myAspect.endTimeDropDownList.SelectedItem.ToString

            startDateAndTimeString &= myAspect.startTimeDropDownList.SelectedItem.ToString & ":00"

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

        For i = 0 To myAspect.selectedUsersListBox.Items.Count - 1
            If myAspect.selectedUsersListBox.Items(i).Selected Then
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
                commandString &= "&" & KEY_NAME_STRING & "=" & GetSecondField(selectedUsersListBox.SelectedItem.ToString)
            End If
        Else
            commandString &= "&ReportType=" & myAspect.typeOfReportListBox.SelectedItem.ToString & "&Entity=" & myAspect.groupNameListBox.SelectedItem.ToString
            commandString &= "&TopLevelReport=True"

            If myCount = 0 Then
                commandString &= "&KeyList="

                For i = 0 To myAspect.selectedUsersListBox.Items.Count - 1
                    If i > 0 Then commandString &= ","

                    commandString &= GetFirstField(myAspect.selectedUsersListBox.Items(i).ToString)
                Next
            Else
                Dim firstOne As Boolean = True

                commandString &= "&KeyList="

                For i = 0 To myAspect.selectedUsersListBox.Items.Count - 1
                    If myAspect.selectedUsersListBox.Items(i).Selected Then
                        If firstOne Then
                            firstOne = False
                        Else
                            commandString &= ","
                        End If

                        commandString &= GetFirstField(myAspect.selectedUsersListBox.Items(i).ToString)
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

        Dim myText As String = RunIt(commandString)

        'myText = InsertCSSFileContents(myText, myAspect.styleSheet)

        Response.Write(myText)
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
            myAspect.groupNameListBox.Items.Add(item)
        Next
    End Sub

    Sub ReadXML1(ByRef p As String)
        Dim MyList As List(Of String) = BasicXMLToList(p)

        For Each item As String In MyList
            myAspect.typeOfReportListBox.Items.Add(item)
        Next
    End Sub

    Sub ReadXML2(ByRef p As String)
        Dim MyList As List(Of String) = BasicXMLToList(p)

        With myAspect
            For Each item As String In MyList
                .selectedUsersListBox.Items.Add(item)
            Next

            ' ???
            If .selectedUsersListBox.SelectionMode = ListSelectionMode.Single Then
                If .selectedUsersListBox.Items.Count > 0 Then .selectedUsersListBox.SelectedIndex = 0
            End If
        End With
    End Sub

    Public Sub SendImage(ByRef p_bitmapImage As Bitmap)
        Response.ContentType = "img/bmp"
        p_bitmapImage.Save(Response.OutputStream, Imaging.ImageFormat.Bmp)
    End Sub

    Sub RegisterPressed(ByVal Source As Object, ByVal e As EventArgs)
        ' Do we have a username and password ?
        Dim myUserName As String = myAspect.userNameTextBox.Text
        Dim myPassword As String = myAspect.passwordTextBox.Text

        myAspect.changePasswordResponseLabel.Text = ""
        WebInterfaceLoadAppInit()

        If myUserName <> "" Then
            If myPassword <> "" Then
                ' Check that the username is not already registered
                Dim mySql As String = "select * from " & MULTI_USER_TABLE_NAME
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
                    myAspect.changePasswordResponseLabel.Text = "This user name is already taken"
                Else
                    mySql = "insert into " & MULTI_USER_TABLE_NAME & " values (" & WrapInSingleQuotes(SingleQuoteCheck(myUserName)) & ", " & WrapInSingleQuotes(SingleQuoteCheck(myPassword)) & ")"
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
        Dim myCustomerId As Integer = GetMultiUserCustomerId(myAspect.userNameTextBox.Text)

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

    Private Function InsertCSSFileContents(ByRef p_source As String, ByRef p_cssFilename As String) As String
        Dim result As String = p_source
        Dim myApplicationPath As String = GetApplicationPath().GetPath
        Dim myReader As IO.StreamReader = Nothing
        Dim foundError As Boolean = False

        If Not myApplicationPath.EndsWith("\") Then myApplicationPath &= "\"

        Try
            myReader = New IO.StreamReader(myApplicationPath & p_cssFilename)

        Catch e As Exception
            foundError = True
        End Try

        If Not foundError Then
            Dim myCSSText As String = myReader.ReadToEnd
            Dim myString As String = "<style type=" & WrapInQuotes("text/css") & ">"
            Dim myIndex As Integer = p_source.IndexOf(myString)

            myReader.Close()

            If myIndex >= 0 Then
                result = p_source.Substring(0, myIndex + myString.Length) & vbCrLf & myCSSText & p_source.Substring(myIndex + myString.Length)
            End If
        End If

        Return result
    End Function
End Class