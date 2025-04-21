import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import React from "react";
import { router } from "expo-router";

export default function () {
    GoogleSignin.configure({
        scopes: ["https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"],
        webClientId:
            "406346985154-l62ljc6afmnsdhtbfmi5d8bu58j92ajv.apps.googleusercontent.com",
        offlineAccess: true,
    });

    return (
        <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={async () => {
                try {
                    await GoogleSignin.hasPlayServices();
                    await GoogleSignin.signIn();
                    const tokens = await GoogleSignin.getTokens();

                    await AsyncStorage.setItem(
                        "token",
                        tokens.accessToken ?? "",
                    );

                    console.log(tokens);
                    // @ts-ignore
                    router.push("/dashboard");
                } catch (error: any) {
                    console.log(error);
                    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                        // user cancelled the login flow
                    } else if (error.code === statusCodes.IN_PROGRESS) {
                        // operation (e.g. sign in) is in progress already
                    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                        // play services not available or outdated
                    } else {
                        // some other error happened
                    }
                }
            }}
        />
    );
}