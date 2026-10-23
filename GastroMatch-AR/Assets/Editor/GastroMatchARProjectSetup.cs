using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

[InitializeOnLoad]
internal static class GastroMatchARProjectSetup
{
    private const string ScenePath = "Assets/Scenes/GastroMatchAR.unity";

    static GastroMatchARProjectSetup()
    {
        EditorApplication.delayCall += EnsureStarterScene;
    }

    private static void EnsureStarterScene()
    {
        if (EditorApplication.isCompiling || EditorApplication.isUpdating)
        {
            EditorApplication.delayCall += EnsureStarterScene;
            return;
        }

        if (File.Exists(ScenePath))
        {
            if (EditorBuildSettings.scenes.Length == 0)
                EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            return;
        }

        Directory.CreateDirectory("Assets/Scenes");
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var root = new GameObject("GastroMatch AR");
        root.AddComponent<GastroMatchARApp>();
        EditorSceneManager.SaveScene(scene, ScenePath);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };

        PlayerSettings.productName = "GastroMatch AR";
        PlayerSettings.SetApplicationIdentifier(BuildTargetGroup.Android, "com.gastromatch.ar");
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;

        if (BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.Android, BuildTarget.Android))
            EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.Android, BuildTarget.Android);

        Debug.Log("GastroMatch AR: cena inicial criada. Abra a cena e use Build And Run para testar no Android.");
    }
}
