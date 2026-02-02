package com.medienstation.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebSettings; // <--- NEU (+)

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DirectPrinterPlugin.class);
        super.onCreate(savedInstanceState);

        // 1. Display anlassen
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // 2. WebView Einstellungen holen
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();

        // 3. WICHTIG: Autoplay erlauben! (+)
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 4. Debugging
        WebView.setWebContentsDebuggingEnabled(true);
    }
}