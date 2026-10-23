# GastroMatch AR — protótipo de reconhecimento de ingredientes

Projeto Unity 6.3 para Android. A câmera mostra a imagem ao vivo, o modelo TFLite classifica um ingrediente e a interface sugere um preparo.

## Abrir

No Unity Hub, selecione **Add > Add project from disk** e escolha esta pasta. Abra com Unity `6000.3.22f1`. Na primeira abertura, aguarde o Unity instalar os pacotes e criar a cena inicial; ela aparece em `Assets/Scenes/GastroMatchAR.unity` depois da importação.

## Rodar no Android

1. Abra a cena `Assets/Scenes/GastroMatchAR.unity`.
2. Em **File > Build Profiles**, selecione Android e confirme que a cena está na lista.
3. Conecte um Android com depuração USB ativada e escolha **Build and Run**.
4. Permita acesso à câmera no primeiro uso.

O módulo Android Build Support já estava instalado no Unity encontrado neste computador. Para testar a câmera, use um celular; a janela Game do Editor depende de uma webcam no computador.

## Modelo

O modelo veio de `converted_tflite.zip`. O projeto guarda `model_unquant.tflite` e `labels.txt` em `Assets/Resources/Models/`. A inferência roda no próprio aparelho com Unity Sentis. As sugestões de preparo são demonstrações locais para o protótipo.

Esta primeira versão mostra a câmera ao vivo e uma ficha de preparo por cima da imagem. O modelo classifica o ingrediente que ocupa a maior parte do enquadramento; ele não localiza vários ingredientes nem fixa objetos virtuais em superfícies. Essas melhorias podem ser adicionadas depois com detecção de objetos e AR Foundation/ARCore.

## Classes

`Tomate`, `Cebola`, `Ovo`, `Nenhum deles`.

As fotos usadas no treino são só uma amostra inicial; com poucas imagens, o resultado pode oscilar. Para melhorar, adicione imagens variadas no Teachable Machine, treine novamente e substitua o modelo e as labels.
