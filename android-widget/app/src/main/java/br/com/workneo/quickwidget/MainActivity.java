package br.com.workneo.quickwidget;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String QUICK_LAUNCH_URL =
        "https://andermuchael-glitch.github.io/WORKNEO/?quickLaunch=1";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(18, 38, 73));
        getWindow().setNavigationBarColor(Color.rgb(18, 38, 73));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(28, 32, 28, 32);
        root.setBackgroundColor(Color.rgb(242, 247, 255));

        TextView title = new TextView(this);
        title.setText("WORKNEO");
        title.setTextColor(Color.rgb(20, 49, 91));
        title.setTextSize(28);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        root.addView(title, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView description = new TextView(this);
        description.setText("Lançamento rápido na lista\n\nAdicione o widget à tela inicial para cadastrar itens com menos toques. A lista, a cor e o número do pedido ficam lembrados entre lançamentos.");
        description.setTextColor(Color.rgb(74, 98, 132));
        description.setTextSize(16);
        description.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams descParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        descParams.setMargins(0, 20, 0, 28);
        root.addView(description, descParams);

        Button open = new Button(this);
        open.setText("ABRIR LANÇAMENTO RÁPIDO");
        open.setTextColor(Color.WHITE);
        open.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(28, 105, 232)));
        open.setOnClickListener(v -> startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(QUICK_LAUNCH_URL))));
        root.addView(open, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView steps = new TextView(this);
        steps.setText("Para adicionar o widget: mantenha pressionada uma área vazia da tela inicial → Widgets → WORKNEO · Lançamento rápido.");
        steps.setTextColor(Color.rgb(91, 111, 143));
        steps.setTextSize(13);
        steps.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams stepParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        stepParams.setMargins(0, 28, 0, 0);
        root.addView(steps, stepParams);

        setContentView(root);
    }
}
