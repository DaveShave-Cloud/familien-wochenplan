import {Config} from '@remotion/cli/config';

// Ausgabe laut Produktionsauftrag: MP4, H.264, yuv420p, AAC, 1920x1080, 30 fps.
Config.setEntryPoint('./src/index.ts');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
// BT.709 mit normalem Wertebereich – sonst entsteht „yuvj420p“, das manche Abspieler falsch darstellen.
Config.setColorSpace('bt709');
Config.setCrf(18);
// PNG-Einzelbilder: sauberere Schrift und kleinere Datei als JPEG-Zwischenbilder.
Config.setVideoImageFormat('png');
Config.setAudioCodec('aac');
Config.setAudioBitrate('256k');
Config.setOverwriteOutput(true);

// Nur für Umgebungen ohne Internetzugriff auf Remotions eigenen Browser-Download:
// REMOTION_BROWSER_EXECUTABLE=/pfad/zu/chrome-headless-shell
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
