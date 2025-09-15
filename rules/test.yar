
rule Windows_PE {
    meta:
        description = "Windows PE executable"
    strings:
        $mz = { 4D 5A }
        $pe = "PE"
    condition:
        $mz at 0 and $pe
}

rule Suspicious_API_Calls {
    meta:
        description = "Suspicious Windows API calls"
    strings:
        $api1 = "CreateProcess" nocase
        $api2 = "VirtualAlloc" nocase
        $api3 = "WriteProcessMemory" nocase
        $api4 = "LoadLibrary" nocase
        $api5 = "GetProcAddress" nocase
        $api6 = "WinExec" nocase
        $api7 = "ShellExecute" nocase
    condition:
        any of them
}
