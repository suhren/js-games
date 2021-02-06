
## Issues


### Compiler Error
I got the following error when starting Unity for the first time:

```
Microsoft (R) Visual C# Compiler version 2.9.1.65535 (9d34608e)
Copyright (C) Microsoft Corporation. All rights reserved.
```

In [this post](https://answers.unity.com/questions/1590611/i-have-an-error-that-i-dont-recognize-or-know-how.html) by lavos2300 it was suggested to remove the following registry key:

```
Computer\HKEY_CURRENT_USER\SOFTWARE\Microsoft\Command Processor\Autorun
```

This had the value `"C:\Users\Adam\Anaconda3\condabin\conda_hook.bat"` which seems to have been left after an uninstallation of Anaconda and Python from before. For some reason this caused the above issue. After removing it, the error was gone!

### Visual Studio Project Problem

I noticed that IntelliSense was not working in Visual Studio for the Unity API. I also noticed that Visual Studio was not generating a new project in the right sidebar of the IDE. I found the solution to this issue [here](https://forum.unity.com/threads/solved-unity-not-generating-sln-file-from-assets-open-c-project.538487/) by Stardog. The issue was solved by:
* Opening `Edit > Preferences > External Tools` in Unity
* Changing `Open by file extension` to the full path to Visual Studio. In my case `"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\IDE\devenv.exe"`
* Reopening the script in Visual Studio through the Unity UI.

### Import error

After modifying a script while Unity was running, I got the following error:

```
Copying assembly from 'Temp/Assembly-CSharp.dll' to 'Library/ScriptAssemblies/Assembly-CSharp.dll' failed
```

This was solved by right-clicking the script file in Unity and choosing `"Reimport"` ([syedhasan1964, 2018](https://forum.unity.com/threads/solved-copying-assembly-temp-assembly-csharp-dll-failed.552682/)).

### Run WebGL server

If you get the error

```
It seems your browser does not support running Unity WebGL content from file:// urls. Please upload it to an http server, or try a different browser.
```

when trying to open the `index.html` in the WebGL build of the game, you can instead run a simple HTTP server to serve the game locally ([Charles, 2020](https://stackoverflow.com/questions/62517962/how-do-i-run-a-local-unity-webgl-file-url-build)):

```
python -m http.server --cgi 8360
```

Then open `localhost:8360` in the web browser.