plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "org.scratchjr.android"
    compileSdk = 36

    defaultConfig {
        applicationId = "org.scratchjr.android"
        minSdk = 24
        targetSdk = 36
        // Unified release line: 2.1.1 ships as 20101 across Desktop, Android, and Web.
        versionCode = 20101
        versionName = "2.1.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("release") {
            val keyStorePath = System.getenv("ANDROID_KEYSTORE_FILE")
            if (!keyStorePath.isNullOrEmpty() && file(keyStorePath).exists()) {
                storeFile = file(keyStorePath)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS")
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            val keyStorePath = System.getenv("ANDROID_KEYSTORE_FILE")
            if (!keyStorePath.isNullOrEmpty() && file(keyStorePath).exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // AGP 9 built-in Kotlin: compiler options via the kotlin extension
    // (kotlinOptions was removed in AGP 9).
    kotlin {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.webkit)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.ktx)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.test.core)
}
