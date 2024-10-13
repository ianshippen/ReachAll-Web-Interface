<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="ReachAllWebInterface.aspx.vb" Inherits="ReachAllWebInterface._Default" %>
<! Main version consolidating BS additions>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" id="myHTML">

<head runat="server">
    <script type="text/javascript">
        function ReportRunFunction() {
            var x = window.innerWidth || root.clientWidth || body.clientWidth;
            document.getElementById("myWidth").value = x;
        }
    </script>

    <script type="text/javascript" src="sort.js"></script>
    <script type="text/javascript" src="canvasjs.min.js"></script>
    <script type="text/javascript" src="Chart.bundle.js"></script>
    <script type="text/javascript" src="webglCombined.js"></script>
    <script type="text/javascript" src="GraphUtils.js"></script>
    <asp:Literal id="styleLiteral" runat="server" />
    <title>ReachAll Web Interface</title>
    <style type="text/css">                                                   
    </style>
    <asp:Literal id="styleLiteral1" runat="server" />
</head>

<body id="myBody" runat="server">
    <br id="defaultHeaderId" />
    <div id="knowallHeaderId" style="border-bottom:1px dotted #666666; height:90px; position:relative; margin-bottom:40px; display:none;">
        <table width="700" border="0" cellspacing="0" cellpadding="0">
            <tr>
            <td width="320"><img src="assets/login_logo.png" alt="Login logo"/></td>
            <td><h1> ReachAll Call Reporting Interface</h1></td>
            </tr>
        </table>
    <img src="assets/logo_swyx_rec_logo.png" style="position:absolute; right:10px; top:20px;" alt="Swyx logo"/>
    </div>
    <div id="chartContainer" style="height: 800px; width: 100%; display:none;"></div>
    <asp:Literal id="Literal1" runat="server" />
    <form id="form1" runat="server">

    <!-- ************************************** -->
    <!-- The Login Panel for the legacy version -->
    <!-- ************************************** -->
    <asp:Panel id="loginPanel" visible="false" runat="server">
        <table class="loginTable" Align="center" CellSpacing="20">
	        <tr>
		        <td align = "Right" style="font-weight: bold">Username</td>
		        <td>
			        <asp:TextBox id="f_userName" runat="server" width="165" />
		        </td>
		    </tr>
		    
		    <tr>
		        <td align = "Right" style="font-weight: bold">Password</td>
		        <td>
			        <asp:TextBox id="f_password" textMode="Password" runat="server" width="165" />
		        </td>
		    </tr>
		    
		    <tr>
		        <td></td>
		        <td align="center">
			        <asp:Button id="loginButton" text = "Login" runat="server" OnClick="LoginPressed" />
		        </td>
		    </tr>
		    
		    <tr>
		        <td></td>
		        <td align="center">
		            <asp:Button id="changePasswordButton" text = "Change Password" runat="server" OnClick="ChangePasswordPressed" visible="false" />
		        </td>
		    </tr>
		    		    
		    <asp:TableRow Visible="false" ID="cpRow_1" runat="server">
                <asp:TableCell HorizontalAlign = "Right" style="font-weight: bold">New Password</asp:TableCell>
                <asp:TableCell>
			        <asp:TextBox id="newPasswordTextBox" runat="server" width="165" textMode="Password" />
		        </asp:TableCell></asp:TableRow><asp:TableRow Visible="false" ID="cpRow_2" runat="server">
                <asp:TableCell HorizontalAlign = "Right" style="font-weight: bold">Repeat New Password</asp:TableCell><asp:TableCell>
			        <asp:TextBox id="newPasswordAgainTextBox" runat="server" width="165" textMode="Password" />
		        </asp:TableCell></asp:TableRow><asp:TableRow Visible="false" ID="cpRow_3" runat="server">
                <asp:TableCell></asp:TableCell><asp:TableCell HorizontalAlign="Center">
                    <asp:Button id="confirmChangePasswordButton" text = "Confirm" runat="server" OnClick="ConfirmChangePasswordPressed" visible="true" />
                </asp:TableCell></asp:TableRow></table><table align="center"><tr><td><asp:Label ID="changePasswordResponseLegacy" Text = "" runat="server" /></td></tr></table>
   </asp:Panel>
    
    <!-- ********************************* -->
    <!-- The Login Panel for New Interface -->
    <!-- ********************************* -->
    <asp:Panel ID="loginPanelNewInterface" visible="false" runat="server">
        <!-- <div class="loginScreen"> -->
            <div class="modal-content">
               <div class="imgcontainer">
                    <img src="icons8-person-96.png" alt="Avatar" class="avatar"> </div><div class="container">
                    <label for="userNameNewInterface" class="SectionHeading">Username</label> <asp:TextBox id="userNameNewInterface" placeHolder="Enter Username" cssClass="newInterfaceInputClass" runat="server" />
                    <br />
                    <br />
                    <label for="passwordNewInterface" class="SectionHeading">Password</label> <asp:TextBox id="passwordNewInterface" placeHolder="Enter Password" textMode="Password" cssClass="newInterfaceInputClass" runat="server" />
                    <br />
                    <br />
                    <asp:Button id="loginButtonNewInterface" text="Login" runat="server" OnClick="LoginPressed" cssClass="button" />
                    <br />
                    <br />
		            <asp:Button id="changePasswordButtonNewInterface" text = "Change Password" runat="server" OnClick="ChangePasswordPressed" visible="false" cssClass="button" />
                    <asp:Label ID="changePasswordResponseNewInterface" Text = "" runat="server" />
                    <asp:Panel ID="changePasswordPanelNewInterface" visible="false" runat="server">
                        <label for="newPasswordTextBoxNewInterface" class="SectionHeading">New Password</label> &nbsp;<asp:TextBox 
                            ID="newPasswordTextBoxNewInterface" runat="server" 
                            cssClass="newInterfaceInputClass" placeholder="New Password" 
                            textMode="Password" /><br /><br /><label class="SectionHeading" 
                            for="newPasswordAgainTextBoxNewInterface">Confirm New Password</label>&nbsp;&nbsp;&nbsp;<asp:TextBox id="newPasswordAgainTextBoxNewInterface" placeholder="Confirm New Password" textMode="Password" cssClass="newInterfaceInputClass" runat="server" />
                        <br />
                        <br />
                        <asp:Button id="confirmChangePasswordButtonNewInterface" text ="Confirm" runat="server" OnClick="ConfirmChangePasswordPressed" cssClass="button" />
                    </asp:Panel>
                </div>
            </div>
        <!--</div>-->
    </asp:Panel>

    <!-- ***************************** -->
    <!-- The Login Panel for Bootstrap -->
    <!-- ***************************** -->
    <asp:Panel ID="loginPanelBS" runat="server" style="margin: auto; width:70%" Visible="false">
        <br />
        <div class="form-group">
            <label class="col-sm-2 col-sm-offset-3 control-label" for "f_bs_userName">Username</label> <div class="col-sm-2">
                <!-- <input class="form-control" type="text" id="f_bs_userName" value = "" runat="server" /> -->
                <asp:TextBox id="userNameBS" runat="server" />
            </div>
        </div>
        <br />
        <div class="form-group">
            <label class="col-sm-2 col-sm-offset-3 control-label" for "f_bs_password">Password</label> <div class="col-sm-2">
                <!-- <input class="form-control" type="password" id="f_bs_password" value = "" runat="server" /> -->
                <asp:TextBox ID="passwordBS" TextMode="Password" runat="server" />
            </div>
        </div>
        <br />
        <div class="form-group">
	        <div class="col-sm-2 col-sm-offset-5">
	        <asp:Button style="display: block; width: 100%;" class="btn btn-info" id="Button1" text = "Login" runat="server" OnClick="LoginPressed" />
	        </div>
        </div>
        <br />
        <div class="form-group">
	        <div class="col-sm-2 col-sm-offset-5">
	        <asp:Button style="display: block; width: 100%;" class="btn btn-warning" id="registerButton" text = "Register" runat="server" OnClick="RegisterPressed" visible="false" />
	        </div>
        </div>
        <asp:Panel ID="registerPanel" runat="server" Visible="false">
    	    <p style="text-align:center;">To register as a new user please enter your chosen username and password above and click the register button</p><p style="text-align:center;">Then re-enter your password and press Login</p></asp:Panel></asp:Panel><asp:Table id="responseTable" runat="server" class="responseTable" HorizontalAlign="center" CellSpacing="20" Visible="false">
        <asp:TableRow>
            <asp:TableCell>
                <asp:Label ID="changePasswordResponse" Text = "" runat="server" style="font-weight: bold"/>
            </asp:TableCell></asp:TableRow></asp:Table><asp:Panel id="myPanel" style="margin: 0 auto; width: 100%;" runat="server">
        <asp:HiddenField ID="myWidth" runat="server" />
    </asp:Panel>

    <!-- *************************************** -->
    <!-- The Action Panel for the legacy version -->
    <!-- *************************************** -->
    <asp:Panel id="legacyActionPanel" runat="server">
        <table id="legacyActionTable" cellpadding="5" align="Center" border="0">
	        <tr>
		        <td>
		            <div><p class="TableHeading">Action</p></div></td><td style="width:300px;"></td>
		        <td style="width:300px;"></td>
		        <td>
			        <asp:Button id="downloadButton" text="Download" onclick="downloadButtonPressed" runat="server" /></div>
			        <asp:Button id="ddDownLoadButton" text="Download" onclick="ddDownloadButtonPressed" visible="false" runat="server" />
		        </td>
		        <td>
		            <asp:Button id="csvDownLoadButton" Text="CSV Download" OnClick="csvDownLoadButtonPressed" runat="server" />
		            <asp:Button ID="ddCSVDownLoadButton" Text="CSV Download" OnClick="ddCSVDownLoadButtonPressed" visible="false" enabled="true" runat="server" />
		        </td>
		        <td>
			        <!input type="button" value="RealTime View" onclick="location.href='LiveView.aspx'" />
		        </td>
		        <td>
			        <asp:Button id="runReportButton" text="Run Report" OnClientClick="ReportRunFunction()" onClick="runReportButtonPressed" runat="server" />
		        </td>
		        <td>
		            <asp:PlaceHolder id="doneButtonPlaceHolder" visible="false" runat="server">
		                <!input type="button" value="Done" onclick="doneButtonPressed" />
		                <asp:Button id="doneButton" Text="Done" OnClick="doneButtonPressed" runat="server" />
		            </asp:PlaceHolder>
		        </td>
		        <td style="width:50px;">
		        </td>
            </tr>
        </table>
        <br />
    </asp:Panel>

    <!-- ************************************************* -->
    <!-- The Report Selection Panel for the legacy version -->
    <!-- ************************************************* -->
    <asp:Panel ID="legacyReportSelectionPanel" runat="server">
        <table id="legacyTimePeriodTable" cellpading="5" align="Center" border="0">
	        <tr>
		        <td>
			        <div><p class="TableHeading">Time Period</p></div></td></tr><tr>
		        <td valign="top" style="width:300px;">
			        <table width="100%">
				        <tr valign="middle">
					        <td><p class="TableText">Time Span</p><asp:DropDownList id="timeSpanDropDownList" width = "130" OnSelectedIndexChanged="timeSpanIndexChanged" AutoPostBack="true" runat="server" /></td>
					        <td valign="bottom"><br /><asp:CheckBox id="ignoreTimeCheckBox" checked="true" text="Ignore Time" cssclass="myClass" oncheckedchanged="IgnoreTimeCheckBoxChanged" AutoPostBack="true" runat="server" /></td>
				        </tr>
				        <tr valign="bottom">
					        <td><asp:Label id="label1" enabled="false" runat="server"><p class="TableText">Start Time</p></asp:Label><asp:DropDownList id="startTimeDropDownList" enabled="false" width="130" runat="server" /></td>
					        <td><asp:Label id="label2" enabled="false" runat="server"><p class="TableText">End Time</p></asp:Label><asp:DropDownList id="endTimeDropDownList" enabled="false" width="130" runat="server" /></td>
				        </tr>
			        </table>
		        </td>
		        <td style="width:300px;">
			        <asp:Calendar id="calendar1" caption="Start Date" BackColor="#e0e5f0" nextPrevFormat="shortmonth" cssclass="myClass" onVisibleMonthChanged="CalMonthChange" runat="server">
  	 		            <WeekendDayStyle BackColor="#d0d5e0" ForeColor="#ff0000" />
   			            <DayHeaderStyle ForeColor="#0000ff" />
   			            <TodayDayStyle BackColor="#f0f0ff" />
   			            <SelectedDayStyle BackColor="#22aa00" />
			        </asp:Calendar>
		        </td>
		        <td style="width:300px;">
			        <asp:Calendar id="calendar2" caption="End Date" BackColor="#e0e5f0" nextPrevFormat="shortmonth" cssclass="myClass" onVisibleMonthChanged="CalMonthChange" runat="server">
  	 		            <WeekendDayStyle BackColor="#d0d5e0" ForeColor="#ff0000" />
   			            <DayHeaderStyle ForeColor="#0000ff" />
   			            <TodayDayStyle BackColor="#f0f0ff" />
   			            <SelectedDayStyle BackColor="#22aa00" />
			        </asp:Calendar>
		        </td>
            </tr>
        </table>
        <br />

        <table id="legacyReportContentsTable" cellpadding="5" align="Center">
            <tr>
	            <td>
	                <p class="TableHeading">Report Contents</p></td><td>
                    <p class="TableText">
                        <asp:TextBox id="myTextBox" visible = "false" runat="server" /><asp:Label ID="myLabel" Visible = "false" Text = " DDI Filter" runat="server" />
	                    <table width="90%">
	                        <tr>
	                            <td>
	                                <asp:RadioButtonList ID="radioList1" repeatdirection="Horizontal" onSelectedIndexChanged="xxx" autopostback="true" CssClass="myClass" runat="server">
	                                    <asp:ListItem Selected="True">Sort By Number</asp:ListItem><asp:ListItem>Sort By Name</asp:ListItem></asp:RadioButtonList></td><td align="right">
	                                <asp:Button ID="clearSelectionButton" OnClick="clearSelectionButton_OnClick" text="Clear Selection" runat="server" />
	                            </td>
	                        </tr>
	                    </table>
	                </p>
                </td>
            </tr>
            <tr>
	            <td style="width:450px;" valign="top">
		            <p class="TableText">Group Name</p><asp:ListBox id="groupNameListBox" width="400" AutoPostBack="true" OnSelectedIndexChanged="GroupNameListBox_IndexChanged" runat="server" />
	            </td>
	            <td rowspan="2" style="width:450px;" valign="top">
		            <p class="TableText">Extensions To Report On</p><asp:ListBox id="selectedUsersListBox" width="400" height="180" selectionmode="multiple" OnDoubleClick="selectedUsersListBox_OnDoubleClick" runat="server" />
	            </td>
            </tr>
            <tr>
	            <td valign="top">
		            <p class="TableText"><asp:label ID="typeOfReportLabel" runat="server">Type Of Report</asp:label></p><asp:ListBox id="typeOfReportListBox" width="400" runat="server" />
	            </td>
            </tr>
        </table>
    </asp:Panel>

    <!-- ************************************** -->
    <!-- The Action Panel for the New Interface -->
    <!-- ************************************** -->
    <asp:Panel ID="newInterfaceActionPanel" runat="server">
        <table class="myTableClass">
            <tr>
                <td class="SectionHeading">Action</td><td></td><td></td>
            </tr>
            <tr align="center">
                <td style="width: 33.3%">
                    <asp:Button id="newInterfaceDownloadButton" text="Download" cssClass="ActionButtonClass" onclick="downloadButtonPressed" runat="server" />
	                <asp:Button id="newInterfaceDDDownloadButton" text="Download" cssClass="ActionButtonClass" onclick="ddDownloadButtonPressed" visible="false" runat="server" />
                </td>
                <td style="width: 33.3%">
                    <asp:Button ID="newInterfaceCSVDownloadButton" text="CSV Download" cssClass="ActionButtonClass" onclick="csvDownloadButtonPressed" runat="server" />
		            <asp:Button ID="newInterfaceDDCSVDownloadButton" Text="CSV Download" cssClass="ActionButtonClass" OnClick="ddCSVDownLoadButtonPressed" visible="false" enabled="true" runat="server" />
                </td>
                <td style="width: 33.3%">
                    <asp:Button ID="runReportButtonnewInterface" enabled="false" text="Run Report" cssClass="ActionButtonClass" OnClientClick="ReportRunFunction()" onClick="runReportButtonPressed" runat="server" />
                </td>
            </tr>
        </table>
        <br />
    </asp:Panel>
    
    <!-- ************************************************ -->
    <!-- The Report Selection panel for the new interface -->
    <!-- ************************************************ -->
    <asp:Panel ID="newInterfaceReportSelectionPanel" runat="server">
    <table class="myTableClass">
        <tr>
            <td class="SectionHeading">Time Period</td><td></td>
            <td></td>
        </tr>
        <tr align="center">
            <td style="height: 200px; width: 33.3%;">
                <!-- <table style="height: 222px;"> -->
<!--                <table style="height: 100%;"> Does not work in Chrome or IE -->
                <table style="height: 100%; border-collapse: collapse;">
                    <tr align="center" style="height: 50%">
                        <td style="vertical-align: top; width: 100%"><div class="SmallContainer">
                                <label for="timeSpanNewInterfaceDropDownList" class="LabelAbove">Time Span</label> <asp:DropDownList id="timeSpanNewInterfaceDropDownList" width = "200" OnSelectedIndexChanged="timeSpanIndexChanged" AutoPostBack="true" runat="server" />
                            </div>
                        </td>
                    </tr>
                    <tr style="vertical-align: bottom;">
                        <td>
                            <div class="SmallContainer">
                                <table width="100%">
                                    <tr>
                                        <td colspan="2"  style="text-align:center">
                                            <asp:CheckBox id="ignoreTimeNewInterfaceCheckBox" checked="true" text="Ignore Time" cssclass="myClass" oncheckedchanged="IgnoreTimeCheckBoxChanged" AutoPostBack="true" runat="server" />
                                        </td>
                                    </tr>
                                    <tr style="text-align:center">
                                        <td>
                                            <asp:label id="startTimeNewInterfaceLabel" for="startTimeNewInterfaceDropDownList" cssClass="LabelAbove" enabled="false" runat="server">Start Time</asp:label><asp:DropDownList id="startTimeNewInterfaceDropDownList" enabled="false" width="80" runat="server" />
                                        </td>
                                        <td>
                                            <asp:label id="endTimeNewInterfaceLabel" for="endTimeNewInterfaceDropDownList" cssClass="LabelAbove" enabled="false" runat="server">End Time</asp:label><asp:DropDownList id="endTimeNewInterfaceDropDownList" enabled="false" width="80" runat="server" />
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="width: 33.3%">
                <div class="LargeContainer">
                    <asp:Calendar id="calendar3" BorderStyle="None" BorderWidth="0" TitleStyle-BorderStyle="None" TitleStyle-BackColor="White" caption="Start Date" BackColor="#e0e5f0" nextPrevFormat="shortmonth" cssClass="CalendarClass" onVisibleMonthChanged="CalMonthChange" runat="server">
                        <WeekendDayStyle BackColor="#d0d5e0" ForeColor="#ff0000" />
                        <DayStyle Font-Size="11pt" />
                        <WeekendDayStyle BackColor="#d0d5e0" ForeColor="#ff0000" Font-Size="11pt" />
                        <DayHeaderStyle ForeColor="#0000ff" Font-Size="11pt"/>
                        <TodayDayStyle BackColor="#f0f0ff" />
                        <SelectedDayStyle BackColor="#5c6086" />
                        <NextPrevStyle Font-Size="11pt" ForeColor="#5c6086" />
                    </asp:Calendar>
                </div>
            </td>
            <td style="width: 33.3%">
                <div class="LargeContainer">
                    <asp:Calendar id="calendar4" BorderStyle="None" BorderWidth="0" TitleStyle-BorderStyle="None" TitleStyle-BackColor="White" caption="End Date" BackColor="#e0e5f0" nextPrevFormat="shortmonth" cssClass="CalendarClass" onVisibleMonthChanged="CalMonthChange" runat="server">
                        <WeekendDayStyle BackColor="#d0d5e0" ForeColor="#ff0000" />
                        <DayStyle Font-Size="11pt" />
                        <WeekendDayStyle BackColor="#d0d5e0" ForeColor="#ff0000" Font-Size="11pt" />
                        <DayHeaderStyle ForeColor="#0000ff" Font-Size="11pt"/>
                        <TodayDayStyle BackColor="#f0f0ff" />
                        <SelectedDayStyle BackColor="#5c6086" />
                        <NextPrevStyle Font-Size="11pt" ForeColor="#5c6086" />
                    </asp:Calendar>
                </div>
            </td>
        </tr>
    </table>
    <br />
    <table class="myTableClass">
        <tr>
            <td class="SectionHeading" style="width: 33.3%">Report Contents</td><td style="width: 33.3%; text-align:center;"></td>
            <td align="center" style="width: 33.3%">
                <asp:Button ID="clearSelectionButtonNewInterface" cssClass="SmallButtonClass" OnClick="clearSelectionButton_OnClick" text="Clear Extension Selection" runat="server" />        
                <asp:RadioButtonList ID="RadioButtonList1" repeatdirection="Horizontal" onSelectedIndexChanged="xxx" autopostback="true" CssClass="myClass" runat="server">
                <asp:ListItem Selected="True">Sort By Number</asp:ListItem><asp:ListItem>Sort By Name</asp:ListItem></asp:RadioButtonList></td></tr><tr align="center">
            <td style="width: 33.3%">
                <div class="ListContainer">
                    <label for="groupNameNewInterfaceListBox" class="LabelAbove">Group Name</label> <asp:ListBox id="groupNameNewInterfaceListBox" class="ListBoxClass" height="270" width="250" AutoPostBack="true" OnSelectedIndexChanged="GroupNameListBox_IndexChanged" runat="server" />
                </div>
            </td>
            <td style="width: 33.3%">
                <div class="ListContainer">
                    <label for="typeOfReportNewInterfaceListBox" class="LabelAbove">Report Name</label> <asp:ListBox id="typeOfReportNewInterfaceListBox" class="ListBoxClass" height="270" width="250" runat="server" />
                </div>
            </td>
            <td style="width: 33.3%">
                <div class="ListContainer">
                    <label for="selectedUsersNewInterfaceListBox" class="LabelAbove">Extensions To Report On</label> <asp:ListBox id="selectedUsersNewInterfaceListBox" class="ListBoxClass" height="270" width="250" selectionMode="multiple" runat="server" />
                </div>
            </td>
        </tr>
    </table>
</asp:Panel>

<!-- **************************************** -->
<!-- ** THE ACTION PANEL BOOTSTRAP VERSION ** -->
<!-- **************************************** -->
<asp:panel class="container-fluid" id="actionPanelBS" runat="server" Visible="false" style="margin:auto; width:100%">
    <div class="row" id="Div1">
        <div class="form-group col-sm-8">
           <div class="classWithPad">
           </div>
        </div>

        <div class="form-group col-sm-2">
           <div class="classWithPad">
                <label for="actionDownloadButton" class="control-label" visible="false" style="width:100%;">&nbsp;</label> <asp:Button style="display: block; width: 100%;" class="btn btn-warning" id="actionDownloadButton" text = "Download" runat="server" OnClick="downloadButtonPressed" />
           </div>
        </div>

        <div class="form-group col-sm-2">
           <div class="classWithPad">
                <label for="actionCSVDownloadButton" class="control-label" visible="false" style="width:100%;">&nbsp;</label> <asp:Button style="display: block; width: 100%;" class="btn btn-danger" id="actionCSVDownloadButton" text = "CSV Download" runat="server" OnClick="csvDownloadButtonPressed" />
            </div>
        </div>
    </div>
</asp:panel>


<!-- ******************************************* -->
<!-- ** THE DD ACTION PANEL BOOTSTRAP VERSION ** -->
<!-- ******************************************* -->
<asp:panel class="container-fluid" id="ddActionPanel" runat="server" Visible="false" style="margin:auto; width:100%">
    <div class="row" id="Div2">
        <div class="form-group col-sm-8">
           <div class="classWithPad">
           </div>
        </div>

        <div class="form-group col-sm-2">
           <div class="classWithPad">
                <label for="ddActionDownloadButton" class="control-label" visible="false" style="width:100%;">&nbsp;</label> <asp:Button style="display: block; width: 100%;" class="btn btn-warning" id="ddActionDownloadButton" text = "Download" runat="server" OnClick="ddDownloadButtonPressed" />
           </div>
        </div>

        <div class="form-group col-sm-2">
           <div class="classWithPad">
                <label for="ddActionCSVDownloadButton" class="control-label" visible="false" style="width:100%;">&nbsp;</label> <asp:Button style="display: block; width: 100%;" class="btn btn-danger" id="ddActionCSVDownloadButton" text = "CSV Download" runat="server" OnClick="ddCSVDownloadButtonPressed" />
            </div>
        </div>
    </div>
</asp:panel>


<!-- **************************************** -->
<!-- ** THE SEARCH PANEL BOOTSTRAP VERSION ** -->
<!-- **************************************** -->

<!-- Start Date   End Date    Download    CSV Download    Run Report   -->
<asp:panel class="container-fluid" id="searchPanel" runat="server" Visible="false" style="margin:auto; width:70%">
    <div class="row" id="row1">
        <div class="form-group col-xs-3 col-md-3">
            <div class="classWithPad">
                <label for="f_startDate" class="control-label">Start Date</label> <div class="input-group">
                    <input class="form-control" type="text" id="f_startDate" value = "" runat="server" /> <span class="input-group-addon goldBackgroundClass">dd/mm/yyyy</span> </div></div></div><div class="form-group col-xs-3 col-md-3">
            <div class="classWithPad">
                <label for="f_endDate" class="control-label">End Date</label> <div class="input-group">
                    <input class="form-control" type="text" id="f_endDate" value = "" runat="server" /> <span class="input-group-addon blueBackgroundClass">dd/mm/yyyy</span> </div></div></div><div class="form-group col-sm-2">
           <div class="classWithPad">
                <label for="Button2" class="control-label" visible="false" style="width:100%;">&nbsp;</label> <asp:Button style="display: block; width: 100%;" class="btn btn-warning" id="Button2" text = "Download" runat="server" OnClick="downloadButtonPressed" />
           </div>
        </div>

        <div class="form-group col-sm-2">
           <div class="classWithPad">
                <label for="Button3" class="control-label" visible="false" style="width:100%;">&nbsp;</label> <asp:Button style="display: block; width: 100%;" class="btn btn-danger" id="Button3" text = "CSV Download" runat="server" OnClick="csvDownloadButtonPressed" />
            </div>
        </div>

        <div class="form-group col-sm-2">
           <div class="classWithPad">
                <label for="Button4" class="control-label" visible="false" style="width:100%;">&nbsp;</label> <asp:Button style="display: block; width: 100%;" class="btn btn-info" id="Button4" text = "Run Report" runat="server" OnClick="runReportButtonPressed" />
            </div>
        </div>
    </div>

<!-- Calendar 1   Calendar 2    Start Time    End Time   Time Span   -->
<!--                              Logout      Clear All  Sort Extensions By  -->
    <div class="row" id="row2">
        <div class="form-group col-xs-3 col-md-3">
            <div class="classWithPad">
                <div class="LargeContainer">
                    <asp:Calendar class="form myCalendarClass goldBackgroundClass"  width="100%" id="bs_calendar1" BorderStyle="None" BorderWidth="0" TitleStyle-BorderStyle="None" TitleStyle-BackColor="White" TitleStyle-ForeColor="#d62c1a" nextPrevFormat="shortmonth" runat="server"><SelectedDayStyle BackColor="#d62c1a" Font-Bold="true" /></asp:Calendar>
                </div>
            </div>
        </div>
        
        <div class="form-group col-xs-3 col-md-3">
            <div class="classWithPad">  
                <div class="LargeContainer">
                <span class="myCalendarClass">
                    <asp:Calendar class="form myCalendarClass blueBackgroundClass" width="100%" id="bs_calendar2" BorderStyle="None" BorderWidth="0" TitleStyle-BorderStyle="None" TitleStyle-BackColor="White" TitleStyle-ForeColor="#d62c1a" nextPrevFormat="shortmonth" runat="server"><SelectedDayStyle BackColor="#d62c1a" Font-Bold="true" /></asp:Calendar>
                </span>
                </div>
            </div>
        </div>

        <div class="form-group col-sm-2">
            <div class="classWithPadTop">
                <label for="startTime" class="control-label">Start Time</label> <div class="styled-select">
                    <asp:DropDownList id="startTime" runat="server" Width="100%" />
                </div>
                
                <label for="timeMode" class="control-label">Time Mode</label> <div class="styled-select">
                    <asp:DropDownList id="timeModeDropDownList" runat="server" Width="100%" visible="true" DataTextField="">
                		<asp:ListItem>Time Span</asp:ListItem><asp:ListItem>Time Slice</asp:ListItem></asp:DropDownList></div><div class="buttonRowClass1"><asp:Button style="display: block; width: 100%;" class="btn btn-warning" id="logoutButton" text = "Logout" runat="server" OnClick="logoutButtonPressed" /></div>
            </div>
        </div>
        
        <div class="form-group col-sm-2">
            <div class="classWithPadTop">  
                <label for="endTime" class="control-label">End Time</label> <div class="styled-select">
                    <asp:DropDownList id="endTime" runat="server" Width="100%" />
                </div>
                
                <label for="sortExtensionsBy" class="control-label">Sort Extensions By</label> <div class="styled-select">
                    <asp:DropDownList id="sortExtensionsBy" runat="server" Width="100%" visible="true">
                        <asp:ListItem>Number</asp:ListItem><asp:ListItem>Name</asp:ListItem></asp:DropDownList></div><div class="buttonRowClass1"><asp:Button style="display: block; width: 100%;" class="btn btn-danger" id="Button5" text = "Clear All" OnClick="clearSelectionButton_OnClick" runat="server" /></div>
            </div>
        </div>
        
        <div class="form-group col-xs-2 col-md-2">
            <div class="classWithPadTop">
                <label for="timeSpan" class="control-label">Time Span</label> <div class="styled-select">
                    <asp:DropDownList id="timeSpan" runat="server" Width="100%" visible="true" OnSelectedIndexChanged="timeSpanIndexChanged" AutoPostBack="true" />
                </div>
            </div>
        </div>
    </div>

    <div class="row" id="row3">
        <div class="form-group col-xs-3 col-md-3">
            <div class="classWithPad">
                <label for="groupName" class="control-label">Group Name</label> <div class="styled-select LargeContainer">
                    <asp:ListBox id="groupName" runat="server" Width="100%" visible="true" onSelectedIndexChanged="GroupNameListBox_IndexChanged" AutoPostBack="true" Rows="10">
                    </asp:ListBox>
                </div>
            </div>
        </div>

        <div class="form-group col-xs-3 col-md-3">
            <div class="classWithPad">
                <label for="reportTy    pe" class="control-label">Report Type</label> <div class="styled-select LargeContainer">
                    <asp:ListBox id="reportType" runat="server" Width="100%" visible="true" onSelectedIndexChanged="reportType_IndexChanged" AutoPostBack="true" Rows="10">
                    </asp:ListBox>
                </div>
            </div>
        </div>

        <div class="form-group col-xs-3 col-md-3">
            <div class="classWithPad">
                <label for="reportedExtensions" class="control-label">Extensions To Report On</label> <div class="styled-select LargeContainer">
                    <asp:ListBox id="reportedExtensions" runat="server" Width="100%" selectionmode="multiple" visible="true" Rows="10">
                    </asp:ListBox>
                </div>
            </div>
        </div>

    <div class="form-group col-xs-1 col-mde-1">
    </div>

    <div class="form-group col-xs-2 col-md-2">
        <div class="classWithPad">
            <div class="col-xs-12" style="height:32px;"></div>
            <input type="file" name="fileUpload" id="fileUpload" runat="server" visible="false" /> <div class="buttonRowClass1"><asp:Button style="display: block; width: 100%;" class="btn btn-info" id="uploadButton" text = "Upload" OnClick="UploadButtonPressed" runat="server" OnClientClick="javascript:document.getElementById('cogs').style.visibility='visible'" visible="false" />
            </div>
        </div>

        <div class="classWithPad">
            <asp:Image ImageUrl="ajax-loader.gif" ID="cogs" style="visibility:hidden" runat="server" />
        </div>
    </div>
</div>
</asp:panel>
<asp:Literal id="logLiteral" runat="server" />
<asp:Literal id="myLiteral" runat="server" />
<asp:panel width="100%" class="container-fluid" id="reportPanel" runat="server" Visible="false">
    <asp:Literal id="Literal2" runat="server" />
</asp:panel>
</form>
</body>
</html>
