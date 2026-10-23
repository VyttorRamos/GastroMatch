using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
using Unity.InferenceEngine;

#if UNITY_ANDROID
using UnityEngine.Android;
#endif

public sealed class GastroMatchARApp : MonoBehaviour
{
    private const int InputSize = 224;
    private const float ScanInterval = 0.9f;
    private const float ConfidenceThreshold = 0.48f;

    private static readonly Color Red = new Color32(188, 25, 9, 255);
    private static readonly Color Orange = new Color32(228, 129, 30, 255);
    private static readonly Color Yellow = new Color32(241, 203, 82, 255);
    private static readonly Color OffWhite = new Color32(250, 243, 212, 255);
    private static readonly Color Ink = new Color32(51, 37, 30, 255);

    private readonly Dictionary<string, string> instructions = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { "Tomate", "Sugestão: molho caseiro. Pique o tomate, refogue com temperos e cozinhe até encorpar." },
        { "Cebola", "Sugestão: cebola dourada. Fatie, cozinhe em fogo baixo com um fio de óleo e mexa até amaciar." },
        { "Ovo", "Sugestão: omelete simples. Bata os ovos, tempere e cozinhe em uma frigideira aquecida." },
        { "Nenhum deles", "Aponte para tomate, cebola ou ovo para ver uma sugestão de preparo." }
    };

    private RawImage cameraImage;
    private Text statusText;
    private Text ingredientText;
    private Text confidenceText;
    private Text instructionText;
    private Text footerText;
    private WebCamTexture webcam;
    private Worker worker;
    private Model runtimeModel;
    private string[] labels = Array.Empty<string>();
    private float nextScanAt;
    private bool cameraStarting;

    private void Awake()
    {
        Screen.orientation = ScreenOrientation.Portrait;
        Screen.sleepTimeout = SleepTimeout.SystemSetting;
        BuildInterface();
        LoadModel();
    }

    private void Start()
    {
        StartCoroutine(StartCamera());
    }

    private void OnDestroy()
    {
        if (webcam != null && webcam.isPlaying)
            webcam.Stop();
        worker?.Dispose();
    }

    private void BuildInterface()
    {
        var canvasObject = new GameObject("AR Interface", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
        var canvas = canvasObject.GetComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvas.sortingOrder = 10;
        var scaler = canvasObject.GetComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1080, 1920);
        scaler.matchWidthOrHeight = 0.5f;

        cameraImage = MakeRawImage("Camera Preview", canvas.transform, Vector2.zero, Vector2.one, Color.white);
        cameraImage.raycastTarget = false;

        MakePanel("Header", canvas.transform, new Vector2(0, 0.84f), Vector2.one, new Color32(250, 243, 212, 230));
        MakePanel("Recipe Card", canvas.transform, Vector2.zero, new Vector2(1, 0.31f), new Color32(255, 254, 237, 242));

        MakeText("Brand", canvas.transform, "GastroMatch  |  COZINHA EM AR", new Vector2(0.07f, 0.925f), new Vector2(0.93f, 0.98f), Red, 38, FontStyle.Bold, TextAnchor.MiddleLeft);
        statusText = MakeText("Status", canvas.transform, "Preparando câmera e modelo...", new Vector2(0.07f, 0.86f), new Vector2(0.93f, 0.92f), Ink, 25, FontStyle.Normal, TextAnchor.MiddleLeft);

        MakeReticle(canvas.transform);

        MakeText("Card eyebrow", canvas.transform, "INGREDIENTE RECONHECIDO", new Vector2(0.07f, 0.255f), new Vector2(0.93f, 0.295f), Orange, 22, FontStyle.Bold, TextAnchor.MiddleLeft);
        ingredientText = MakeText("Ingredient", canvas.transform, "Aponte para um ingrediente", new Vector2(0.07f, 0.19f), new Vector2(0.93f, 0.255f), Ink, 44, FontStyle.Bold, TextAnchor.MiddleLeft);
        confidenceText = MakeText("Confidence", canvas.transform, "", new Vector2(0.07f, 0.15f), new Vector2(0.93f, 0.19f), Red, 24, FontStyle.Bold, TextAnchor.MiddleLeft);
        instructionText = MakeText("Instructions", canvas.transform, "A câmera vai mostrar uma ideia de preparo.", new Vector2(0.07f, 0.065f), new Vector2(0.93f, 0.15f), Ink, 26, FontStyle.Normal, TextAnchor.UpperLeft);
        footerText = MakeText("Footer", canvas.transform, "PROTÓTIPO GASTROMATCH AR", new Vector2(0.07f, 0.018f), new Vector2(0.93f, 0.055f), Red, 18, FontStyle.Bold, TextAnchor.MiddleCenter);
    }

    private void LoadModel()
    {
        var modelAsset = Resources.Load<ModelAsset>("Models/model_unquant");
        var labelAsset = Resources.Load<TextAsset>("Models/labels");
        if (modelAsset == null)
        {
            SetStatus("Modelo não encontrado. Confirme Assets/Resources/Models/model_unquant.tflite.");
            return;
        }

        runtimeModel = ModelLoader.Load(modelAsset);
        worker = new Worker(runtimeModel, BackendType.CPU);
        labels = labelAsset == null
            ? new[] { "Tomate", "Cebola", "Ovo", "Nenhum deles" }
            : ParseLabels(labelAsset.text);
        SetStatus("Modelo carregado. Preparando a câmera...");
    }

    private static string[] ParseLabels(string content)
    {
        return content.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(line =>
            {
                var separator = line.IndexOf(' ');
                return separator >= 0 ? line.Substring(separator + 1).Trim() : line.Trim();
            })
            .ToArray();
    }

    private IEnumerator StartCamera()
    {
        if (cameraStarting)
            yield break;
        cameraStarting = true;

#if UNITY_ANDROID
        if (!Permission.HasUserAuthorizedPermission(Permission.Camera))
        {
            Permission.RequestUserPermission(Permission.Camera);
            var timeout = Time.realtimeSinceStartup + 20f;
            while (!Permission.HasUserAuthorizedPermission(Permission.Camera) && Time.realtimeSinceStartup < timeout)
                yield return null;
        }

        if (!Permission.HasUserAuthorizedPermission(Permission.Camera))
        {
            SetStatus("A permissão da câmera é necessária para reconhecer ingredientes.");
            cameraStarting = false;
            yield break;
        }
#endif

        var devices = WebCamTexture.devices;
        if (devices == null || devices.Length == 0)
        {
            SetStatus("Nenhuma câmera encontrada. Teste em um celular Android.");
            cameraStarting = false;
            yield break;
        }

        var cameraDevice = devices.FirstOrDefault(device => !device.isFrontFacing);
        if (string.IsNullOrEmpty(cameraDevice.name))
            cameraDevice = devices[0];

        webcam = new WebCamTexture(cameraDevice.name, 640, 480, 20);
        cameraImage.texture = webcam;
        webcam.Play();

        var cameraTimeout = Time.realtimeSinceStartup + 15f;
        while (webcam.width < 100 && Time.realtimeSinceStartup < cameraTimeout)
            yield return null;

        if (webcam.width < 100)
            SetStatus("A câmera não iniciou. Feche e abra o app novamente.");
        else
        {
            cameraImage.rectTransform.localEulerAngles = new Vector3(0, 0, -webcam.videoRotationAngle);
            if (webcam.videoVerticallyMirrored)
                cameraImage.rectTransform.localScale = new Vector3(1, -1, 1);
            SetStatus(worker == null ? "A câmera iniciou, mas o modelo não carregou." : "Câmera pronta. Aponte para um ingrediente.");
        }

        cameraStarting = false;
    }

    private void Update()
    {
        if (worker == null || webcam == null || !webcam.isPlaying || !webcam.didUpdateThisFrame || Time.unscaledTime < nextScanAt)
            return;

        nextScanAt = Time.unscaledTime + ScanInterval;
        try
        {
            var output = ClassifyCurrentFrame();
            if (output == null || output.Length == 0)
                return;

            var bestIndex = 0;
            for (var i = 1; i < output.Length; i++)
                if (output[i] > output[bestIndex]) bestIndex = i;

            var label = bestIndex < labels.Length ? labels[bestIndex] : "Ingrediente";
            var confidence = output[bestIndex];
            if (confidence < ConfidenceThreshold)
            {
                ingredientText.text = "Não reconheci ainda";
                confidenceText.text = $"Confiança {confidence:P0}";
                instructionText.text = "Tente aproximar o ingrediente e deixar o fundo mais simples.";
                return;
            }

            ingredientText.text = label;
            confidenceText.text = $"Confiança {confidence:P0}";
            instructionText.text = instructions.TryGetValue(label, out var suggestion)
                ? suggestion
                : "Experimente apontar para tomate, cebola ou ovo.";
        }
        catch (Exception exception)
        {
            SetStatus("Falha na leitura do modelo. Confira a Console do Unity.");
            Debug.LogException(exception);
        }
    }

    private float[] ClassifyCurrentFrame()
    {
        var pixels = webcam.GetPixels32();
        var width = webcam.width;
        var height = webcam.height;
        if (pixels == null || pixels.Length < width * height)
            return null;

        var side = Mathf.Min(width, height);
        var offsetX = (width - side) / 2f;
        var offsetY = (height - side) / 2f;
        var values = new float[InputSize * InputSize * 3];

        for (var y = 0; y < InputSize; y++)
        {
            var sourceY = Mathf.Clamp(Mathf.RoundToInt(offsetY + ((y + 0.5f) / InputSize) * side), 0, height - 1);
            for (var x = 0; x < InputSize; x++)
            {
                var sourceX = Mathf.Clamp(Mathf.RoundToInt(offsetX + ((x + 0.5f) / InputSize) * side), 0, width - 1);
                var pixel = pixels[sourceY * width + sourceX];
                var target = (y * InputSize + x) * 3;

                // Teachable Machine image models expect RGB float values normalized to [-1, 1].
                values[target] = pixel.r / 127.5f - 1f;
                values[target + 1] = pixel.g / 127.5f - 1f;
                values[target + 2] = pixel.b / 127.5f - 1f;
            }
        }

        using (var input = new Tensor<float>(new TensorShape(1, InputSize, InputSize, 3), values))
        {
            worker.Schedule(input);
            var result = worker.PeekOutput() as Tensor<float>;
            return result == null ? null : result.DownloadToArray();
        }
    }

    private void MakeReticle(Transform parent)
    {
        var reticle = MakePanel("Ingredient Focus", parent, new Vector2(0.33f, 0.43f), new Vector2(0.67f, 0.57f), new Color(0, 0, 0, 0));
        var image = reticle.GetComponent<Image>();
        image.color = new Color(1, 1, 1, 0);
        image.raycastTarget = false;
        reticle.GetComponent<RectTransform>().sizeDelta = Vector2.zero;

        var label = MakeText("Focus Hint", parent, "ENQUADRE O INGREDIENTE", new Vector2(0.2f, 0.385f), new Vector2(0.8f, 0.425f), OffWhite, 20, FontStyle.Bold, TextAnchor.MiddleCenter);
        label.color = Color.white;
        MakePanel("Focus Hint Background", parent, new Vector2(0.16f, 0.38f), new Vector2(0.84f, 0.43f), new Color32(51, 37, 30, 190)).transform.SetAsFirstSibling();
    }

    private static Image MakePanel(string name, Transform parent, Vector2 anchorMin, Vector2 anchorMax, Color color)
    {
        var item = new GameObject(name, typeof(RectTransform), typeof(Image));
        item.transform.SetParent(parent, false);
        var rect = item.GetComponent<RectTransform>();
        rect.anchorMin = anchorMin;
        rect.anchorMax = anchorMax;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;
        var image = item.GetComponent<Image>();
        image.color = color;
        image.raycastTarget = false;
        return image;
    }

    private static RawImage MakeRawImage(string name, Transform parent, Vector2 anchorMin, Vector2 anchorMax, Color color)
    {
        var item = new GameObject(name, typeof(RectTransform), typeof(RawImage));
        item.transform.SetParent(parent, false);
        var rect = item.GetComponent<RectTransform>();
        rect.anchorMin = anchorMin;
        rect.anchorMax = anchorMax;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;
        var image = item.GetComponent<RawImage>();
        image.color = color;
        image.raycastTarget = false;
        return image;
    }

    private static Text MakeText(string name, Transform parent, string value, Vector2 anchorMin, Vector2 anchorMax, Color color, int size, FontStyle style, TextAnchor alignment)
    {
        var item = new GameObject(name, typeof(RectTransform), typeof(Text));
        item.transform.SetParent(parent, false);
        var rect = item.GetComponent<RectTransform>();
        rect.anchorMin = anchorMin;
        rect.anchorMax = anchorMax;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;

        var text = item.GetComponent<Text>();
        text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        text.text = value;
        text.color = color;
        text.fontSize = size;
        text.fontStyle = style;
        text.alignment = alignment;
        text.horizontalOverflow = HorizontalWrapMode.Wrap;
        text.verticalOverflow = VerticalWrapMode.Truncate;
        text.raycastTarget = false;
        return text;
    }

    private void SetStatus(string value)
    {
        if (statusText != null)
            statusText.text = value;
        Debug.Log(value);
    }
}
