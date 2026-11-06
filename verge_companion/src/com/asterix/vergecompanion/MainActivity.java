package com.asterix.vergecompanion;

import android.app.Activity;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.text.format.Formatter;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Start Companion Service
        Intent serviceIntent = new Intent(this, CompanionService.class);
        startService(serviceIntent);

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(30, 30, 30, 30);

        TextView title = new TextView(this);
        title.setText("Verge Companion");
        title.setTextSize(20);
        title.setTextColor(0xFFFFFFFF);
        layout.addView(title);

        TextView status = new TextView(this);
        status.setText("\nStatus: Server Active (Port 8080)\nAnti-GhostTouch: Ready\n");
        status.setTextSize(14);
        status.setTextColor(0xFF00E676);
        layout.addView(status);

        try {
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            if (wm != null) {
                String ip = Formatter.formatIpAddress(wm.getConnectionInfo().getIpAddress());
                TextView ipView = new TextView(this);
                ipView.setText("Watch IP: " + ip);
                ipView.setTextSize(16);
                ipView.setTextColor(0xFFFFEB3B);
                layout.addView(ipView);
            }
        } catch (Exception ignored) {}

        setContentView(layout);
    }
}

