package br.com.workneo.quickwidget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

public class QuickLaunchWidgetProvider extends AppWidgetProvider {
    private static final String QUICK_LAUNCH_URL =
        "https://andermuchael-glitch.github.io/WORKNEO/?quickLaunch=1";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quick_launch);
            Intent openQuickLaunch = new Intent(Intent.ACTION_VIEW, Uri.parse(QUICK_LAUNCH_URL));
            openQuickLaunch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                context, widgetId, openQuickLaunch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
            views.setOnClickPendingIntent(R.id.quick_launch_button, pendingIntent);
            manager.updateAppWidget(widgetId, views);
        }
    }
}
