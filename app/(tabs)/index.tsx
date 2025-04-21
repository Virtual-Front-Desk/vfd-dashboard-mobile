import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { loginUser } from "../../api";
import { useToast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoogleSignIn from "../../components/GoogleSignIn";
import AzureAuth from "react-native-azure-auth";

const azureAuth = new AzureAuth({
  clientId: "bbe5c996-8368-4985-9c2e-33cfef019698",
});

export default function TabLoginScreen() {
  const toast = useToast();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        // @ts-ignore
        router.push("/dashboard");
      }
    };

    checkToken();
  }, []);

  const handleUserLogin = async () => {
    if (email === "" || password === "") {
      toast.show("Please fill in all fields", {
        type: "danger",
      });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.show("Please enter a valid email address", {
        type: "danger",
      });
      return;
    }

    const response = await loginUser({ email, password });
    if (response.token) {
      toast.show("Login successful", {
        type: "success",
      });
      await AsyncStorage.setItem("token", response.token);
      // @ts-ignore
      router.push("/dashboard");
    } else {
      toast.show(response.message, {
        type: "danger",
      });
    }
  };

  const signInMicrosoft = async () => {
    try {
      let tokens = await azureAuth.webAuth.authorize({
        scope: "openid profile User.Read Mail.Read",
      });

      await AsyncStorage.setItem("token", tokens.accessToken ?? "");
      // @ts-ignore
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/vfd-logo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome!</Text>
      <View style={styles.inputContainer}>
        <Icon name="mail-outline" size={25} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(value) => {
            setEmail(value);
          }}
          value={email}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon name="lock-closed-outline" size={25} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={(value) => {
            setPassword(value);
          }}
          value={password}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.divider}>OR</Text>

      <GoogleSignIn />

      <TouchableOpacity style={styles.buttonSso} onPress={signInMicrosoft}>
        <Image
          source={require("@/assets/images/microsoft.png")}
          style={styles.buttonImageIconStyle}
        />
        <View style={styles.buttonIconSeparatorStyle} />
        <Text style={styles.buttonTextStyle}>Sign In With Microsoft</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  logo: {
    height: 70,
    resizeMode: "contain",
    marginBottom: 60,
    marginTop: 50,
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    fontWeight: "bold",
    color: "black",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonSso: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#000000",
    height: 45,
    width: 300,
    borderRadius: 1,
    margin: 10,
  },
  buttonImageIconStyle: {
    margin: 10,
    height: 25,
    width: 25,
    resizeMode: "stretch",
  },
  buttonTextStyle: {
    color: "#000000",
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonIconSeparatorStyle: {
    backgroundColor: "#000000",
    width: 0.5,
    height: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins",
    letterSpacing: 1.5,
  },
  divider: {
    fontSize: 18,
    color: "black",
    marginBottom: 20,
    fontWeight: "bold",
  },
});