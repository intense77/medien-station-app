package com.medienstation.app; // Das MUSS die erste Zeile sein

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import androidx.print.PrintHelper;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DirectPrinter")
public class DirectPrinterPlugin extends Plugin {

    @PluginMethod
    public void printBase64(PluginCall call) {
        String base64String = call.getString("data");
        String jobName = call.getString("name", "News-Print-Job");

        if (base64String == null) {
            call.reject("Keine Daten empfangen");
            return;
        }

        try {
            // 1. Base64 Header entfernen
            if (base64String.contains(",")) {
                base64String = base64String.split(",")[1];
            }

            // 2. String in Bytes umwandeln
            byte[] decodedString = Base64.decode(base64String, Base64.DEFAULT);

            // 3. Bytes in ein Bitmap (Bild) umwandeln
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

            if (bitmap == null) {
                call.reject("Bild konnte nicht dekodiert werden");
                return;
            }

            // 4. Drucken auf dem UI Thread
            getActivity().runOnUiThread(() -> {
                PrintHelper photoPrinter = new PrintHelper(getContext());
                photoPrinter.setScaleMode(PrintHelper.SCALE_MODE_FIT);
                photoPrinter.printBitmap(jobName, bitmap);

                call.resolve();
            });

        } catch (Exception e) {
            call.reject("Fehler beim Drucken: " + e.getMessage());
        }
    }
}
