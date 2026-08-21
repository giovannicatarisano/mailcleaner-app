package com.mailcleaner.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ImapPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
