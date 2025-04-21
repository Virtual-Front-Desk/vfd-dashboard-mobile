import React from "react";
import { StyleSheet, Image, View } from "react-native";

export default function LogoComponent() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("@/assets/images/vfd-logo.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 20,
    marginTop: 10,
  },
  logo: {
    width: 125,
    height: 100,
    resizeMode: "contain",
  },
});