package am.ciasoft.poslite;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CiaEscPosPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
