package com.asterix.vergecompanion;

import android.app.Service;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.IBinder;
import android.os.Parcelable;
import android.os.PowerManager;
import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;

public class CompanionService extends Service {
    private static final String TAG = "VergeCompanion";
    private static final int PORT = 8080;

    private ServerSocket serverSocket;
    private Thread serverThread;
    private boolean isRunning = false;
    private int lastSportCode = 2;
    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "CompanionService created");

        // Keep CPU & WiFi active so watch stays connected to phone hotspot
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "VergeCompanion:WakeLock");
                wakeLock.acquire();
            }

            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                if (!wm.isWifiEnabled()) {
                    wm.setWifiEnabled(true);
                }
                wifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "VergeCompanion:WifiLock");
                wifiLock.acquire();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error acquiring locks", e);
        }

        // Start periodic WiFi watchdog
        startWatchdog();

        // Start HTTP API server
        startHttpServer();
    }

    private void startWatchdog() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                while (isRunning) {
                    try {
                        Thread.sleep(30000);
                        WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                        if (wm != null && !wm.isWifiEnabled()) {
                            Log.w(TAG, "Watchdog detected WiFi disabled, re-enabling...");
                            wm.setWifiEnabled(true);
                        }
                    } catch (InterruptedException e) {
                        break;
                    } catch (Exception ignored) {}
                }
            }
        }).start();
    }

    private void startHttpServer() {
        isRunning = true;
        serverThread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    serverSocket = new ServerSocket(PORT);
                    Log.i(TAG, "HTTP Server listening on port " + PORT);

                    while (isRunning) {
                        Socket client = serverSocket.accept();
                        handleClient(client);
                    }
                } catch (Exception e) {
                    if (isRunning) {
                        Log.e(TAG, "Server socket error", e);
                    }
                }
            }
        });
        serverThread.start();
    }

    private void handleClient(final Socket client) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    client.setSoTimeout(5000);
                    BufferedReader reader = new BufferedReader(new InputStreamReader(client.getInputStream()));
                    OutputStream os = client.getOutputStream();

                    String line = reader.readLine();
                    if (line == null || line.isEmpty()) {
                        client.close();
                        return;
                    }

                    Log.i(TAG, "Request: " + line);
                    String[] parts = line.split(" ");
                    String method = parts.length > 0 ? parts[0] : "GET";
                    String uri = parts.length > 1 ? parts[1] : "/";

                    // Handle CORS Preflight
                    if ("OPTIONS".equalsIgnoreCase(method)) {
                        sendHttpResponse(os, 200, "{\"cors\":\"ok\"}");
                        client.close();
                        return;
                    }

                    String path = uri;
                    Map<String, String> queryParams = new HashMap<String, String>();
                    int qIdx = uri.indexOf('?');
                    if (qIdx != -1) {
                        path = uri.substring(0, qIdx);
                        String qs = uri.substring(qIdx + 1);
                        for (String pair : qs.split("&")) {
                            String[] kv = pair.split("=");
                            if (kv.length == 2) {
                                queryParams.put(kv[0].toLowerCase(), kv[1].toLowerCase());
                            } else if (kv.length == 1) {
                                queryParams.put(kv[0].toLowerCase(), "");
                            }
                        }
                    }

                    if ("/ping".equals(path) || "/status".equals(path)) {
                        String json = "{\"status\":\"ok\",\"device\":\"Amazfit Verge\",\"model\":\"A1811\",\"service\":\"active\"}";
                        sendHttpResponse(os, 200, json);
                    } else if ("/start".equals(path) || "/sport".equals(path)) {
                        String sportType = queryParams.get("type");
                        if (sportType == null) sportType = queryParams.get("sport");
                        if (sportType == null) sportType = "walking";

                        int sportCode = 2; // Default walking
                        if ("outdoor_run".equals(sportType) || "run".equals(sportType) || "running".equals(sportType) || "1".equals(sportType)) {
                            sportCode = 1;
                        } else if ("walking".equals(sportType) || "walk".equals(sportType) || "2".equals(sportType)) {
                            sportCode = 2;
                        } else if ("treadmill".equals(sportType) || "indoor_run".equals(sportType) || "3".equals(sportType)) {
                            sportCode = 3;
                        } else if ("outdoor_cycling".equals(sportType) || "cycling".equals(sportType) || "bike".equals(sportType) || "7".equals(sportType)) {
                            sportCode = 7;
                        } else if ("elliptical".equals(sportType) || "6".equals(sportType)) {
                            sportCode = 6;
                        }

                        boolean direct = "1".equals(queryParams.get("direct")) || "true".equals(queryParams.get("direct"));
                        boolean lockTouch = "1".equals(queryParams.get("lock")) || "true".equals(queryParams.get("lock"));

                        lastSportCode = sportCode;
                        triggerSport(sportCode, direct);

                        if (lockTouch) {
                            setTouchEnabled(false);
                        }

                        String json = "{\"status\":\"started\",\"sport_code\":" + sportCode + ",\"sport_type\":\"" + sportType + "\",\"direct\":" + direct + ",\"touch_locked\":" + lockTouch + "}";
                        sendHttpResponse(os, 200, json);
                    } else if ("/click".equals(path) || "/tap".equals(path) || "/go".equals(path)) {
                        // Directly launch SportActivity to bypass GPS and begin recording immediately
                        triggerSport(lastSportCode, true);
                        try {
                            Runtime.getRuntime().exec("input tap 180 180");
                        } catch (Exception ignored) {}
                        sendHttpResponse(os, 200, "{\"status\":\"started\",\"sport_code\":" + lastSportCode + ",\"mode\":\"direct\"}");
                    } else if ("/heartrate".equals(path) || "/measure_hr".equals(path) || "/bpm".equals(path)) {
                        wakeScreen();
                        try {
                            Intent intent = new Intent();
                            intent.setComponent(new ComponentName("com.huami.watch.health", "com.huami.watch.health.HeartrateAnalysisActivity"));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                            startActivity(intent);
                            sendHttpResponse(os, 200, "{\"status\":\"ok\",\"action\":\"heartrate_opened\"}");
                        } catch (Exception e) {
                            sendHttpResponse(os, 500, "{\"error\":\"" + e.getMessage() + "\"}");
                        }
                    } else if ("/launcher".equals(path)) {
                        triggerLauncher();
                        sendHttpResponse(os, 200, "{\"status\":\"launcher_opened\"}");
                    } else if ("/touch".equals(path)) {
                        String action = queryParams.get("action");
                        boolean enable = "enable".equalsIgnoreCase(action) || "1".equals(queryParams.get("enable"));
                        setTouchEnabled(enable);
                        sendHttpResponse(os, 200, "{\"status\":\"touch_" + (enable ? "enabled" : "disabled") + "\"}");
                    } else if ("/wakeup".equals(path)) {
                        wakeScreen();
                        sendHttpResponse(os, 200, "{\"status\":\"woken\"}");
                    } else if ("/watchfaces".equals(path)) {
                        // Scan watchfaces installed on Amazfit Verge
                        StringBuilder sb = new StringBuilder("[");
                        String[] builtIns = new String[]{
                            "Verge Sport Cyber",
                            "Classic Chronograph",
                            "Minimalist Clean",
                            "Active Dashboard Pro",
                            "Marathon Pace",
                            "Eternity Analog"
                        };
                        for (int i = 0; i < builtIns.length; i++) {
                            if (i > 0) sb.append(",");
                            sb.append("{\"id\":\"wf-sys-").append(i + 1)
                              .append("\",\"name\":\"").append(builtIns[i])
                              .append("\",\"source\":\"system\",\"applied\":").append(i == 0 ? "true" : "false")
                              .append("}");
                        }
                        try {
                            File wfDir = new File("/sdcard/WatchFace");
                            if (wfDir.exists() && wfDir.isDirectory()) {
                                File[] customFiles = wfDir.listFiles();
                                if (customFiles != null) {
                                    int customIdx = 1;
                                    for (File f : customFiles) {
                                        if (f.getName().endsWith(".wfz") || f.getName().endsWith(".apk")) {
                                            String cleanName = f.getName().replace(".wfz", "").replace(".apk", "");
                                            sb.append(",{\"id\":\"wf-cust-").append(customIdx++)
                                              .append("\",\"name\":\"").append(cleanName)
                                              .append("\",\"source\":\"custom\",\"filename\":\"").append(f.getName())
                                              .append("\",\"applied\":false}");
                                        }
                                    }
                                }
                            }
                        } catch (Exception ignored) {}
                        sb.append("]");
                        sendHttpResponse(os, 200, "{\"status\":\"ok\",\"watchfaces\":" + sb.toString() + "}");
                    } else if ("/watchface".equals(path) || "/setwatchface".equals(path)) {
                        String faceName = queryParams.get("name");
                        if (faceName == null) faceName = queryParams.get("face");
                        if (faceName != null) {
                            try {
                                Intent intent = new Intent("com.huami.watch.action.CHANGE_WATCH_FACE");
                                intent.putExtra("watch_face_name", faceName);
                                sendBroadcast(intent);
                            } catch (Exception e) {
                                Log.e(TAG, "Error switching watch face", e);
                            }
                        }
                        sendHttpResponse(os, 200, "{\"status\":\"applied\",\"watchface\":\"" + faceName + "\"}");
                    } else {
                        sendHttpResponse(os, 404, "{\"error\":\"not_found\",\"path\":\"" + path + "\"}");
                    }

                    os.flush();
                    client.close();
                } catch (Exception e) {
                    Log.e(TAG, "Error handling client", e);
                }
            }
        }).start();
    }

    private void sendHttpResponse(OutputStream os, int code, String json) throws Exception {
        byte[] bytes = json.getBytes("UTF-8");
        String header = "HTTP/1.1 " + code + " OK\r\n" +
                "Access-Control-Allow-Origin: *\r\n" +
                "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
                "Access-Control-Allow-Headers: Content-Type\r\n" +
                "Content-Type: application/json; charset=utf-8\r\n" +
                "Content-Length: " + bytes.length + "\r\n" +
                "Connection: close\r\n\r\n";
        os.write(header.getBytes("UTF-8"));
        os.write(bytes);
    }

    private void wakeScreen() {
        try {
            Runtime.getRuntime().exec("input keyevent KEYCODE_WAKEUP");
        } catch (Exception e) {
            Log.e(TAG, "Error waking screen", e);
        }
    }

    private void triggerLauncher() {
        wakeScreen();
        try {
            Intent intent = new Intent();
            intent.setComponent(new ComponentName("com.huami.watch.newsport", "com.huami.watch.newsport.ui.SportLauncherActivity"));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error starting SportLauncherActivity", e);
        }
    }

    private Parcelable createSportInitConfig(int sportType) {
        ClassLoader cl = null;
        try {
            Context ctx = createPackageContext("com.huami.watch.newsport",
                    Context.CONTEXT_INCLUDE_CODE | Context.CONTEXT_IGNORE_SECURITY);
            cl = ctx.getClassLoader();
            Log.i(TAG, "Loaded ClassLoader via createPackageContext");
        } catch (Exception e) {
            Log.w(TAG, "createPackageContext failed: " + e.getMessage());
        }

        if (cl == null) {
            try {
                cl = new dalvik.system.PathClassLoader("/system/app/NewWearSport/NewWearSport.apk", getClassLoader());
                Log.i(TAG, "Loaded ClassLoader via PathClassLoader");
            } catch (Exception e) {
                Log.e(TAG, "PathClassLoader failed: " + e.getMessage());
                return null;
            }
        }

        try {
            Class<?> builderCls = cl.loadClass("com.huami.watch.newsport.common.model.SportInitConfig$Builder");
            Object builder = builderCls.newInstance();
            Method setSportType = builderCls.getMethod("setSportType", int.class);
            setSportType.invoke(builder, sportType);
            Method createMethod = builderCls.getMethod("create");
            Parcelable config = (Parcelable) createMethod.invoke(builder);
            Log.i(TAG, "Successfully constructed SportInitConfig for sport type: " + sportType);
            return config;
        } catch (Exception e) {
            Log.e(TAG, "Error constructing SportInitConfig via reflection", e);
            return null;
        }
    }

    private void triggerSport(int sportCode, boolean direct) {
        wakeScreen();
        Parcelable config = createSportInitConfig(sportCode);
        try {
            Intent intent = new Intent();
            if (direct) {
                // Directly launch workout recording screen
                intent.setComponent(new ComponentName("com.huami.watch.newsport", "com.huami.watch.newsport.ui.SportActivity"));
            } else {
                // Launch GPS Search & Preparation screen
                intent.setAction("com.huami.watch.sport.action.SPORT_GPS_SEARCH");
                intent.setPackage("com.huami.watch.newsport");
                intent.setComponent(new ComponentName("com.huami.watch.newsport", "com.huami.watch.newsport.ui.GPSActivity"));
            }

            if (config != null) {
                intent.putExtra("sport_init_config", config);
            }
            intent.putExtra("sport_type", sportCode);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            Log.i(TAG, "Triggered " + (direct ? "SportActivity" : "GPSActivity") + " with sport: " + sportCode + ", config=" + (config != null));
        } catch (Exception e) {
            Log.e(TAG, "Error starting sport activity", e);
        }
    }

    private void setTouchEnabled(boolean enabled) {
        try {
            String cmd = enabled ? "chmod 660 /dev/input/event0" : "chmod 000 /dev/input/event0";
            Runtime.getRuntime().exec(cmd);
            Log.i(TAG, "Set touch input permission: " + cmd);
        } catch (Exception e) {
            Log.e(TAG, "Error setting touch permission", e);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "CompanionService onStartCommand");
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        try {
            if (serverSocket != null) serverSocket.close();
        } catch (Exception ignored) {}
        try {
            if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
        } catch (Exception ignored) {}
        try {
            if (wifiLock != null && wifiLock.isHeld()) wifiLock.release();
        } catch (Exception ignored) {}
        Log.i(TAG, "CompanionService destroyed");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
