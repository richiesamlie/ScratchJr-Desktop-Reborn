# Proguard rules for ScratchJr Android

# Keep JavascriptInterface annotations and methods
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep our native bridge and model classes
-keep class org.scratchjr.android.bridge.** { *; }
-keep class org.scratchjr.android.database.** { *; }
