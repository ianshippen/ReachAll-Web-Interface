Module Local_Utilities
    Public Sub SetProgressBarMax(ByVal p As Integer)
    End Sub

    Public Sub SetProgressBarValue(ByVal ParseSQLStatement As Integer)
    End Sub

    Public Sub AgentStatusStart()
    End Sub

    Public Sub AgentStatusDelayedStart(ByVal int)
    End Sub

    ' Used for standalone mode only, called from RunIt()
    Public Sub WebInterfaceLoadAppInit()
        reportList.LoadFromFile(GetReachAllApplicationPath().CreateFullName(GetReportSettingsFilename(True)))
        globalDirectory.LoadFromXML(GetReachAllApplicationPath().CreateFullName(GetDirectoryFilename(True)))
        CDRSettings.LoadCDRSettings(GetReachAllApplicationPath().CreateFullName(GetCdrSettingsFilename(True)))
        Security.LoadSecuritySettings(GetReachAllApplicationPath().CreateFullName(GetSecuritySettingsFilename(True)))
        Tennants.LoadTennantSettings(GetReachAllApplicationPath().CreateFullName(GetTennantSettingsFilename(True)))
        SOC.SOCInit()
        WebColours.WebColoursInit()
        Options.LoadOptionFile(GetReachAllApplicationPath().CreateFullName(GetOptionSettingsFilename(True)))
        Options.LoadReportStyleSheet(GetReachAllApplicationPath().CreateFullName(GetReportStyleSheetFilename(True)))
        Options.LoadJavascriptSortCode(GetReachAllApplicationPath().CreateFullName(GetJavascriptSortCodeFilename(True)))
        'AgentStatusSettings.LoadAgentStatusSettings(GetReachAllApplicationPath() & "\" & GetAgentStatusSettingsFilename(True))
    End Sub

    ' Application and Service have real target in Jobs. This is our local sub to compile with
    Public Sub RunJob(ByVal p_nameValuePairList As NameValuePairList)
    End Sub

    Public Function GetDatabaseConfigStringForSecurity()
        Return CreateConnectionString(CDRSettings.cdrMultiSiteSettingsList(0).settingsConfigDictionary)
    End Function
End Module
